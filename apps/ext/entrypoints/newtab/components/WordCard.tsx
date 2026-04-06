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

const MOCK_WORDS: WordHistoryItem[] = [
  { id: '1', word: 'Serendipity', phonetic: '/ser.ən.dip.i.ti/', meaning: 'Finding something good by chance', searchedAt: Date.now(), rotation: -3, offsetX: 5, offsetY: -2 },
  { id: '2', word: 'Ephemeral', phonetic: '/i.fem.er.al/', meaning: 'Lasting for a very short time', searchedAt: Date.now(), rotation: 2, offsetX: -8, offsetY: 4 },
  { id: '3', word: 'Luminous', phonetic: '/lu:.mi.nəs/', meaning: 'Full of or shedding light', searchedAt: Date.now(), rotation: -5, offsetX: 10, offsetY: -3 },
  { id: '4', word: 'Ethereal', phonetic: '/i.θɪə.ri.əl/', meaning: 'Extremely delicate', searchedAt: Date.now(), rotation: 4, offsetX: -3, offsetY: 6 },
  { id: '5', word: 'Mellifluous', phonetic: '/me.lif.lu.əs/', meaning: 'Sweet or musical', searchedAt: Date.now(), rotation: -2, offsetX: 7, offsetY: -5 },
  { id: '6', word: 'Sonder', phonetic: '/sɒn.dər/', meaning: 'Each passerby has a life as vivid as your own', searchedAt: Date.now(), rotation: 6, offsetX: -10, offsetY: 2 },
  { id: '7', word: 'Petrichor', phonetic: '/pe.tri.kɔː/', meaning: 'The smell of rain on dry earth', searchedAt: Date.now(), rotation: -4, offsetX: 3, offsetY: -6 },
  { id: '8', word: 'Apricity', phonetic: '/æp.rɪ.sɪ.ti/', meaning: 'The warmth of the sun in winter', searchedAt: Date.now(), rotation: 3, offsetX: -5, offsetY: 5 },
  { id: '9', word: 'Nefarious', phonetic: '/ne.fɛə.ri.əs/', meaning: 'Wicked or criminal', searchedAt: Date.now(), rotation: -6, offsetX: 8, offsetY: -1 },
]

function toCardItem(word: WordHistoryItem, index: number) {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  ]
  return {
    id: word.id,
    url: `#word-${word.word}`,
    title: word.word,
    phonetic: word.phonetic,
    bg: colors[index % colors.length],
    rotation: word.rotation,
    offsetX: word.offsetX,
    offsetY: word.offsetY,
  }
}

export function WordCard() {
  const [word, setWord] = useState('')
  const [cards, setCards] = useState<WordHistoryItem[]>([])
  const [selectedWord, setSelectedWord] = useState<WordHistoryItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    // TODO: Remove mock data when ready for production
    // checkAndClearIfNeeded()
    // getWordHistory().then((state) => setCards(state.cards))
    setCards(MOCK_WORDS)
  }, [])

  const handleLookup = useCallback(async () => {
    if (!word.trim()) return

    const newWord: WordHistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      word: word.trim(),
      phonetic: `/${word.trim().slice(0, 3)}./`,
      meaning: 'Definition for this word...',
      searchedAt: Date.now(),
      rotation: Math.floor(Math.random() * 16) - 8,
      offsetX: Math.floor(Math.random() * 24) - 12,
      offsetY: Math.floor(Math.random() * 16) - 8,
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
    <div className="app-card-p0 h-full flex flex-col overflow-hidden" style={{ height: 256 }}>
      <div className="flex flex-col p-4.5 pb-2">
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
      </div>

      <div className="flex justify-center flex-1 w-[115%] self-center">
        <MultiRowBucketCards
          cards={cards.map(toCardItem)}
          columns={3}
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