---
title: 'BLE OTA Upgrade Pitfalls: UUIDs, GATT Handles, and the Platform Differences Between iOS, HarmonyOS, and Android'
description: 'A complete record of debugging BLE OTA in a WeChat Mini Program built with Taro: plaintext frames sharing one characteristic with the AES/JSON business channel, stale iOS GATT handles, unreliable HarmonyOS platform fields, Android MTU negotiation, write with and without response, and the timing traps where one step too early or too late all look the same.'
date: '2026-11-06'
image: /images/covers/ble-ota-upgrade-pitfalls.jpg
tags:
  - BLE
  - OTA
  - WeChat Mini Program
  - Taro
  - GATT
  - Cross-platform
category: Frontend
draft: false
---

## Intro: The business channel has always been solid, so why is OTA so hard

From November 3 to November 6, 2026, I spent almost every hour of those four days fighting a BLE sub-firmware.

Up to that point the device's business channel had been completely stable: the Mini Program sends JSON over BLE, the payload is encrypted with AES-128-ECB, the device replies in the same format, and notifications, fragmentation and acknowledgements all worked. OTA is a different animal entirely — once the device enters FlashBoot, the very same GATT characteristic switches to plaintext binary frames starting with `A5 5A`: no encryption, no JSON.

And the upgrade is not as simple as "push the file over":

- The device must first receive `ota_start` while still running the normal firmware, finish its pre-work (persisting state, muting audio, the TWS re-check), and only then reply `ota_start_ack`.
- After replying `ok` the device disconnects on purpose, then comes back online as FlashBoot.
- FlashBoot does not guarantee the advertising identifiers of normal mode, so the reconnect can only rely on the `deviceId` saved before the upgrade started.
- Even after connecting you cannot send data immediately: the notification subscription has to be genuinely ready, then you wait for the boot's `0x10` advertisement, then you fill in the data segment by segment as its `0x50` requests ask for it.
- After the transfer you must reconnect to the normal firmware, read `firmwareVer` and compare the version — only then has the upgrade really succeeded.

On top of that, iOS, HarmonyOS and Android each have their own temperament about BLE caching, GATT handles and write modes. The same "connection succeeded" on iOS may only mean a connection handle was obtained while the notification path was never established. The same "write succeeded" under write-without-response only means the data was handed to the protocol stack, not that the device received it.

This article does not restate the full protocol. It takes the pitfalls we hit and splits them by topic: identity, UUIDs, handles, write modes, timing, MTU, the "no response" case, and performance. For each one I write down how we finally diagnosed it and what we landed on, so the next person doing BLE OTA loses a few fewer days.

## 1. Get the overall sequence straight first

The whole flow compresses into this chain:

```text
Normal firmware (JSON + AES)
  │
  ├─ ota_start(moduleId)
  │    ├─ ota_start_ack: fail → show error_code / msg, stop
  │    ├─ ota_start_ack: ok   → wait for the device to disconnect
  │    └─ disconnected before any ACK → treat as already in FlashBoot
  │
  ▼
FlashBoot (A5 5A plaintext binary)
  │
  ├─ reconnect with the deviceId saved before the upgrade (no re-scan)
  ├─ wait until the notify subscription is genuinely ready
  ├─ boot advertises 0x10 → APP answers with a query frame
  ├─ device requests 0x50 [offset, len] → APP fills in data with 0x51
  └─ device reports status 0x20 → APP acknowledges with 0x21
  │
  ▼
Reconnect normal firmware → say hi again → read the target module's firmwareVer → only a match counts as success
```

There is one key mental model here: **OTA is a device-pull model, not an APP-push model**.

The APP does not decide which segment goes first or how long it is. The device tells the APP through `0x50`: "give me the segment at this offset, of this length", and the APP answers with `0x51`. That single fact drives many later decisions:

- A failed write or a lost packet does not need a blind retransmit from the APP — the device will simply request that offset again.
- If the APP retransmits on its own, it can produce duplicate frames and scramble the boot's stream parsing.
- "Write callback succeeded" is not "the device received it". The real acknowledgement is the device's next `0x50` request.
- The throughput bottleneck is usually the device writing to flash, not the phone.

Also, the OTA `moduleId` comes from the `modules` list the device reports in `device_config`. If the device reports no modules, or the module number is taken wrongly, the flow cannot even start. This step looks trivial, but during integration testing it is very often the first scene of the crime behind "I pressed the button and nothing happened".

## 2. Pitfall 1: one characteristic, two protocols

### 2.1 Business is JSON + AES, OTA is A5 5A plaintext

The data on the business link looks like this:

