export default {
  matches: ['<all_urls>'],
  runAt: 'document_start',
  main(ctx) {
    const messages: Record<string, string> = {
      SAVED: '添加成功',
      READ_LATER: '收藏成功',
      SAVE_FAILED: '添加失败',
      READ_LATER_FAILED: '收藏失败',
    }

    function injectStyles() {
      const style = document.createElement('style')
      style.textContent = `
        .shiori-toast {
          position: fixed;
          top: 18px; right: 18px;
          background: #1c1c1e;
          color: #fff;
          border-radius: 10px;
          padding: 8px 14px;
          font: 500 13px -apple-system, sans-serif;
          box-shadow: 0 4px 24px rgba(0,0,0,.35);
          opacity: 0;
          transform: translateY(-10px) scale(.95);
          transition: opacity 220ms ease, transform 220ms ease;
          z-index: 2147483647;
        }
        .shiori-toast.show {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      `
      ;(document.head || document.documentElement).appendChild(style)
    }

    function showToast(msg: { type: string; title: string }) {
      const div = document.createElement('div')
      div.className = 'shiori-toast'
      const icon = msg.type.endsWith('_FAILED') ? '✗' : '✓'
      div.innerHTML = `<span>${icon}</span> ${messages[msg.type] ?? msg.type}`
      document.body.appendChild(div)

      requestAnimationFrame(() => div.classList.add('show'))
      setTimeout(() => {
        div.classList.remove('show')
        div.addEventListener('transitionend', () => div.remove())
      }, 2200)
    }

    injectStyles()

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
  },
}
