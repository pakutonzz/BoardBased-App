import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { CONFIG } from '@/lib/config'

function StarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21 12 17.27z" fill="currentColor" />
    </svg>
  )
}

type Game = { id: number; name: string; imageUrl?: string; averageRating?: string | number }

export default function CategoryResultsPage() {
  const { category = '' } = useParams<{ category: string }>()
  const decoded = decodeURIComponent(category)

  const [items, setItems]   = React.useState<Game[]>([])
  const [total, setTotal]   = React.useState<number | null>(null)
  const [pageSize, setPS]   = React.useState<number>(20)   // initial 20 as requested
  const [loading, setLoad]  = React.useState(false)
  const [error, setError]   = React.useState<string | null>(null)

  React.useEffect(() => {
    let abort = false
    async function run() {
      try {
        setLoad(true); setError(null)
        const url = `${CONFIG.API_BASE}/board-games?pageSize=${pageSize}&category=${encodeURIComponent(decoded)}&sort=id:asc`
        const res = await fetch(url)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (!abort) {
          const rows: Game[] = data?.rows ?? data ?? []
          setItems(rows)                 // stable (id:asc) list of first N items
          if (typeof data?.total === 'number') setTotal(data.total)
        }
      } catch (e: any) {
        if (!abort) setError(e?.message ?? 'Failed to load')
      } finally {
        if (!abort) setLoad(false)
      }
    }
    run()
    return () => { abort = true }
  }, [decoded, pageSize])

  const canLoadMore = total == null ? true : items.length < total

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="h-section">{decoded || 'Category'}</h2>
          {total != null && (
            <p className="text-sm text-gray-400 mt-1">Showing {items.length} of {total} games</p>
          )}
        </div>
      </div>

      {error && <div className="card p-4 text-red-300">Error: {error}</div>}
      {loading && items.length === 0 && <div className="card p-4 text-gray-300">Loading…</div>}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
        {items.map((g, idx) => (
          <Link
            key={`${g.id}-${idx}`}
            to={`/detail/${g.id}`}
            className="card p-0 overflow-hidden relative bg-black/40"
          >
            <div className="relative mb-20">
              <img src={g.imageUrl} alt={g.name} className="aspect-[3/4] w-full object-cover" />
            </div>
            <div className="absolute top-[calc(90%-20px)] left-1 px-1">
              <div className="text-lg font-semibold line-clamp-2">{g.name}</div>
            </div>
            <div className="absolute bottom-1 right-1 flex items-center gap-1">
              <StarIcon className="w-5 h-5 text-bb-orange" />
              <span className="text-base text-gray-300 font-medium">
                {(Number(g.averageRating) || 0).toFixed(1)}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="flex justify-center pt-2">
        <button
          onClick={() => setPS(ps => ps + 20)}  // increase pageSize by +20 each click
          disabled={loading || !canLoadMore}
          className="rounded-full border border-orange-500 px-5 py-2 text-orange-500 hover:bg-orange-500 hover:text-black transition disabled:opacity-50"
        >
          {loading ? 'Loading…' : canLoadMore ? 'Load More' : 'No more results'}
        </button>
      </div>
    </section>
  )
}
