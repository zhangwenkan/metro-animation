// 把页面里所有 @font-face 的声明原样读出来，外加每个 FontFace 的加载状态。
// 站点是 next/font 注入的，复刻是手写 @font-face，比对 descriptor 就能确认
// 「字体文件、字体族名、font-display、度量覆盖」四项是否一致。
(() => {
  const faces = [];
  for (const sheet of document.styleSheets) {
    let rules;
    try {
      rules = sheet.cssRules;
    } catch {
      continue; // 跨域样式表读不到，跳过
    }
    for (const rule of rules) {
      if (rule.constructor.name !== "CSSFontFaceRule") continue;
      const declared = {};
      for (const prop of rule.style) declared[prop] = rule.style.getPropertyValue(prop);
      faces.push(declared);
    }
  }
  faces.sort((a, b) => (a["font-family"] + a["font-style"]).localeCompare(b["font-family"] + b["font-style"]));
  return {
    faces,
    status: document.fonts.status,
    loaded: [...document.fonts]
      .map((face) => [face.family.replace(/["']/g, ""), face.weight, face.style, face.status])
      .sort((a, b) => a.join("|").localeCompare(b.join("|"))),
  };
})()
