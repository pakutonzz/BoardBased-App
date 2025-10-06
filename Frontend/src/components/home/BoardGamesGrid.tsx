import React from 'react'
import { Star, ArrowUpDown } from "lucide-react";
import { Link } from 'react-router-dom'
import { CONFIG } from '@/lib/config'

function StarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21 12 17.27z"
        fill="currentColor"
      />
    </svg>
  )
}

type Game = { id: number; name: string; imageUrl?: string; averageRating?: string }

export default function BoardGamesGrid() {
  const [items, setItems] = React.useState<Game[]>([])
  const [total, setTotal] = React.useState<number>(0)
  const [currentEnd, setCurrentEnd] = React.useState<number>(0)
  const [rangeStart, setRangeStart] = React.useState(1)
  const [loading, setLoading] = React.useState(false)
  const [sortAZ, setSortAZ] = React.useState<null | boolean>(null) // null = API order

  React.useEffect(() => { loadRange(1, 20) }, [])

  function loadRange(start: number, end: number) {
    setLoading(true)
    fetch(`${CONFIG.API_BASE}/board-games?range=${start}-${end}`)
      .then(r => r.json())
      .then(data => {
        const rows: Game[] = data.rows || data || []
        if (data.total !== undefined) {
          setTotal(data.total)
        }
        setCurrentEnd(end)
        setItems(prev => {
          const seen = new Set(prev.map(x => x.id))
          const merged = [...prev]
          for (const r of rows) if (!seen.has(r.id)) { merged.push(r); seen.add(r.id) }
          return merged
        })
        setRangeStart(end + 1)
      })
      .finally(() => setLoading(false))
  }

  function sortedList(): Game[] {
    if (sortAZ === null) return items
    const byName = [...items].sort((a,b) => a.name.localeCompare(b.name))
    return sortAZ ? byName : byName.reverse()
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="h-section">Board Games</h2>
          <p className="text-sm text-gray-400 mt-1">Showing {Math.min(currentEnd, total)} of {total} games</p>
        </div>
        <button
          onClick={() => setSortAZ(prev => prev === null ? true : !prev)}
          className={`flex items-center gap-2 px-5 py-2 rounded-full border border-white text-white transition-colors hover:bg-white/10 ${
            sortAZ !== null ? 'bg-white/20' : ''
          }`}
        >
            {sortAZ === null ? 'Sort By A–Z' : (sortAZ ? 'Sort By A–Z' : 'Sort By Z–A')} <ArrowUpDown className="inline-block ml-1" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
        {sortedList().map((g, idx) => (
          <Link key={`${g.id}-${idx}`} to={`/detail/${g.id}`} className="card p-0 overflow-hidden relative bg-black/40">
            <div className="relative mb-20">
              <img src={g.imageUrl} alt={g.name} className="aspect-[3/4] w-full object-cover" />
            </div>
            <div className="absolute top-[calc(90%-20px)] left-1 px-1">
              <div className="text-lg font-semibold line-clamp-2">{g.name}</div>
            </div>
            <div className="absolute bottom-1 right-1 flex items-center gap-1 flex-shrink-0">
              <StarIcon className="w-5 h-5 text-bb-orange" />
              <span className="text-base text-gray-300 font-medium">{(Number(g.averageRating)||0).toFixed(1)}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="flex justify-center pt-2">
        <button
          onClick={() => loadRange(rangeStart, rangeStart + 19)}
          disabled={loading}
          className="rounded-full border border-orange-500 px-5 py-2 text-orange-500 hover:bg-orange-500 hover:text-black transition disabled:opacity-50"
        >
          {loading ? 'Loading…' : 'Load More'}
        </button>
      </div>
    </section>
  )
}
