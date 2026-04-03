import { PlusIcon } from "@/components/ui/plus"

interface AddBookmarkButtonProps {
  onClick: () => void
}

export function AddBookmarkButton({ onClick }: AddBookmarkButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center aspect-square gap-1.5 p-1.5 rounded-lg hover:bg-accent/5 transition-colors cursor-pointer w-full h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
    >
      <div className="w-8 h-8 rounded-full border-2 border-dashed border-muted-foreground/40 flex items-center justify-center text-muted-foreground hover:border-accent hover:text-accent transition-colors">
        <PlusIcon size={16} />
      </div>
      <span className="text-xs text-muted-foreground/80">Add</span>
    </button>
  )
}