```text
JSON → AES-128-ECB → encrypted bytes → write to characteristic
device notification → encrypted bytes → AES decrypt → reassemble JSON → dispatch by cmd
```

The data on the OTA link looks like this:

```text
A5 5A 12 <cmd> <frame length, LE 2 bytes> <data> <checksum>
```

Both share the same GATT characteristic and the device will never tell you "the OTA protocol is active now". The APP has to infer it from the frame header: first byte `0xA5`, second byte `0x5A` means handle it as a raw OTA frame, otherwise keep doing AES decryption and JSON reassembly.

We added a `_otaRawSink` bypass inside `ble_manager`:

```ts
// During an OTA session, hand the raw notify bytes straight to the OTA
// module and skip AES decryption and JSON reassembly; OTA frames are
// plaintext and going through decryption is guaranteed to fail.
if (_otaRawSink) {
  _otaRawSink(chunk)
  return
}
```

This bypass has to be session-scoped: install it only while an OTA runs, and release it unconditionally on finish, failure and every exception path. Otherwise all business notifications get poured into a callback that has already ended, the page receives nothing from the device, and the only way back is a reconnect. We eventually moved the release into a single `finish()` that every exit path goes through.

### 2.2 Frame length and checksum: do not read it as "data length"

There are a few places in the Actions frame format that are easy to get wrong:

```text
A5 5A 12 <cmd> <frame length, LE 2 bytes> <data...> <checksum>

frame length = total bytes of the whole frame (header, cmd, length field and checksum included)
data length  = frame length - 7
checksum     = (0x100 - sum of every byte except the checksum itself) & 0xFF
```

"Frame length" is not the length of `data`, it is the length of the whole frame. In a first implementation, filling it with the data length makes the device reject the frame outright.

During integration, anchor on the demo constants and compare byte by byte:

```text
query  A5 5A 12 11 10 00 01 00 00 00 00 00 00 00 00 CD
ack    A5 5A 12 21 10 00 00 00 00 00 00 00 00 00 00 BE
```

If those two frames do not match the demo, do not suspect the device first — check the frame length and the checksum.

### 2.3 Bytes are not strings: the AES UTF-8 trap

We kept a "encrypted query frame" probe around to verify whether the device decrypts first and then recognizes the OTA frame, or recognizes the plaintext directly. Writing that probe led us into a very subtle trap:

`crypto-js`'s `AES.encrypt(plainText, key)` parses a string as UTF-8. OTA frames contain bytes above `0x7F` such as `0xA5` and `0x5A`; if you convert them into a string before encrypting, each one gets encoded as two bytes and the original frame structure is destroyed.

The correct approach is to go through `WordArray` / hex and encrypt by byte:

```ts
const plainHex = Array.from(bytes)
  .map((b) => b.toString(16).padStart(2, '0'))
  .join('')

const encrypted = AES.encrypt(encHex.parse(plainHex), encUtf8.parse(KEY), {
  mode: ECB,
  padding: Pkcs7,
})
```

The lesson here is not limited to OTA: **whenever the payload is binary, do not use string APIs to encrypt, concatenate or compare it**. `A5` is not the characters `A5`, it is the byte `0xA5`.

## 3. Pitfall 2: deviceId is not the device's identity

### 3.1 A MAC on Android, a UUID on iOS

The `deviceId` returned by WeChat's `onBluetoothDeviceFound` means something completely different depending on the platform:

| Platform  | What `deviceId` actually is                  | Can it be persisted                                             |
| --------- | -------------------------------------------- | --------------------------------------------------------------- |
| Android   | The device MAC address                       | Fairly stable, but still not a good business-level unique key   |
| iOS       | A UUID assigned by the system                | **No.** Stable within a session, may change across phones/scans |
| HarmonyOS | Varies by system and model, never assume MAC | **No.**                                                         |

We too started out thinking "save the `deviceId` and connect straight to it next time". On Android that may work by luck; on iOS it breaks for sure: the user switches phones, or the system reassigns the UUID, and the saved `deviceId` points at a device that does not exist.

The identity that can genuinely be persisted is the SN inside the advertising data. The device advertises as:

```text
bytes 0-1: company identifier 'FC'
bytes 2-3: channel code '10' / '20'
bytes 4-N: the SN in ASCII
```

Parse the SN while scanning, write it into the business field `device_id`, and use it for list matching, auto-reconnect and cloud binding. `deviceId` is only good for "this particular connection" and never enters any persistent storage.

### 3.2 FlashBoot does not advertise an identity, so reconnection depends on the saved deviceId

Normal firmware carries the `FC` advertisement; FlashBoot does not guarantee it. The protocol says it plainly: FlashBoot may lack the normal-mode `FC20` / SN advertisement, and its name may change too.

