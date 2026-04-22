import { useState, useEffect, useCallback } from 'react'
import SingleRowBucketCards from '@/components/SingleRowBucketCards'
import { getReadLater, addReadLaterCard, deleteReadLaterCard, ReadLaterCard, generateRandomCardVisual } from '@/lib/readlater'

export function ReadLater() {
  const [cards, setCards] = useState<ReadLaterCard[]>([])

  useEffect(() => {
    getReadLater().then((state) => setCards(state.cards))
  }, [])

  const handleAddCard = useCallback(async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab?.url || !tab?.title) return

    const newCard: ReadLaterCard = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      url: tab.url,
      title: tab.title,
      ...generateRandomCardVisual(),
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
      <SingleRowBucketCards
        cards={cards}
        showAddCard={true}
        onAddCard={handleAddCard}
        onDeleteCard={handleDeleteCard}
      />
    </div>
  )
}