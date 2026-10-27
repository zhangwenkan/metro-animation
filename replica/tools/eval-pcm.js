(() => ({
  pcm: window.__pcm ?? null,
  reply: document.querySelector("div[class*='w-[min(280px'] section[aria-label^=Ajo] p span.sr-only")?.textContent ?? null,
}))()