So when the device disconnects mid-upgrade, **you must not re-scan and wait for an advertisement** — you can only reconnect directly with the `deviceId` saved before the disconnect. That is exactly why `deviceId`, while unfit for persistence, has to be reliably held for the duration of one OTA session.

For the same reason, the `bootName` returned in `ota_start_ack` is for log cross-checking only, never a connection condition. Several devices may share a name, and names can be changed.

### 3.3 The Bluetooth name is not an identity, and neither is a UUID

Early on we also routed GATT channels by Bluetooth name. We threw all of it away. The reasons are very practical:

- Names are editable and multiple devices can share one.
- FlashBoot's name differs from the normal firmware's.
- A device name carries no business semantics, so using it to decide a channel is bound to go wrong eventually.

We ended up selecting the GATT table by the channel code in the advertisement:

| Channel | Service UUID   | Write characteristic | Notify characteristic | Shape               |
| ------- | -------------- | -------------------- | --------------------- | ------------------- |
| `10`    | `0000ffe0-...` | `0000ffe1-...`       | `0000ffe1-...`        | one char, both ways |
| `20`    | `0000ab00-...` | `0000ab01-...`       | `0000ab03-...`        | write/read split    |

Three concepts also need to stay separate:

- **deviceId**: the connection address handed out by WeChat/the system — a temporary UUID on iOS.
- **service / characteristic UUID**: a type identifier used for GATT addressing, not a device identity.
- **handle**: the 16-bit handle the protocol stack assigns to each GATT attribute internally; iOS caches the UUID → handle mapping.

Matching UUIDs do not imply matching handles. After the main firmware switches to FlashBoot, if the attribute table's declaration order or the CCCD positions change, the same batch of UUIDs may already point at stale handles as far as iOS is concerned. That is the invalidation the next section is about.

One more thing: when a service UUID does not match, do not give up. Our fallback is "iterate every service and reverse-lookup by write-characteristic UUID", which still connects when the firmware's UUIDs and the config table disagree, and saves a lot of effort on the first integration with a new model.

## 4. Pitfall 3: "connection succeeded" on iOS is an illusion

### 4.1 connected = true does not mean you can receive data

`createBLEConnection` succeeding only proves the link is up. iOS discovers services asynchronously, and until `getBLEDeviceServices` / `getBLEDeviceCharacteristics` complete, `notifyBLECharacteristicValueChange` may keep returning:

```text
The handle is invalid (10008)
```

Our first version started sending query frames as soon as it saw `connected` === true. The write callback succeeded, yet the device never replied, and after 30 seconds the session was declared dead. It looked like "the device is not responding", but in reality **the phone had never subscribed to notifications, so every answer from the device landed in a window nobody was listening to**.

We later added an explicit readiness signal, `_notifyReady`: the channel counts as usable only once `notifyBLECharacteristicValueChange` succeeds. The OTA flow no longer waits for `connected`, it waits for `waitNotifyReady()`.

### 4.2 Handle invalidation does not heal itself, and a connection-level reconnect does not help either

On a real device, November 5, 2026, we reconnected to FlashBoot and subscribed to notifications:

- 10 retries × 600 ms, all returning `The handle is invalid`.
- Disconnect and reconnect again, three generations of connections in a row, the handle still invalid.
- Wait a while — it does not heal itself.

That proves the problem is not "not enough retries". iOS caches the main firmware's GATT attribute table per peripheral. FlashBoot has different handles, but the system is still using the old mapping.

We landed on two layers of fallback:

1. **Short retries**: 3 × 600 ms. Observation shows retries basically never succeed, so the window stays short in order to escalate quickly.
2. **Adapter-level rebuild**: `closeBluetoothAdapter → 300ms → openBluetoothAdapter → reconnect → rediscover services → resubscribe`, at most twice, forcing WeChat to discard its session-level GATT cache.

To be honest, the adapter rebuild is not a silver bullet either. The iOS system-level `bluetoothd` cache is not guaranteed to be cleared by restarting WeChat. If error 10008 still appears after two rebuilds, there is nothing left to do from the Mini Program side and the fix has to come from the firmware:

- Align the GATT attribute tables of the main firmware and FlashBoot (same declaration order, matching value/CCCD handles).
- Or implement the GATT Database Hash (`0x2B2A`) / Service Changed (`0x2A05`) so iOS re-discovers services on its own.

We spelled this chain out in the error message, so whoever reads it next does not assume "the Mini Program just did not retry enough".

### 4.3 Picking the notify characteristic: properties matter more than UUID

