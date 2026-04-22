import { afterEach, describe, expect, it, vi } from 'vitest'
import { showToast } from './toast'

describe('toast content script', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('shows toast element in DOM when type is SAVED', () => {
    showToast({ type: 'SAVED', title: 'Test Bookmark' })

    const toast = document.querySelector('.toast')
    expect(toast).not.toBeNull()
    expect(toast?.textContent).toContain('已添加到书签')
  })

  it('shows toast element in DOM when type is READ_LATER', () => {
    showToast({ type: 'READ_LATER', title: 'Read This Later' })

    const toast = document.querySelector('.toast')
    expect(toast).not.toBeNull()
    expect(toast?.textContent).toContain('已添加到稍后阅读')
  })

  it('shows toast element in DOM when type is SAVE_FAILED', () => {
    showToast({ type: 'SAVE_FAILED', title: 'Save failed' })

    const toast = document.querySelector('.toast')
    expect(toast).not.toBeNull()
    expect(toast?.textContent).toContain('收藏便签失败')
  })

  it('removes toast after timeout', () => {
    vi.useFakeTimers()

    showToast({ type: 'SAVED', title: 'Test' })
    vi.advanceTimersByTime(2500)

    expect(document.querySelector('.toast')).toBeNull()

    vi.useRealTimers()
  })
})
