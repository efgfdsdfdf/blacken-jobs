"use client"

import React, { useState, KeyboardEvent } from "react"
import { X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TagInputProps {
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  suggestions?: string[]
}

export function TagInput({ value = [], onChange, placeholder = "Type and press Enter...", suggestions = [] }: TagInputProps) {
  const [inputValue, setInputValue] = useState("")

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addTag()
    }
  }

  const addTag = () => {
    const tag = inputValue.trim()
    if (tag && !value.includes(tag)) {
      onChange([...value, tag])
      setInputValue("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove))
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 mb-3">
        {value.map(tag => (
          <span 
            key={tag} 
            className="flex items-center gap-1.5 bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-full text-sm font-medium border border-blue-500/20 backdrop-blur-md animate-fade-in shadow-sm"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:bg-blue-500/20 rounded-full p-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex h-11 w-full rounded-md border border-white/10 bg-zinc-950/50 px-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all shadow-inner"
        />
        <Button 
          type="button" 
          onClick={addTag} 
          variant="outline" 
          className="h-11 px-4 border-white/10 bg-zinc-950/50 hover:bg-zinc-800 text-zinc-300 transition-colors"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>
    </div>
  )
}
