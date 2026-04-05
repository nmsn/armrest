import { useState, useEffect, useCallback } from 'react'
import BucketCards from '@/components/BucketCards'
import { getReadLater, addReadLaterCard, deleteReadLaterCard, ReadLaterCard } from '@/lib/readlater'

export function ReadLater() {
  const [cards, setCards] = useState<ReadLaterCard[]>([])

  useEffect(() => {
    getReadLater().then((state) => setCards(state.cards))
  }, [])

  const handleAddCard = useCallback(async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab?.url || !tab?.title) return

    // Random visual properties for the new card
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#F8B500', '#2ECC71', '#E74C3C', '#3498DB', '#9B59B6',
    ]
    const randomBg = colors[Math.floor(Math.random() * colors.length)]
    const randomRotation = Math.floor(Math.random() * 30) - 15
    const randomOffsetX = Math.floor(Math.random() * 40) - 10
    const randomOffsetY = Math.floor(Math.random() * 10) - 5

    const newCard: ReadLaterCard = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      url: tab.url,
      title: tab.title,
      bg: randomBg,
      rotation: randomRotation,
      offsetX: randomOffsetX,
      offsetY: randomOffsetY,
    }

    await addReadLaterCard(newCard)
    setCards((prev) => [newCard, ...prev])
  }, [])

  const handleDeleteCard = useCallback(async (id: string) => {
    await deleteReadLaterCard(id)
    setCards((prev) => prev.filter((card) => card.id !== id))
  }, [])

  return (
    <div
      className="app-card read-later-card p-0! overflow-x-auto overflow-y-hidden scrollbar-hide"
      style={{ height: '80px' }}
    >
      <BucketCards
        cards={cards}
        showAddCard={true}
        onAddCard={handleAddCard}
        onDeleteCard={handleDeleteCard}
      />
    </div>
  )
}