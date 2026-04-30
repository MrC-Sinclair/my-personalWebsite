---
title: 'Building a Unified Payment Abstraction Layer: Integrating WeChat Pay & Alipay with One Codebase'
description: A deep dive into designing a unified payment abstraction layer for UniApp cross-platform mini-programs. Learn how to use Strategy and Adapter patterns to bridge WeChat Pay and Alipay differences, with complete code examples and real-world pitfalls.
date: '2022-03-15'
tags:
  - Payment
  - WeChat Pay
  - Alipay
  - UniApp
  - Architecture Design
  - Abstraction Layer
category: Architecture
draft: false
---

## Introduction: The Nightmare of Multi-Channel Payment Integration

> "WeChat Pay is done. Now I have to write a whole new set for Alipay? And when UnionPay comes along, we'll rewrite everything again?"

This was the exact problem I faced when taking over the "MaiJinTong" gold customization mini-program. The project was built with UniApp and needed to launch on both WeChat and Alipay mini-program platforms. Payment, being the core e-commerce flow, faced a critical challenge: **each platform has its own payment API — different parameter structures, different signing algorithms, different callback mechanisms, and different invocation methods.**

The simplest approach — "write them separately for each platform" — leads to:

- **Code duplication explosion**: 60% of payment logic is nearly identical (order construction, amount validation, result handling), yet forced into two separate files
- **Maintenance cost doubling**: Any payment parameter or business logic change requires modifying both platform implementations
- **New channel integration pain**: Every new payment channel demands a complete new payment flow implementation

This article shares how we designed a **unified payment abstraction layer** in UniApp to seamlessly support both WeChat Pay and Alipay with a single codebase.

## Design Goals

Before writing any code, let's define the abstraction layer's design goals:

1. **Business layer transparency**: Business code shouldn't care whether it's WeChat or Alipay
2. **Single API surface**: One unified `pay()` method for all payment methods
3. **Extensibility**: Adding a new payment channel (UnionPay, H5 payment, etc.) only requires a new adapter
4. **Full lifecycle management**: Covers order creation, signature acquisition, payment invocation, result callback, and status synchronization

## Architecture: Strategy Pattern + Adapter Pattern

The core idea is a combination of the **Strategy Pattern and Adapter Pattern**:

```
Business Layer
      │
      ▼
IUnifiedPayment Interface  ←── Strategy: selects implementation based on platform
      │
      ├── WechatPayAdapter
      └── AlipayAdapter
```

- **IUnifiedPayment**: Defines the unified payment behavior interface
- **WechatPayAdapter / AlipayAdapter**: Encapsulate platform-specific payment logic, implementing the interface
- **PaymentService**: The outward-facing unified payment service that automatically selects the correct adapter

### Defining the Unified Payment Interface

```typescript
// types/payment.ts

/** Unified order model */
export interface UnifiedOrder {
  orderNo: string
  totalAmount: number      // Amount in cents (smallest unit)
  subject: string          // Product title
  body?: string            // Product description
  attach?: string          // Extra data (returned unchanged in callbacks)
  timeoutMinutes?: number  // Payment timeout
}

/** Payment configuration */
export interface PaymentConfig {
  order: UnifiedOrder
  wxPaySign?: WechatPaySignData
  aliPaySign?: AlipaySignData
}

/** Payment result */
export interface PaymentResult {
  success: boolean
  errMsg?: string
  resultCode?: string
  tradeNo?: string
}

/** Unified payment abstraction */
export interface IUnifiedPayment {
  /** Get payment parameters from server */
  getPayParams(order: UnifiedOrder): Promise<PaymentConfig>

  /** Invoke the platform payment dialog */
  requestPayment(params: PaymentConfig): Promise<PaymentResult>

  /** Query payment result */
  queryPayment(orderNo: string): Promise<PaymentResult>
}
```

### Why a Unified Order Model?

Because WeChat Pay and Alipay have drastically different parameter structures:

| Field | WeChat Pay | Alipay |
| --- | --- | --- |
| Amount Unit | Cents (integer) | Yuan (float) |
| Order ID Field | `out_trade_no` | `out_trade_no` |
| Product Description | `body` | `subject` |
| Signing Algorithm | MD5 / HMAC-SHA256 | RSA2 |
| Callback Parameter | `notify_url` | `notify_url` |

Using `UnifiedOrder` to describe payment orders uniformly, with each adapter handling parameter conversion internally, means the business layer only ever interacts with `UnifiedOrder`.

## Implementation

### WeChat Pay Adapter

