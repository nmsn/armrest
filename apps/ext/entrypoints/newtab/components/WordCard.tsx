import { useState, useEffect, useCallback } from 'react'
import { SearchIcon } from '@/components/ui/saerch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import MultiRowBucketCards from '@/components/MultiRowBucketCards'
import { WordDetailDialog } from './WordDetailDialog'
import {
  getWordHistory,
  addWordHistory,
  checkAndClearIfNeeded,
  type WordHistoryItem,
} from '@/lib/wordhistory'

function toCardItem(word: WordHistoryItem, index: number) {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  ]
  return {
    id: word.id,
    url: `#word-${word.word}`,
    title: word.word,
    bg: colors[index % colors.length],
    rotation: 0,
    offsetX: 0,
    offsetY: 0,
  }
}

export function WordCard() {
  const [word, setWord] = useState('')
  const [cards, setCards] = useState<WordHistoryItem[]>([])
  const [selectedWord, setSelectedWord] = useState<WordHistoryItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    checkAndClearIfNeeded()
    getWordHistory().then((state) => setCards(state.cards))
  }, [])

  const handleLookup = useCallback(async () => {
    if (!word.trim()) return

    const newWord: WordHistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      word: word.trim(),
      phonetic: `/${word.trim().slice(0, 3)}./`,
      meaning: 'Definition for this word...',
      searchedAt: Date.now(),
    }

    await addWordHistory(newWord)
    setCards((prev) => [newWord, ...prev.filter((c) => c.word !== newWord.word)])
    setWord('')
  }, [word])

  const handleCardClick = useCallback(
    (card: { id: string }) => {
      const found = cards.find((c) => c.id === card.id)
      if (found) {
        setSelectedWord(found)
        setIsDialogOpen(true)
      }
    },
    [cards]
  )

  return (
    <div className="app-card h-full flex flex-col">
      <div className="app-card-header">
        <span className="app-card-title">Word Lookup</span>
      </div>
      <div className="flex gap-2 mb-3">
        <Input
          value={word}
          onChange={(e) => setWord(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
          placeholder="Search a word..."
          className="h-9 text-xs bg-background border-border focus:border-accent"
        />
        <Button
          size="sm"
          variant="outline"
          onClick={handleLookup}
          className="h-9 px-3 text-xs border-border hover:border-accent/50"
        >
          <SearchIcon className="w-3.5 h-3.5" />
        </Button>
      </div>
      <div className="flex-1 overflow-hidden">
        <MultiRowBucketCards
          cards={cards.map(toCardItem)}
          columns={2}
          columnGap={40}
          overflowClip={30}
          onCardClick={handleCardClick}
        />
      </div>

      <WordDetailDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        word={selectedWord}
      />
    </div>
  )
}