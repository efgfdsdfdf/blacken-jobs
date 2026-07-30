"use client"

import React from "react"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DynamicListProps<T> {
  items: T[]
  onChange: (items: T[]) => void
  renderItem: (item: T, index: number, updateItem: (updated: T) => void) => React.ReactNode
  emptyItem: T
  addLabel?: string
}

export function DynamicList<T>({ items = [], onChange, renderItem, emptyItem, addLabel = "Add Item" }: DynamicListProps<T>) {
  const addItem = () => {
    onChange([...items, { ...emptyItem }])
  }

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, updated: T) => {
    const newItems = [...items]
    newItems[index] = updated
    onChange(newItems)
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div 
          key={index} 
          className="flex gap-4 items-start p-5 bg-zinc-950/40 rounded-xl border border-white/5 animate-fade-in relative group transition-all hover:bg-zinc-900/60"
        >
          <div className="flex-1 w-full">
            {renderItem(item, index, (updated) => updateItem(index, updated))}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeItem(index)}
            className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity absolute right-3 top-3 h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ))}
      
      <Button
        type="button"
        variant="outline"
        onClick={addItem}
        className="w-full h-12 border-dashed border-white/10 bg-zinc-950/30 hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-400 text-zinc-400 transition-all rounded-xl"
      >
        <Plus className="w-4 h-4 mr-2" />
        {addLabel}
      </Button>
    </div>
  )
}