```typescript
// services/payment/wechat-pay-adapter.ts

import type { IUnifiedPayment, UnifiedOrder, PaymentConfig, PaymentResult } from '@/types/payment'

export class WechatPayAdapter implements IUnifiedPayment {
  async getPayParams(order: UnifiedOrder): Promise<PaymentConfig> {
    try {
      const res = await uni.request({
        url: '/api/wechat/order/create',
        method: 'POST',
        data: {
          outTradeNo: order.orderNo,
          totalFee: order.totalAmount,     // WeChat uses cents
          body: order.subject,
          attach: order.attach,
          timeExpire: order.timeoutMinutes
        }
      })

      const { data } = res.data as { data: PaymentConfig }
      return data
    } catch (err) {
      console.error('[WechatPay] Failed to get payment params:', err)
      throw err
    }
  }

  async requestPayment(params: PaymentConfig): Promise<PaymentResult> {
    return new Promise((resolve) => {
      uni.requestPayment({
        provider: 'wxpay',
        timeStamp: params.wxPaySign?.timeStamp || '',
        nonceStr: params.wxPaySign?.nonceStr || '',
        package: params.wxPaySign?.package || '',
        signType: params.wxPaySign?.signType || 'MD5',
        paySign: params.wxPaySign?.paySign || '',
        success: (res) => {
          resolve({
            success: true,
            resultCode: res.errMsg,
            tradeNo: params.tradeNo
          })
        },
        fail: (err) => {
          resolve({
            success: false,
            errMsg: err.errMsg
          })
        }
      })
    })
  }

  async queryPayment(orderNo: string): Promise<PaymentResult> {
    const res = await uni.request({
      url: '/api/wechat/order/query',
      method: 'POST',
      data: { outTradeNo: orderNo }
    })
    const { data } = res.data as { data: PaymentResult }
    return data
  }
}
```

### Alipay Adapter

```typescript
// services/payment/alipay-adapter.ts

import type { IUnifiedPayment, UnifiedOrder, PaymentConfig, PaymentResult } from '@/types/payment'

export class AlipayAdapter implements IUnifiedPayment {
  async getPayParams(order: UnifiedOrder): Promise<PaymentConfig> {
    try {
      const res = await uni.request({
        url: '/api/alipay/order/create',
        method: 'POST',
        data: {
          outTradeNo: order.orderNo,
          totalAmount: (order.totalAmount / 100).toFixed(2), // Alipay uses yuan
          subject: order.subject,
          body: order.body || order.subject,
          attach: order.attach,
          timeExpire: order.timeoutMinutes
        }
      })

      const { data } = res.data as { data: PaymentConfig }
      return data
    } catch (err) {
      console.error('[Alipay] Failed to get payment params:', err)
      throw err
    }
  }

  async requestPayment(params: PaymentConfig): Promise<PaymentResult> {
    return new Promise((resolve) => {
      uni.requestPayment({
        provider: 'alipay',
        orderInfo: params.aliPaySign?.orderInfo || '',
        success: (res) => {
          // Note: Alipay's success callback only means the alipay app was opened
          resolve({
            success: true,
            resultCode: res.resultCode,
            tradeNo: params.tradeNo
          })
        },
        fail: (err) => {
          resolve({
            success: false,
            errMsg: err.errMsg
          })
        }
      })
    })
  }

  async queryPayment(orderNo: string): Promise<PaymentResult> {
    const res = await uni.request({
      url: '/api/alipay/order/query',
      method: 'POST',
      data: { outTradeNo: orderNo }
    })
    const { data } = res.data as { data: PaymentResult }
    return data
  }
}
```

### Unified Payment Service

```typescript
// services/payment/index.ts

import { WechatPayAdapter } from './wechat-pay-adapter'
import { AlipayAdapter } from './alipay-adapter'
import type { IUnifiedPayment, UnifiedOrder, PaymentResult } from '@/types/payment'

/**
 * Unified Payment Service
 * Automatically selects the correct adapter based on the current platform.
 * Business code only calls pay() — it never needs to know the underlying platform.
 */
export class PaymentService {
  private adapter: IUnifiedPayment | null = null

  constructor() {
    this.initAdapter()
  }

  private initAdapter() {
    // #ifdef MP-WEIXIN
    this.adapter = new WechatPayAdapter()
    // #endif

    // #ifdef MP-ALIPAY
    this.adapter = new AlipayAdapter()
    // #endif
  }

  /** Initiate payment: the only method the business layer ever calls */
  async pay(order: UnifiedOrder): Promise<PaymentResult> {
    if (!this.adapter) {
      throw new Error('Payment not supported on this platform')
    }

    // Step 1: Get payment parameters from server
    const params = await this.adapter.getPayParams(order)

    // Step 2: Invoke the platform payment dialog
    const result = await this.adapter.requestPayment(params)

    // Step 3: Query the final payment status from server
    if (result.success) {
      return await this.adapter.queryPayment(order.orderNo)
    }

    return result
  }
}

/** Singleton export */
export const paymentService = new PaymentService()
```

### Business Layer Usage

