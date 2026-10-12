/**
 * 命中区测量（两个触控探针共用）
 * ------------------------------------------------------------
 * 元素的边框盒 ≠ 它能被点到的范围，两种常见错位：
 *   · 覆盖式链接：::after 用 inset:0 铺满定位祖先，真实命中区是那一整行/整卡
 *   · 命中区外扩：inset 为负（或 calc 反解）的伪元素比边框盒更高
 * 另有塌陷情形：display:inline 的 <a> 包住块级子元素时，自身 client rect 会是
 * 0 宽或 0 高，但它的所有后代都归它响应点击 —— 这时按后代的并集算。
 * 直接量 getBoundingClientRect 会把这三类全判成不合格。
 *
 * 是一段字符串源码，供探针拼进 Runtime.evaluate 的表达式里。
 * 注意：这里比探针自身多一层转义，正则里的 \d 在本文件源码要写成 \\d；
 * 写成 \\\\d 就成了「反斜杠 + 字母 d」，px() 永不匹配，伪元素展开全部失效。
 */
export const HIT_BOX_SRC = `
  const px = (v) => (/^-?[\\d.]+px$/.test(v) ? parseFloat(v) : null);
  const rectOf = (rs) => {
    let box = null;
    for (const r of rs) {
      if (!r.width && !r.height) continue;
      box = box
        ? {
            top: Math.min(box.top, r.top),
            left: Math.min(box.left, r.left),
            right: Math.max(box.right, r.right),
            bottom: Math.max(box.bottom, r.bottom),
          }
        : { top: r.top, left: r.left, right: r.right, bottom: r.bottom };
    }
    return box;
  };
  const hitBox = (el) => {
    let box = rectOf(el.getClientRects());
    // 自身塌成一条线/一个点：inline 包 block，命中区看后代
    if (!box || box.right - box.left < 1 || box.bottom - box.top < 1) {
      box = rectOf(el.querySelectorAll('*')) || { top: 0, left: 0, right: 0, bottom: 0 };
    }
    for (const pseudo of ['::after', '::before']) {
      const s = getComputedStyle(el, pseudo);
      if (s.content === 'none' || s.position !== 'absolute') continue;
      const t = px(s.top), r = px(s.right), b = px(s.bottom), l = px(s.left);
      if (t === null || r === null || b === null || l === null) continue;
      // el 自身没定位时，绝对定位的伪元素以最近的定位祖先为包含块
      const host = getComputedStyle(el).position === 'static' ? el.offsetParent : el;
      if (!host) continue;
      const h = host.getBoundingClientRect();
      // top/left 从包含块起始边向内量，right/bottom 从终止边向内量：
      // 负值才是向外扩，所以 bottom/right 要「减去」它们的 inset
      box = {
        top: Math.min(box.top, h.top + t),
        left: Math.min(box.left, h.left + l),
        right: Math.max(box.right, h.right - r),
        bottom: Math.max(box.bottom, h.bottom - b),
      };
    }
    return { width: box.right - box.left, height: box.bottom - box.top };
  };`
