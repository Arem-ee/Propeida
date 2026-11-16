'use client'

import { useState, useMemo } from 'react'
import {
  ELEMENTS,
  FIRST_20_ELEMENTS,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  type ChemicalElement,
  type ElementCategory,
} from '@/lib/chemistry/periodic-table-data'
import { Search, X, Atom } from 'lucide-react'

interface PeriodicTableProps {
  initialFocus?: 'first-20' | 'all'
  highlightElements?: string[] // e.g. ['H', 'Li', 'Na', 'K']
  caption?: string
  className?: string
}

export default function PeriodicTable({
  initialFocus = 'first-20',
  highlightElements = [],
  caption,
  className = '',
}: PeriodicTableProps) {
  const [viewMode, setViewMode] = useState<'first-20' | 'all'>(initialFocus)
  const [selectedCategory, setSelectedCategory] = useState<ElementCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeElement, setActiveElement] = useState<ChemicalElement | null>(null)

  // Normalize highlight set for O(1) lookups
  const highlightSet = useMemo(() => {
    return new Set(highlightElements.map((s) => s.trim().toUpperCase()))
  }, [highlightElements])

  // Filter elements for the grid
  const displayedElements = useMemo(() => {
    const baseList = viewMode === 'first-20' ? FIRST_20_ELEMENTS : ELEMENTS
    const query = searchQuery.trim().toLowerCase()

    return baseList.filter((el) => {
      // Category filter
      if (selectedCategory !== 'all' && el.c !== selectedCategory) return false

      // Search filter
      if (query) {
        const matchesSymbol = el.s.toLowerCase() === query
        const matchesName = el.n.toLowerCase().includes(query)
        const matchesZ = String(el.z) === query
        return matchesSymbol || matchesName || matchesZ
      }

      return true
    })
  }, [viewMode, selectedCategory, searchQuery])

  return (
    <div className={`w-full rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-sm sm:p-5 ${className}`}>
      {/* Header & Controls */}
      <div className="flex flex-col gap-3 pb-3 border-b border-slate-100 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Atom className="h-4 w-4" />
            </span>
            <h3 className="font-heading text-lg font-bold text-slate-900">
              Interactive Periodic Table
            </h3>
          </div>
          {caption && (
            <p className="mt-0.5 text-xs text-slate-500">{caption}</p>
          )}
        </div>

        {/* View Mode Toggle (First 20 vs Full 118) */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setViewMode('first-20')}
            className={`rounded-lg px-2.5 py-1 transition-all ${
              viewMode === 'first-20'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            First 20 Elements (JAMB)
          </button>
          <button
            type="button"
            onClick={() => setViewMode('all')}
            className={`rounded-lg px-2.5 py-1 transition-all ${
              viewMode === 'all'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All 118 Elements (IUPAC)
          </button>
        </div>
      </div>

      {/* Search and Category Filter Toolbar */}
      <div className="mt-3 flex flex-col gap-2.5 sm:flex-row sm:items-center">
        {/* Search Input */}
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, symbol (e.g. Na, Fe), or atomic #..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-1.5 pl-8 pr-8 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills (Horizontal Scroll) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`shrink-0 rounded-lg px-2.5 py-1 font-semibold transition-all ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories
          </button>
          {(Object.keys(CATEGORY_LABELS) as ElementCategory[]).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 rounded-lg px-2.5 py-1 font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Grid View: FIRST 20 MODE */}
      {viewMode === 'first-20' ? (
        <div className="mt-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-5">
            {displayedElements.map((el) => {
              const colors = CATEGORY_COLORS[el.c]
              const isHighlighted = highlightSet.has(el.s.toUpperCase())
              const isSelected = activeElement?.z === el.z

              return (
                <button
                  key={el.z}
                  type="button"
                  onClick={() => setActiveElement(el)}
                  className={`group relative flex flex-col justify-between rounded-xl border p-2.5 text-left transition-all hover:scale-[1.02] hover:shadow-md ${
                    colors.bg
                  } ${colors.border} ${
                    isHighlighted ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                  } ${isSelected ? 'ring-2 ring-slate-900 shadow-md' : ''}`}
                >
                  {/* Top Bar: Z and Mass */}
                  <div className="flex items-start justify-between">
                    <span className="font-mono text-[11px] font-bold text-slate-500">
                      {el.z}
                    </span>
                    <span className="font-mono text-[10px] font-semibold text-slate-400">
                      {el.m.toFixed(2)}
                    </span>
                  </div>

                  {/* Center: Symbol & Name */}
                  <div className="my-1.5 text-center">
                    <span className={`block font-heading text-2xl font-bold tracking-tight ${colors.text}`}>
                      {el.s}
                    </span>
                    <span className="block truncate text-xs font-semibold text-slate-700">
                      {el.n}
                    </span>
                  </div>

                  {/* Bottom: Shells & Category Tag */}
                  <div className="mt-1 flex items-center justify-between border-t border-slate-200/60 pt-1 text-[10px]">
                    <span className="font-mono font-bold text-slate-600">
                      [{el.shells.join(', ')}]
                    </span>
                    <span className="truncate font-semibold text-slate-500">
                      Val: {el.val}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        /* Grid View: FULL 118 ELEMENTS IUPAC TABLE */
        <div className="mt-4 overflow-x-auto pb-2">
          <div className="min-w-[760px]">
            {/* Standard 18-column IUPAC table */}
            <div className="grid grid-cols-18 gap-1 text-center font-mono">
              {/* Group Numbers 1-18 */}
              {Array.from({ length: 18 }, (_, i) => (
                <div key={i} className="py-1 text-[10px] font-bold text-slate-400">
                  {i + 1}
                </div>
              ))}
            </div>

            {/* We map periods 1 to 7 */}
            <div className="flex flex-col gap-1">
              {Array.from({ length: 7 }, (_, pIdx) => {
                const period = pIdx + 1
                return (
                  <div key={period} className="flex gap-1">
                    {Array.from({ length: 18 }, (_, gIdx) => {
                      const group = gIdx + 1
                      const el = ELEMENTS.find((e) => e.p === period && e.g === group)

                      if (!el) {
                        // Empty slot in periodic table layout
                        return <div key={group} className="h-12 w-[calc((100%-17*4px)/18)]" />
                      }

                      const colors = CATEGORY_COLORS[el.c]
                      const isHighlighted = highlightSet.has(el.s.toUpperCase())
                      const isSelected = activeElement?.z === el.z

                      return (
                        <button
                          key={el.z}
                          type="button"
                          onClick={() => setActiveElement(el)}
                          className={`flex h-12 w-[calc((100%-17*4px)/18)] flex-col justify-between rounded-md border p-1 text-left transition-all hover:scale-110 hover:z-20 hover:shadow-md ${
                            colors.bg
                          } ${colors.border} ${
                            isHighlighted ? 'ring-2 ring-blue-500 ring-offset-1 z-10' : ''
                          } ${isSelected ? 'ring-2 ring-slate-900 z-10' : ''}`}
                        >
                          <span className="font-mono text-[8px] font-bold text-slate-500 leading-none">
                            {el.z}
                          </span>
                          <span className={`text-center font-heading text-xs font-bold leading-none ${colors.text}`}>
                            {el.s}
                          </span>
                          <span className="text-center font-mono text-[7px] text-slate-400 truncate leading-none">
                            {Math.round(el.m)}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ELEMENT INSPECTOR MODAL / BOTTOM CARD */}
      {activeElement && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-14 w-14 flex-col items-center justify-center rounded-xl border font-heading shadow-xs ${
                  CATEGORY_COLORS[activeElement.c].bg
                } ${CATEGORY_COLORS[activeElement.c].border}`}
              >
                <span className="font-mono text-[10px] font-bold text-slate-500 leading-none">
                  {activeElement.z}
                </span>
                <span className="text-xl font-bold text-slate-900 leading-none">
                  {activeElement.s}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-heading text-base font-bold text-slate-900">
                    {activeElement.n}
                  </h4>
                  <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                    {CATEGORY_LABELS[activeElement.c]}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Relative Atomic Mass: <strong className="text-slate-800">{activeElement.m}</strong> &bull; Period {activeElement.p}, Group {activeElement.g}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveElement(null)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Quick Chemistry Specs Grid (High relevance to JAMB/WAEC questions) */}
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
            <div className="rounded-lg bg-white p-2 border border-slate-200/70">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Shell Structure (K, L, M, N)</span>
              <span className="font-mono font-bold text-slate-800">
                {activeElement.shells.join(' : ')}
              </span>
            </div>
            <div className="rounded-lg bg-white p-2 border border-slate-200/70">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">spdf Configuration</span>
              <span className="font-mono font-bold text-slate-800 truncate block">
                {activeElement.cfg}
              </span>
            </div>
            <div className="rounded-lg bg-white p-2 border border-slate-200/70">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Valency / Oxidation</span>
              <span className="font-mono font-bold text-slate-800">
                {activeElement.val}
              </span>
            </div>
            <div className="rounded-lg bg-white p-2 border border-slate-200/70">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">State at STP & Electronegativity</span>
              <span className="font-semibold text-slate-800 capitalize">
                {activeElement.st} {activeElement.en !== null ? `(${activeElement.en} Pauling)` : ''}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
