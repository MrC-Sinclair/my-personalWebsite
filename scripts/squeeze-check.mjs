/**
 * 「横向滚动带被挤成一条缝」判据（审计与已知答案测试共用）
 * ------------------------------------------------------------
 * 为什么需要这一条：窄屏导航条常常是 `overflow-x: auto` 的 flex 子项，
 * 一旦同一行里动作件变多，它会被 flex-shrink 压到几像素宽——
 * **不产生横向溢出、里面每个按钮的命中区也都 ≥40px**，
 * 所以其余判据全绿，而用户看到的是一条消失的导航。
 * （skeuomorphism 加了语言切换后在 390 实测被压到 7px，就是这么漏掉的。）
 *
 * 口径：容器实测宽 < 80px，而内容比它宽 40px 以上，且它确实有子元素。
 * 80 这个地板留了余量：单个 40px 触控目标 + 一点滚动上下文，再窄就没法导航了。
 *
 * 是一段字符串源码，供 Runtime.evaluate 的表达式插值使用（同 hit-box.mjs 的做法）。
 */
export const SQUEEZE_SRC = `
  const squeezedOf = (root) => {
    const hits = [];
    for (const el of root.querySelectorAll('body *')) {
      const ox = getComputedStyle(el).overflowX;
      if (ox !== 'auto' && ox !== 'scroll') continue;
      const w = el.clientWidth;
      if (!(w > 0 && w < 80)) continue;
      if (el.scrollWidth <= w + 40) continue;
      if (!el.children.length) continue;
      hits.push(
        el.tagName.toLowerCase() +
          '.' +
          (String(el.className).split(/\\s+/)[0] || '(无类名)') +
          ' ' + w + '/' + el.scrollWidth,
      );
    }
    return hits;
  };`
