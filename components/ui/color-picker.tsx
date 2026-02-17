import React from "react"

interface ColorOption {
  color: string
  name?: string
  usage?: string
}

interface ColorPickerProps {
  colors: ColorOption[]
  selectedColor: string
  onChange: (color: string) => void
  columns?: number
}

export function ColorPicker({ colors, selectedColor, onChange, columns = 4 }: ColorPickerProps) {
  const gridClass = columns === 5 ? "grid-cols-5" : "grid-cols-4"

  return (
    <div className={`grid ${gridClass} gap-3 mb-4`}>
      {colors.map((item) => (
        <button
          key={item.color}
          onClick={() => onChange(item.color)}
          className={`w-full aspect-video rounded-xl border-2 transition-all duration-200 cursor-pointer relative ${
            selectedColor === item.color 
              ? "border-accent ring-2 ring-accent/30" 
              : "border-border hover:border-accent/50"
          }`}
          style={{ backgroundColor: item.color }}
          aria-label={`Select background color ${item.color}`}
          title={item.usage}
        />
      ))}
    </div>
  )
}
