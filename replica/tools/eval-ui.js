// 取一份极简 UI 快照：气泡在不在、面板开没开、焦点落在谁身上。
// 给 shot.mjs 用：--eval @tools/eval-ui.js（PowerShell 里带引号的表达式传不进去）
// 注意写成自执行表达式：page.evaluate 收到字符串时是当表达式求值，
// 只给一个箭头函数会原样返回函数本身，JSON.stringify 出来是 undefined。
(() => {
  const label = (el) => el?.getAttribute("aria-label") ?? el?.textContent?.trim().slice(0, 24) ?? null;
  return {
    expand: [...document.querySelectorAll("[data-ui-sound=expand]")].map(label),
    dialogs: [...document.querySelectorAll("dialog")].map((el) => [label(el), el.open]),
    focus: label(document.activeElement),
    body: document.body.innerText.replace(/\s+/g, " ").slice(0, 120),
  };
})()
