import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function BackgroundSettings() {
  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium text-primary">Background Color</label>
        <Input type="color" className="h-10 w-full mt-2 rounded-lg border-border" defaultValue="#FAFAFA" />
      </div>
      <div>
        <label className="text-sm font-medium text-primary">Background Image URL</label>
        <Input type="text" placeholder="https://..." className="mt-2 rounded-lg border-border" />
      </div>
      <Button className="w-full bg-accent hover:bg-accent-dark text-white rounded-xl font-medium transition-colors">
        Apply
      </Button>
    </div>
  )
}
