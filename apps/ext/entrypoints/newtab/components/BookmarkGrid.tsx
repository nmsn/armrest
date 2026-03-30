import { AnimatePresence, motion } from "motion/react"
import { BookmarkList } from "./BookmarkList"
import type { Bookmark } from "@/lib/bookmarks"

interface BookmarkGridProps {
  bookmarks: Bookmark[]
  direction: number
  onBookmarkClick: (url: string) => void
  onAddBookmark: () => void
  onEditBookmark?: (bookmark: Bookmark) => void
  onDeleteBookmark?: (bookmark: Bookmark) => void
}

export function BookmarkGrid({
  bookmarks,
  direction,
  onBookmarkClick,
  onAddBookmark,
  onEditBookmark,
  onDeleteBookmark,
}: BookmarkGridProps) {
  return (
    <AnimatePresence mode="popLayout" custom={direction}>
      <motion.div
        custom={direction}
        initial={{ y: direction > 0 ? 10 : -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: direction > 0 ? -10 : 10, opacity: 0 }}
        transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <BookmarkList
          bookmarks={bookmarks}
          onBookmarkClick={onBookmarkClick}
          onAddBookmark={onAddBookmark}
          onEditBookmark={onEditBookmark}
          onDeleteBookmark={onDeleteBookmark}
        />
      </motion.div>
    </AnimatePresence>
  )
}
