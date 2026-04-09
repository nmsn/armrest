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
import { api } from '@/lib/api-client'


const WORD_REGEX = /^[a-zA-Z][a-zA-Z'-]{0,49}$/
const MAX_DISPLAY_CARDS = 9

function validateWord(word: string): string | null {
  if (!word.trim()) return '请输入有效单词（仅支持英文字母）'
  if (word.length > 50) return '单词过长（最多50字符）'
  if (!WORD_REGEX.test(word)) return '请输入有效单词（仅支持英文字母）'
  return null
}

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
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkAndClearIfNeeded()
    getWordHistory().then((state) => setCards(state.cards))
  }, [])

  const handleLookup = useCallback(async () => {
    const trimmed = word.trim()
    const validationError = validateWord(trimmed)
    if (validationError) {
      setError(validationError)
      return
    }
    setError(null)

    try {
      const res = await api.dictionary.lookup(trimmed)
      if (res.error || !res.data) {
        setError(res.error || '未找到该单词')
        return
      }

      const d = res.data
      const firstMeaning = d.meanings[0]
      const meaning = firstMeaning
        ? firstMeaning.definitions[0]?.definition || ''
        : ''

      const newWord: WordHistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        word: d.word,
        phonetic: d.phonetic,
        phoneticAudio: d.phoneticAudio || undefined,
        meaning,
        searchedAt: Date.now(),
        rotation: Math.floor(Math.random() * 16) - 8,
        offsetX: Math.floor(Math.random() * 24) - 12,
        offsetY: Math.floor(Math.random() * 16) - 8,
      }

      await addWordHistory(newWord)
      setCards((prev) => [newWord, ...prev.filter((c) => c.word !== newWord.word)])
      setWord('')
    } catch (err) {
      if (err instanceof Error && err.message.includes('timeout')) {
        setError('网络超时，请检查网络连接')
      } else {
        setError('网络错误')
      }
    }
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
        {error && (
          <div className="text-xs text-red-500 mt-1">{error}</div>
        )}
      </div>

      <div className="flex justify-center flex-1 w-[115%] self-center">
        <MultiRowBucketCards
          cards={cards.slice(0, MAX_DISPLAY_CARDS).map(toCardItem)}
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