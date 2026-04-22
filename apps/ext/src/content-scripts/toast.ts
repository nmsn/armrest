export function showToast(msg: { type: string; title: string }) {
  const messages: Record<string, string> = {
    SAVED: '已添加到书签',
    READ_LATER: '已添加到稍后阅读',
    SAVE_FAILED: '收藏便签失败',
    READ_LATER_FAILED: '添加稍后阅读失败',
  }

  const div = document.createElement('div')
  div.className =
    'toast fixed top-4 right-4 bg-neutral-900 text-white rounded-xl px-4 py-2.5 text-sm font-medium shadow-xl z-[2147483647] opacity-0 scale-95 transition-all duration-200'
  const icon = msg.type.endsWith('_FAILED') ? '✗' : '✓'
  div.innerHTML = `<span>${icon}</span> ${messages[msg.type] ?? msg.type}`

  document.body.appendChild(div)

  requestAnimationFrame(() => div.classList.add('show'))

  setTimeout(() => {
    div.classList.remove('show')
    div.addEventListener('transitionend', () => div.remove())
    setTimeout(() => div.remove(), 300)
  }, 2200)
}

export function injectToastStyles() {
  const style = document.createElement('style')
  style.textContent = `
    .toast.show {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  `
  ;(document.head || document.documentElement).appendChild(style)
}

if (typeof chrome !== 'undefined') {
  injectToastStyles()
  chrome.runtime.onMessage.addListener((msg: { type: string; title: string }) => {
    if (
      msg.type === 'SAVED' ||
      msg.type === 'READ_LATER' ||
      msg.type === 'SAVE_FAILED' ||
      msg.type === 'READ_LATER_FAILED'
    ) {
      showToast(msg)
    }
  })
}