An even subtler trap: the notify characteristic UUID matches, but that characteristic has no `notify` / `indicate` property at all, or has no CCCD. Subscribing to such a characteristic on iOS produces the same `The handle is invalid`.

So do not search by UUID only — check the properties:

```ts
const canNotify = (c) => !!(c.properties?.notify || c.properties?.indicate)

const uuidMatch = chars.find((c) => c.uuid.toLowerCase() === channel.notifyCharId.toLowerCase())
const notifyChar =
  (uuidMatch && canNotify(uuidMatch) ? uuidMatch : undefined) ||
  chars.find(canNotify) ||
  uuidMatch ||
  writeChar
```

The priority is: UUID matches and supports notify → any characteristic that supports notify → UUID matches but properties do not (log a warning) → the write characteristic itself (to support the single-characteristic bidirectional shape).

This matters most on devices where write and notify are split. Write characteristic and notify characteristic are not the same object; pick the wrong one and the symptom is "I can write but I can never receive".

### 4.4 Log the subscription even when it succeeds

On Android and HarmonyOS, "subscribed but no data arrives" and "subscription failed" look identical from the business layer: the device never replies.

If the log only says "connected", there is no way to tell whether the device never sent or the phone never listened. So a successful subscription must leave one line behind:

```text
[BleManager] notification subscription succeeded (attempt 1) service=... char=...
```

That single line saved us many times later on.

## 5. Pitfall 4: write with response vs write without response

### 5.1 What actually differs between the two write modes

BLE has two write operations:

| Write mode              | Waits for the ATT response | Characteristics                                                                                                                              |
| ----------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `write` (with response) | yes                        | every write waits for the device's ATT response; throughput is bounded by the connection interval, but the protocol layer confirms delivery  |
| `writeNoResponse`       | no                         | fast, hands the data to the stack and returns, but packets can vanish silently and a success callback does not mean the device received them |

WeChat's `writeBLECharacteristicValue` takes a `writeType` parameter. Omit it and each platform picks its own default: Android prefers write-without-response, iOS prefers write-with-response. That default is unnoticeable for small business commands, but on an OTA firmware of several MB it turns into a several-fold difference in total time.

### 5.2 Decide by the capability the device declares, not by the operating system

We first wanted to branch on `platform`: write-without-response on Android, write-with-response on iOS. That turned out to be a dead end, for two reasons:

- On HarmonyOS devices the `platform` value WeChat returns does not match the official enum (its own section below).
- Within one platform, different models and different firmware builds can declare different characteristic properties.

In the end we only look at the write characteristic's `properties.writeNoResponse`:

```ts
const chars = await Taro.getBLEDeviceCharacteristics({
  deviceId,
  serviceId,
})

const wc = chars.characteristics.find((c) => c.uuid.toLowerCase() === writeCharId.toLowerCase())
const noRespSupported = !!wc?.properties?.writeNoResponse
```

If the device declares support, use `writeNoResponse`; if it only declares `write`, use the platform default. When the property query fails we treat it as "supported", because the query itself can fail intermittently and real-device testing showed write-without-response working on most of our target models; if it turns out unsupported, the next layer still has the 10007 fallback and the 3-second watchdog.

### 5.3 iOS error 10007: the failure happens before transmission, so falling back is safe

The first time we passed `writeNoResponse` on iOS we ran into:

```text
10007 / not support
```

The key point is that this failure happens before the data is actually transmitted, so resending the same frame with the platform default write is safe — it cannot produce a duplicate frame. Our handling:

```ts
if (writeType && /10007|not support/i.test(err.message)) {
  writeType = undefined
  writeModeLabel = 'platform default (write-without-response unsupported, fell back automatically)'
  // everything later in this session uses the default write; resend the current frame
  send(frame, label)
}
```

Fall back exactly once and keep using the default write for the rest of the session, instead of failing and retrying on every single frame.

### 5.4 A write-without-response success is not an acknowledgement from the device

This is the easiest call to get wrong.

A success from a write-with-response at least means the device returned an ATT response. A success from a write-without-response only means the data was handed to the protocol stack. Whether the device received it, whether it reached flash, the stack does not know.

So in OTA you cannot treat "write succeeded" as "this packet is done". The real completion signal is the device's next `0x50` request: a new offset means the earlier data was consumed; the same offset requested again means the previous chunk was probably lost.

Precisely because of that, **we do not auto-retransmit after a write timeout**. The device-pull model already fills gaps by offset, and an APP-side retransmit would create duplicate frames and confuse the boot's parsing. A write timeout only fails fast:

