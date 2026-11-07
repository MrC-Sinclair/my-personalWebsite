#!/usr/bin/env bash
# ============================================================
# 一键部署：在轻量云实例本机执行，把 CI 的 Release 产物覆盖到 Caddy web 根
# ------------------------------------------------------------
# 为什么脚本要跑在服务器上，而不是从开发机推过去：
#   - 实例上 github.com:443 不通（git pull / 直连下载必失败），但 api.github.com、
#     codeload.github.com、objects.githubusercontent.com 可达；
#   - 实例没有部署用的 SSH 私钥，本机 scp 会 Permission denied，只能由实例自己拉产物；
#   - 2C2G 上跑 pnpm generate（1048 条预渲染）要 30+ 分钟且内存吃紧，产物只能由
#     GitHub Actions 生成。本脚本不构建，只做「取产物 + 校验 + 搬运 + 验证」。
#
# 用法（在实例上）：
#   bash /usr/local/bin/deploy-site                       # 拉最新 cvm-latest 资产并部署
#   bash /usr/local/bin/deploy-site --dry-run            # 只打印将做什么，不改文件
#   bash /usr/local/bin/deploy-site --from /tmp/site-x   # 用本地已解压产物，跳过下载
#   bash /usr/local/bin/deploy-site /style/x/blog/y/     # 额外探测一个路径
#
# 首次安装（实例上；走 api.github.com 的单文件 raw 接口，无需克隆整个仓库）：
#   wget -q -O /usr/local/bin/deploy-site \
#     --header='Accept: application/vnd.github.raw' \
#     https://api.github.com/repos/MrC-Sinclair/my-personalWebsite/contents/scripts/deploy-site.sh
#   chmod 755 /usr/local/bin/deploy-site
#
# 注意：真实 web 根取自 /etc/caddy/Caddyfile 的 `root * /srv/site`；
# 覆盖后 Caddy 静态 file_server 立即生效，无需重启。
# ============================================================
set -euo pipefail

REPO='MrC-Sinclair/my-personalWebsite'
RELEASE_TAG='cvm-latest'
RELEASE_ASSET='site-cvm.tar.gz'
WEB_ROOT='/srv/site'
PROBE_HOST='http://127.0.0.1'
WORK_DIR="$(mktemp -d /tmp/site-deploy.XXXXXX)"
TARBALL="$WORK_DIR/site-cvm.tar.gz"
EXTRACT="$WORK_DIR/site"
DRY_RUN=0
LOCAL_DIR=''
EXTRA_PATHS=()