```typescript
import { paymentService } from '@/services/payment'
import type { UnifiedOrder } from '@/types/payment'

async function handlePay() {
  const order: UnifiedOrder = {
    orderNo: '2026031512345678',
    totalAmount: 9900, // $99.00, always in cents
    subject: '24K Gold Bracelet - 3g',
    body: '24K Gold Classic Bracelet 3g No: GD20260315001',
    attach: JSON.stringify({ userId: 'u123', couponId: 'c456' })
  }

  // Business layer only calls pay() — no platform awareness needed
  const result = await paymentService.pay(order)

  if (result.success) {
    uni.showToast({ title: 'Payment Successful', icon: 'success' })
    uni.navigateTo({ url: `/pages/order/detail?orderNo=${order.orderNo}` })
  } else if (result.errMsg?.includes('cancel')) {
    uni.showToast({ title: 'Payment Cancelled', icon: 'none' })
  } else {
    uni.showToast({ title: `Payment Failed: ${result.errMsg}`, icon: 'none' })
  }
}
```

## Pitfalls & Lessons Learned

### Pitfall 1: Amount Unit Mismatch

WeChat Pay uses **cents** (integer), while Alipay uses **yuan** (float with two decimal places).

```typescript
// Wrong: passing raw amount through
const totalAmount = order.totalAmount // ❌ WeChat wants cents, Alipay wants yuan!

// Correct: adapter handles unit conversion internally
// WeChat adapter: pass cents directly
totalFee: order.totalAmount

// Alipay adapter: convert cents to yuan
totalAmount: (order.totalAmount / 100).toFixed(2)
```

**Lesson**: Store amounts in cents within the unified order model. Each adapter handles unit conversion internally — never let the business layer be aware of this difference.

### Pitfall 2: The "False Success" Callback

```typescript
// WeChat Pay
// The success callback doesn't always mean "final success"
// User enters correct password → success returned
// But the backend may later fail due to insufficient balance

// Alipay
// The success callback only means "the Alipay app was successfully launched"
// The user may not have completed the payment before returning
```

**Solution**: After the payment dialog callback, always call a **server-side order query** to confirm the final payment status.

```typescript
// Step 3 in the PaymentService
if (result.success) {
  // Actively query server for final order status
  return await this.adapter.queryPayment(order.orderNo)
}
```

### Pitfall 3: Server-Side Signing Differences

WeChat Pay mini-programs use a **prepay_id** mechanism:
1. Frontend requests order placement → server returns `prepay_id`
2. Frontend performs a second signature with `prepay_id` + timestamp + `nonceStr`
3. Call `uni.requestPayment`

Alipay mini-programs are simpler:
1. Frontend requests `orderInfo` string from server
2. Pass it directly to `uni.requestPayment`
3. All signing is done server-side

**Solution**: Have each server-side endpoint return the complete parameter bundle needed by its respective platform. The frontend only handles the three-step flow: "get params → invoke payment → query result" and never participates in signing logic.

### Pitfall 4: Sandbox Environment Switching

During development, sandbox environments are needed, but WeChat and Alipay configure them completely differently:

- **WeChat**: Uses sandbox merchant ID + sandbox secret key, obtain signatures through sandbox API
- **Alipay**: Uses sandbox app ID + sandbox account, the returned `orderInfo` works directly with the sandbox payment

**Solution**: The server automatically switches between sandbox and production environments based on request headers or global configuration, while keeping the API data structure identical. The frontend requires no special handling.

## Results

After introducing the unified payment abstraction layer, the payment module showed clear improvements:

| Metric | Before | After | Improvement |
| --- | --- | --- | --- |
| **Payment code volume** | WeChat 420 lines + Alipay 450 lines | ~300 lines total | **65% reduction** |
| **New channel integration time** | ~3-4 days | ~0.5 days | **6x+ efficiency gain** |
| **Payment flow bug rate** | 8 payment issues across both platforms | 0 payment bugs in 6 months | **Dramatically reduced** |
| **Business payment code duplication** | 2 complete parallel implementations | 1 call + 2 adapters | **Eliminated** |

## Conclusion

The essence of a unified payment abstraction layer is **using design patterns to bridge platform differences**. Its core value isn't just about reducing code volume (though it certainly does that), but about:

1. **Separation of concerns**: The business layer cares about "what to pay," while adapters care about "how to pay"
2. **Improved testability**: Adapters can be independently mocked and tested
3. **Guaranteed extensibility**: Adding UnionPay requires only a new `UnionPayAdapter` implementing `IUnifiedPayment`
4. **Error isolation**: All payment-related issues are handled within adapters, keeping business error handling logic uniform

> The ultimate goal of designing a payment abstraction layer isn't to make the code look more "elegant" — it's to ensure that when the business iterates rapidly, no one on the team has to worry about payment channel differences. Every line of abstraction is an investment in changing fewer files during the next business change.

If you're building cross-platform mini-programs and facing multi-channel payment integration, I hope this article provides a practical, implementable reference solution.