```ts
const RAW_WRITE_TIMEOUT = 3000

// Per-piece sentinel: a success that arrives after the timeout must not
// advance the offset any more, otherwise we keep writing to the boot
// after the session has already ended.
let pieceSettled = false
const timer = setTimeout(() => {
  if (pieceSettled) return
  pieceSettled = true
  callback({
    success: false,
    errMsg: `write timed out (no callback within ${RAW_WRITE_TIMEOUT}ms)`,
  })
}, RAW_WRITE_TIMEOUT)
```

### 5.5 An oversized write may never call back at all

iOS has one more documented-but-easily-missed behavior: a write larger than the negotiated MTU may call back neither `success` nor `fail`.

Our write chain advances on `success`. If one packet never calls back, the whole flow stalls there and you just wait for the 30-second death sentence. We added two safeguards:

- a 3-second per-piece watchdog that fails and exits on timeout;
- strict trust in the negotiated MTU, dropping the reverse "MTU too small? then use 240" fallback.

An earlier version had `chunk > 20 ? chunk : 240`, meant to guard against a bad MTU read. The result: if the actual MTU was only 23, writing 240 bytes oversized the write and iOS simply never called back. **A fallback value must never exceed the negotiated value** — counter-intuitive, but an important constraint.

## 6. Pitfall 5: HarmonyOS platform fields are not trustworthy

HarmonyOS was the most unpredictable platform of this whole exercise.

WeChat's official documentation lists `ohos` among the possible values of `getSystemInfoSync().platform`. In practice, on some HarmonyOS devices what you get does not match the docs: sometimes it is not `ohos`, sometimes you simply do not get the expected value at all.

If your code reads:

```ts
if (platform === 'ohos') {
  // HarmonyOS branch
}
```

then that branch may never execute. This is exactly where our first attempt to decide the write mode by platform fell over.

The conclusion: **the platform field is for display and logs only; never use it to branch on a critical capability.** To judge a capability, rely on two harder facts:

1. whether the write characteristic declares `writeNoResponse` (a protocol-layer fact);
2. whether the `setBLEMTU` call succeeds (this API is Android-only, so success proves you are not on iOS).

HarmonyOS has another symptom: the subscription succeeds but no data arrives. From the business layer that is indistinguishable from a failed subscription — in both cases the device looks silent. Which is why the previous section insisted that a successful subscription must be logged.

HarmonyOS also has a trap in the integration channel itself, unrelated to the OTA code:

Measured on October 17, 2026, with one and the same build:

- The "Preview" QR code works on Android, HarmonyOS and iOS alike.
- Under "Real Device Debugging", every HarmonyOS `/app-api` request hangs pending until timeout (the backend had in fact already handled it).
- iOS under "Real Device Debugging" dies at startup with `Maximum call stack size exceeded`.

So do BLE integration with "Preview", never "Real Device Debugging". The diagnostic rule of thumb is simple too:

```text
"[silent login] start" logged but no "request returned"
→ the login response never came back
→ every later step stays blocked
→ symptom: stuck in guest mode, with no /device/bind request at all
```

That is a defect of the debugging channel, not of the business code. If you hit it blind at the start of an integration session, you lose half a day for nothing.

## 7. Pitfall 6: timing — one step early or late is wrong

### 7.1 Taking over the raw channel too early loses ota_start_ack

In the first implementation we took over the raw notify channel before sending `ota_start`. The reasoning was: "the boot pushes `0x10` the moment it comes online, so I must already be listening."

Half right. `ota_start`'s answer, `ota_start_ack`, is a **normal-firmware JSON reply**, not an `A5 5A` frame. Once the raw channel is taken over, JSON bypasses decryption and dispatch and the ACK never arrives. Worse, when the device replies `fail` (say TWS is still connected), we cannot see the error either and just carry on as if "the device disconnected".

The protocol states it plainly: **before the ACK arrives, the APP keeps normal AES/JSON parsing; after `ok`, it waits for the device to disconnect; raw binary parsing is enabled only when reconnecting to FlashBoot.**

The final sequence became:

```text
ota_start (normal channel, AES/JSON)
  → wait for ota_start_ack
  → on ok, keep normal parsing and wait for the disconnect
  → install the raw channel immediately inside the ble_disconnected event
  → auto-reconnect to FlashBoot
```

### 7.2 Taking over too late loses the boot's first frame

The opposite fails as well. If you install the raw channel only after "reconnect succeeded", the boot's first `0x10` frame may already have arrived. Getting no answer, the boot disconnects by itself.

There is an event-ordering detail here too: when `BleManager` receives the disconnect event, it **notifies its listeners first and only then starts the 2-second auto-reconnect**. So the raw channel has to be installed inside the `ble_disconnected` listener, not after a successful reconnect.