while [ $# -gt 0 ]; do
  case "$1" in
    --dry-run) DRY_RUN=1 ;;
    --from)
      [ $# -ge 2 ] || { echo '--from 缺少产物目录'; exit 2; }
      LOCAL_DIR="$2"
      shift
      ;;
    /*) EXTRA_PATHS+=("$1") ;;
    *) echo "未知参数：$1"; exit 2 ;;
  esac
  shift
done

# 只清理本脚本自己创建的临时目录；--from 指向的外部目录与备份文件都不会被删
cleanup() { rm -rf -- "$WORK_DIR"; }
trap cleanup EXIT

log() { printf '[deploy] %s\n' "$*"; }

if [ -n "$LOCAL_DIR" ]; then
  # 网络抖动或已经下载过产物时，直接复用本地目录，后面的校验/备份/覆盖/验证完全一致
  [ -d "$LOCAL_DIR" ] || { echo "本地产物目录不存在：$LOCAL_DIR"; exit 1; }
  EXTRACT="$LOCAL_DIR"
  log "使用本地产物目录 $EXTRACT（跳过下载）"
  if [ "$DRY_RUN" -eq 1 ]; then
    log "dry-run：将校验产物完整性、备份并覆盖 $WEB_ROOT，然后探测线上路径"
    exit 0
  fi
else
  # 1) 取 release 元数据。Actions 的 artifact 下载接口即使仓库公开也要鉴权（实测 401），
  #    Release 资产才免鉴权；但 github.com 直连不通，所以走 api.github.com 的 assets 接口。
  API="https://api.github.com/repos/$REPO"
  release="$(curl -fsSL --max-time 30 "$API/releases/tags/$RELEASE_TAG")"
  release_id="$(printf '%s' "$release" | grep -m1 '"id":' | grep -o '[0-9]*' | head -1 || true)"
  [[ "$release_id" =~ ^[0-9]+$ ]] || { echo '解析 release id 失败'; exit 1; }

  assets="$(curl -fsSL --max-time 30 "$API/releases/$release_id/assets")"
  asset_id="$(printf '%s' "$assets" | grep -m1 '"id":' | grep -o '[0-9]*' | head -1 || true)"
  expected="$(printf '%s' "$assets" | grep -m1 '"size":' | grep -o '[0-9]*' | head -1 || true)"
  asset_name="$(printf '%s' "$assets" | grep -m1 '"name":' | sed -E 's/.*"name": *"([^"]+)".*/\1/' || true)"
  [[ "$asset_id" =~ ^[0-9]+$ && "$expected" =~ ^[0-9]+$ ]] || { echo '解析 asset 元数据失败'; exit 1; }
  [[ "$asset_name" = "$RELEASE_ASSET" ]] || { echo "资产名异常：$asset_name"; exit 1; }

  # 2) dry-run 到此为止，不下载、不覆盖
  if [ "$DRY_RUN" -eq 1 ]; then
    log "dry-run：tag=$RELEASE_TAG asset=$RELEASE_ASSET size=${expected}B"
    log "dry-run：将下载到 $TARBALL，校验后备份并覆盖 $WEB_ROOT"
    log "dry-run：探测 $PROBE_HOST 的首页 / 博客列表 / sitemap / feed / 新 _nuxt 资源"
    exit 0
  fi

  # 3) 下载：链路可能只有几十 KB/s，单轮 300s 往往不够，用 -C - 断点续传补齐
  ASSET_URL="$API/releases/assets/$asset_id"
  actual=0
  for attempt in 1 2 3 4 5; do
    if [ -s "$TARBALL" ]; then
      curl -sSL -C - -H 'Accept: application/octet-stream' \
        --max-time 300 -o "$TARBALL" "$ASSET_URL" || true
    else
      curl -sSL -H 'Accept: application/octet-stream' \
        --max-time 300 -o "$TARBALL" "$ASSET_URL" || true
    fi
    actual="$(stat -c%s "$TARBALL" 2>/dev/null || echo 0)"
    if [ "$actual" = "$expected" ]; then break; fi
    log "第 $attempt 次下载不完整（$actual/$expected），续传重试"
    sleep 3
  done
  [ "$actual" = "$expected" ] || { echo "下载失败：$actual/$expected 字节"; exit 1; }
  tar -tzf "$TARBALL" >/dev/null || { echo '压缩包校验失败'; exit 1; }
  log "产物下载完成（${actual} 字节）"

  # 4a) 解包
  mkdir -p "$EXTRACT"
  tar -xzf "$TARBALL" -C "$EXTRACT"
fi

# 4b) 完整性门禁（两种来源共用）：绝不能把半份产物覆盖上去
for f in index.html sitemap.xml robots.txt feed.xml en/feed.xml; do
  [ -f "$EXTRACT/$f" ] || { echo "产物缺文件：$f"; exit 1; }
done
[ -d "$EXTRACT/_nuxt" ] || { echo '产物缺 _nuxt 静态目录'; exit 1; }
new_js="$(grep -o '/_nuxt/[^"]*\.js' "$EXTRACT/index.html" | head -1 || true)"
[ -n "$new_js" ] || { echo '无法从 index.html 解析新构建资源'; exit 1; }

# 5) 备份 → 覆盖。备份失败就拒绝覆盖，避免无法回滚
backup="/tmp/srv-site-backup-$(date +%Y%m%d-%H%M%S).tgz"
tar -czf "$backup" -C "$WEB_ROOT" . || { echo '备份失败，拒绝覆盖'; exit 1; }
log "已备份 $WEB_ROOT → $backup"
cp -r "$EXTRACT/." "$WEB_ROOT/"
log "已覆盖 $WEB_ROOT"

# 6) 验证：光看 HTML 200 会漏检静态资源，必须抽一个真实的新构建 JS
failed=0
probe() {
  local path="$1" code
  code="$(curl -s -o /dev/null -w '%{http_code}' --noproxy '*' --max-time 10 "$PROBE_HOST$path" || echo 000)"
  printf '  %s  %s\n' "$code" "$path"
  [ "$code" = '200' ] || failed=1
}
log '线上验证：'
probe '/'
probe '/style/minimalism/blog/'
probe '/sitemap.xml'
probe '/feed.xml'
probe '/en/feed.xml'
probe "$new_js"
if [ ${#EXTRA_PATHS[@]} -gt 0 ]; then
  for p in "${EXTRA_PATHS[@]}"; do probe "$p"; done
fi

if [ "$failed" -ne 0 ]; then
  echo "[deploy] 有路径未返回 200，可用 $backup 回滚" >&2
  exit 1
fi
log '部署完成'
