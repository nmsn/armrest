import { useState } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function WordCard() {
  const [word, setWord] = useState("serendipity")
  const [result, setResult] = useState({
    word: "serendipity",
    phonetic: "/ˌser.ənˈdɪp.ə.ti/",
    meaning: "n. the occurrence of finding something good by chance; the faculty of making fortunate discoveries by accident",
  })

  const handleLookup = () => {
    if (!word.trim()) return
    setResult({
      word: word.trim(),
      phonetic: `/${word.trim().slice(0, 3)}./`,
      meaning: "Definition for this word...",
    })
  }

  return (
    <div className="app-card h-full flex flex-col">
      <div className="app-card-header">
        <span className="app-card-title">Word Lookup</span>
      </div>
      <div className="flex gap-2 mb-3">
        <Input
          value={word}
          onChange={(e) => setWord(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLookup()}
          placeholder="Search a word..."
          className="h-9 text-xs bg-background border-border focus:border-accent"
        />
        <Button
          size="sm"
          variant="outline"
          onClick={handleLookup}
          className="h-9 px-3 text-xs border-border hover:border-accent/50"
        >
          <Search className="w-3.5 h-3.5" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="text-xl font-bold text-foreground">{result.word}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{result.phonetic}</div>
        <div className="text-xs text-muted-foreground mt-3 leading-relaxed">
          {result.meaning}
        </div>
      </div>
    </div>
  )
}