```ts
if (msg.cmd === 'ble_disconnected') {
  disconnected = true
  installRawSink() // install the channel first, then wake whoever is waiting
  settleGate({ type: 'disconnected' })
}
```

### 7.3 ota_start needs three-way waiting, not ACK-only

The device can behave in three ways:

1. reply `ota_start_ack` with `status=ok`;
2. reply `ota_start_ack` with `status=fail`, carrying `error_code` and `msg`;
3. send no ACK and disconnect immediately.

So the wait has to handle ACK, disconnect and timeout all at once:

```ts
type OtaStartGate =
  | { type: 'ok' }
  | { type: 'fail'; reason: string }
  | { type: 'disconnected' }
  | { type: 'timeout' }
```

- `fail`: end immediately, show the reason the device gave, do not keep retrying.
- `ok`: wait for the disconnect; if nothing disconnects within 15 seconds, error out.
- Disconnect first: treat as already in boot.
- Timeout: end, and say explicitly "do not retransmit ota_start in a row".

Re-sending `ota_start` repeatedly is genuinely dangerous. The device may already be mid-transition, and a second request pushes it into an unknown state.

### 7.4 The boot's 0x10 advertisement: you cannot skip it, and you cannot answer it carelessly

After reconnecting to FlashBoot, do not fire a query frame straight away. The boot may not be ready and will drop that frame; if you then also de-duplicate the later `0x10` advertisements, the device keeps advertising until the 30-second timeout kills the session.

Our policy:

1. Wait for the boot's `0x10` advertisement and answer it with a query frame.
2. If no advertisement arrives within 1.2 seconds, send one query frame on our own as a fallback.
3. If still not a single OTA frame arrives after that, resend the query every 3 seconds until the first frame shows up.
4. De-duplicate consecutive `0x10` advertisements with an 800 ms window, but **never de-duplicate permanently**.

Why not permanently? Because if the device dropped the first query frame, the boot keeps advertising `0x10`. If the APP decides "I already sent a query" and never answers again, the device waits until the timeout kills it. We reproduced this on an OPPO: it simply burns the full 30 seconds.

Why de-duplicate at all? Because two query frames in quick succession make the boot restart its read sequence. We had two failed upgrades where the device kept requesting offset 0 and the parsing ended up misaligned. The firmware colleague reconstructed the scene as:

```text
0x0A + 0x0958B656 = 0x0958B660
```

In other words, a frame header was mistaken by the boot for a data segment header. The root cause was exactly the duplicate query frames disrupting its stream parsing.

So the de-duplication window has to be "short enough not to restart the sequence, long enough not to miss an answer". 800 ms is the compromise we measured.

## 8. Pitfall 7: MTU negotiation is asynchronous

### 8.1 The 255 you read may not be real

The total OTA transfer time is roughly:

```text
firmware size / bytes per write × time per write
```

Bytes per write directly determines the number of writes. We originally called `getBLEMTU` right after reconnecting, read `255`, and chunked at `255 - 3 = 252`. It turned out the link had actually negotiated `512` — `setBLEMTU` was still negotiating asynchronously and `getBLEMTU` had returned a pre-negotiation value.

The consequence: OTA ran at half bandwidth the whole time, doubling the number of writes and stretching the upgrade for nothing.

The fix is "push to the target first; if setting fails, wait a beat, then read":

```ts
Taro.setBLEMTU({ deviceId, mtu: target })

if (!mtuSetOk) await sleep(200)

const mtu = await Taro.getBLEMTU({ deviceId, writeType: 'write' })
const chunk = Math.min(509, mtu - 3)
```

- `509` is the hard ceiling of the ATT payload; anything larger does not fit.
- The 200 ms wait after a failed `setBLEMTU` covers the case where the reconnect flow is mid-negotiation; if the set succeeded, read immediately.
- `setBLEMTU` is Android-only; on iOS the system negotiates.
- The MTU of normal firmware and FlashBoot may differ, so read it **after connecting to the boot** instead of once before the upgrade and reuse it forever.

### 8.2 A successful setBLEMTU is harder evidence of capability than `platform`

Because `setBLEMTU` only works on Android, we adopted it as the "this is not iOS" test. Success means the current platform supports MTU negotiation; failure does not necessarily mean iOS, it may just mean the current connection does not allow setting.

That is far more reliable than `platform === 'ios'`, because it tests a **capability** rather than a **string**.

### 8.3 Android scanning additionally needs system location

One more classic Android pitfall worth recording: with system location turned off, `startBluetoothDevicesDiscovery` returns success but `onBluetoothDeviceFound` never calls back.

Meaning the code looks like it is scanning while it actually finds nothing. We added a precondition:

