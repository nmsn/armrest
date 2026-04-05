import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { WordHistoryItem } from '@/lib/wordhistory'

interface WordDetailDialogProps {
  isOpen: boolean
  onClose: () => void
  word: WordHistoryItem | null
}

export function WordDetailDialog({ isOpen, onClose, word }: WordDetailDialogProps) {
  if (!word) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-foreground">
            {word.word}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-lg text-muted-foreground">
            {word.phonetic}
          </div>
          <div className="text-sm text-foreground leading-relaxed">
            {word.meaning}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}