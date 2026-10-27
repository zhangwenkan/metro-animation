(() => {
  const label = (el) =>
    (el.getAttribute("aria-label") ?? el.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 32);
  // inert / aria-hidden 子树里的元素不会真的发声，标出来便于解释差异
  const mute = (el) =>
    el.closest('[inert], [aria-hidden="true"]') || el.hasAttribute("disabled") ? 1 : 0;

  const rows = [...document.querySelectorAll("[data-ui-sound]")].map((el) => ({
    sound: el.getAttribute("data-ui-sound"),
    tag: el.tagName,
    label: label(el),
    mute: mute(el),
  }));

  // 没有 data-ui-sound 时站点靠这些属性推断音名（toggle-on / select / expand ...）
  const inferred = [...document.querySelectorAll(
    "[aria-expanded], [role=tab], [role=radio], [role=menuitem], [aria-checked], [aria-pressed]",
  )].map((el) => ({
    tag: el.tagName,
    label: label(el),
    role: el.getAttribute("role"),
    expanded: el.getAttribute("aria-expanded"),
    checked: el.getAttribute("aria-checked") ?? el.getAttribute("aria-pressed"),
    mute: mute(el),
  }));

  const key = (row) => [row.sound, row.tag, row.label, row.mute].join("|");
  return {
    sounds: rows.map(key).sort(),
    inferred: inferred.map((row) => [row.tag, row.label, row.role, row.expanded, row.checked, row.mute].join("|")).sort(),
  };
})()