```ts
if (sys.platform === 'android' && !sys.locationEnabled) {
  // prompt the user to enable location services
  return
}
```

This one is unrelated to OTA, but provisioning, the device list and auto-reconnect all depend on it, so it deserves its own note.

## 9. Pitfall 8: when the device "does not respond", who exactly is not responding

The OTA flow has one final 30-second kill switch: no valid OTA frame within 30 seconds ends the session.

Behind the surface of "30 seconds of silence" there are at least six completely different causes:

| Symptom                            | Actual cause                                                            | How to tell                                                                     |
| ---------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| write succeeds, device silent      | notify never subscribed / 10008 stale handle                            | look for the "subscription succeeded" line; none means the channel never opened |
| write never calls back             | iOS oversized write / protocol stack wedged                             | check the 3-second per-piece watchdog error                                     |
| device keeps pushing 0x10          | query sent too early and dropped, or de-duplication blocked the answer  | count the 0x10 repeats in the raw log                                           |
| device keeps requesting offset 0   | duplicate query frames restarted the boot's read sequence               | look at the offset series in 0x50                                               |
| device reports 0x0303 read timeout | parsing misaligned earlier and the APP kept answering with empty frames | check the out-of-range offset and the error code                                |
| not a single frame                 | still on the normal firmware; ota_start failed or timed out             | check ota_start_ack and the disconnect events                                   |

This table is one of the most useful outputs of the whole debugging effort. Without raw logs everything looks like "the device is not responding"; with bidirectional hex logging you can finally pin a problem to a specific layer.

### 9.1 Always print the build number

On November 5, 2026 we hit a mixed-build incident: the dialog showed a new build tag, but the notify-wait timeout printed inside the OTA session was still the old value. In other words, the code actually running was not the latest.

After that we print it on the very first line of every OTA session:

```text
OTA session started (build 20261106-1615, notify wait 20s / adapter rebuild)
```

The debug panel also shows the build number directly, so you can confirm you are running the newest package without opening the console. In real-device integration this habit is worth a lot, especially with several phones and several trial builds in play.

### 9.2 write-without-response ≠ device-not-responding

These two phrases get confused constantly:

- "write-without-response" is GATT's `writeNoResponse`, a write mode.
- "device not responding" is the business layer receiving no replies.

A write-without-response success only means the data reached the protocol stack. A silent device may mean the subscription never opened, the boot was not ready, a query frame got dropped, or the parsing misaligned. Separating the two concepts first saves a lot of wandering.

## 10. Pitfall 9: transfer performance and the details that look like device problems

### 10.1 Two log lines per packet cost 3%–13% of the upgrade

Transferring a several-MB firmware takes thousands of round trips. We initially wrote every send and receive log into page state, so each one triggered a `setState` across the bridge — measured at 2–8 ms each, and across 7000+ packets that consumed 3%–13% of total upgrade time.

What we changed:

- progress logs go to `console` only, never into page rendering;
- refresh progress every 25%, at most 6 `setState` calls for the whole transfer;
- summarize in a single dialog after the transfer ends, independent of the rendering chain.

### 10.2 Use three timings to locate the bottleneck

To decide whether the slowness is on the phone or on the device, we sample three intervals in memory:

```text
A = notify arrives → write issued (JS parsing + framing + API call)
B = write issued → write callback success (bridge hop + over the air)
C = previous write success → next notify arrives (device flash write + connection-interval gap)
```

Arithmetic only, no logging and no UI, so the overhead during transfer is negligible. At the end we print once:

```text
per-packet averages (N packets): JS x ms · write y ms · device gap z ms
```

A large A means optimize the phone side. A large B means look at the write mode and connection parameters. A large C usually means the device's flash write is the bottleneck, and no amount of APP-side optimization will help.

### 10.3 Compute speed from bytes actually delivered

If a transfer fails and is interrupted, dividing the total firmware size by the elapsed time gives you a flattering average. We switched to using the largest `off + len` the device ever requested, so even a failed run shows how much really made it across.

### 10.4 Do not truncate the 32-bit offset

In the device's data request, offset is a 4-byte little-endian field:

```ts
const off = (bytes[6] | (bytes[7] << 8) | (bytes[8] << 16) | (bytes[9] << 24)) >>> 0
const reqLen = bytes[10] | (bytes[11] << 8)
```

An early version applied `& 0xffffff`, dropping the high 8 bits. The genuine out-of-range address `0x0958B660` was printed as `0x58B660`, which looked like it was still inside the file and hid the evidence of misaligned parsing.

The correct approach is to keep the full 32 bits and terminate immediately once `off >= firmware.length`:

- In a normal flow the device advances along its own segment structure and never runs past the end of the file.
- An out-of-range offset is always a parsing misalignment.
- Do not answer with an empty frame — it only makes the device wait and retry in vain, ending in a `0x0303` read timeout.

The firmware colleague reconstructed `0x0A + 0x0958B656 = 0x0958B660` from the complete offset, which is what finally identified "frame header mistaken for a data segment header" as the root cause.

### 10.5 Status 0x20 and acknowledgement 0x21

FlashBoot reports status with `0x20`, and the APP must answer every one with `0x21`:

| Status | Meaning              | Follow-up                                     |
| ------ | -------------------- | --------------------------------------------- |
| `0x02` | ready to upgrade     | acknowledge, continue the transfer            |
| `0x05` | no upgrade needed    | acknowledge, reconnect and verify the version |
| `0x06` | boot reports success | acknowledge, wait for reboot, verify version  |
| `0x07` | upgrade failed       | acknowledge, read the error code and report   |

Note that `0x06` only means the boot finished writing — it is not the final success. You must reconnect to the normal firmware, say `hi` again, read the target module's `firmwareVer`, and only show "upgrade successful" when it matches the target version.

The start ACK, having sent the whole file, and the BLE disconnect are none of them evidence of success.

## 11. Retrospective checklist

The whole set of pitfalls compressed into one table:

| Topic         | Conclusion that finally landed                                                                                                                                                                                                        |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Identity      | iOS's `deviceId` is a temporary UUID and must not be persisted; use the SN from the advertisement as the persistent identity; reconnect to the boot with the `deviceId` saved before the upgrade                                      |
| UUIDs         | service / characteristic UUIDs are only GATT addressing; when a service UUID misses, iterate the services and reverse-look-up the write characteristic; the notify characteristic must be chosen by properties, not just UUID         |
| Handles       | `connected=true` ≠ notifications ready; wait for `notifyReady` before sending; 10008 → short retries plus adapter rebuild; the real fix is the firmware aligning the attribute tables or implementing Database Hash / Service Changed |
| Write mode    | choose by `properties.writeNoResponse`, not by platform; fall back once on iOS 10007; a write-without-response success is not a device acknowledgement                                                                                |
| Timing        | keep AES/JSON until the ACK; install the raw channel inside the disconnect event; wait for `0x10` before handshaking; 800 ms de-duplication; retry every 3 seconds until the first frame                                              |
| MTU           | set → wait 200 ms → get; trust the negotiated value, never fall back upward to 240; read it after connecting to the boot                                                                                                              |
| HarmonyOS     | the platform field is unreliable; judge by GATT capabilities and API results; integrate via "Preview", not "Real Device Debugging"                                                                                                    |
| "No response" | the 30-second kill switch is only the last layer; check the subscription logs, raw logs, offset series and build number first                                                                                                         |
| Performance   | process logs to console only; at most 6 setState calls for progress; locate the bottleneck with the A/B/C timings                                                                                                                     |
| Success check | reconnect to the normal firmware and read `firmwareVer`; only a match counts                                                                                                                                                          |

A few problems remain unsolved, and they are recorded here too:

- **iOS's system-level GATT cache**: from the Mini Program side we can only restart the adapter; the `bluetoothd` cache cannot be cleared. The final fix needs the firmware to align its attribute tables, or to implement Database Hash / Service Changed.
- **HarmonyOS model differences**: the `platform` field and write-mode behavior still vary across versions; for now we fall back on "the device declares its capabilities plus runtime logging", and more models need testing.
- **The reliability boundary of write-without-response**: different protocol stacks do not define "success" identically; the only dependable indicator remains the device's next data request.

## Closing thoughts

The deepest takeaway from this OTA work is: **the hard part is not the protocol itself, it is that the state machine crosses two firmware images, two protocols, three platforms and countless layers of caching.**

Normal firmware and FlashBoot are two entirely different GATT attribute tables, two data formats, two sets of error semantics; iOS caches handles, Android negotiates MTU, HarmonyOS's platform field lies; add the device-pull model, duplicate query frames and asynchronous subscriptions, and any step taken one moment too early or too late produces the same single symptom — "the device is not responding".

What actually pulled the problem apart was not more retries but finer observation:

- bidirectional raw logs, to see what the device actually sent;
- subscription-success logs, to separate "it never sent" from "I never listened";
- the build number, to confirm you are running the newest package;
- the offset series, to reveal whether the parsing misaligned;
- the A/B/C timings, to show whether the bottleneck is the phone or the device.

If you are working on BLE OTA, I hope this write-up saves you a few sleepless nights. At the very least, next time you see `The handle is invalid`, consider first that the device is not ignoring you — iOS may still be using the handles of the previous firmware.
