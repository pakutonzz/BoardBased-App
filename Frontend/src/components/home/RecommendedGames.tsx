import React from 'react'
import { Link } from 'react-router-dom'
import { CONFIG } from '@/lib/config'

type Game = {
  id: number
  name: string
  imageUrl?: string
  averageRating?: string | number
  playersMin?: number
  playersMax?: number
  timeMin?: number
  timeMax?: number
  agePlus?: number
  description?: string
}

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

const truncate = (s: string | undefined, n = 160) => {
  if (!s) return ''
  const clean = s.replace(/<\/?[^>]+(>|$)/g, '') // strip tags if any
  return clean.length > n ? clean.slice(0, n).trimEnd() + '…' : clean
}


export default function RecommendedGames() {
  const [games, setGames] = React.useState<Game[]>([])
  const [activeIndex, setActiveIndex] = React.useState(0)

  React.useEffect(() => {
    fetch(`${CONFIG.API_BASE}/board-games?pageSize=10`)
      .then(r => r.json())
      .then(data => setGames((data?.rows as Game[]) ?? []))
      .catch(() => setGames([]))
  }, [])

  const g = games[activeIndex]

  const players = g ? `${g.playersMin ?? '-'}–${g.playersMax ?? '-'}` : '-'
  const minutes =
    g && (g.timeMin ?? g.timeMax) !== undefined
      ? `${g.timeMin ?? '-'}${g.timeMax ? `–${g.timeMax}` : ''}`
      : '-'
  const ages = g?.agePlus != null ? `${g.agePlus}+` : '-'
  const rating = g?.averageRating != null ? Number(g.averageRating).toFixed(1) : '0.0'

  return (
    <section className="space-y-6">
      <h2 className="h-section">Recommended Games</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT — numbered list with background cover + badge */}
        <div className="grid grid-cols-2 gap-3">
          {games.map((game, idx) => (
            <button
              key={game.id}
              onClick={() => setActiveIndex(idx)}
              aria-pressed={idx === activeIndex}
              className={[
                'group relative w-full overflow-hidden rounded-lg border transition-all',
                'h-20 sm:h-24', // item height
                idx === activeIndex
                  ? 'border-[hsl(var(--bb-orange))] shadow-[0_8px_20px_hsl(var(--bb-orange)/.35)]'
                  : 'border-white/10 hover:border-[hsl(var(--bb-orange))]/60',
              ].join(' ')}
            >
              {/* background image */}
              <img
                src={game.imageUrl}
                alt={game.name}
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
              {/* dark veil for text contrast */}
              <div className="absolute inset-0 bg-black/45 group-hover:bg-black/35 transition-colors" />

              {/* Full-height diagonal black wedge with orange line */}
              <div className="absolute left-0 top-0 h-full w-15 bg-black transform -skew-x-12 origin-top-left">
                {/* Orange diagonal line accent */}
                <div className="absolute right-0 top-0 h-full w-1 bg-bb-orange transform"></div>
              </div>
              
              {/* Number positioned over the black wedge */}
              <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                <span className="text-white font-bold text-2xl">{idx + 1}</span>
              </div>

              {/* game name bottom-right */}
              <div className="absolute right-3 bottom-2 max-w-[70%] text-right">
                <div className="text-white font-semibold text-base sm:text-xl drop-shadow md:drop-shadow-md line-clamp-1">
                  {game.name}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* RIGHT — featured showcase card */}
        <div className="lg:col-span-2 relative rounded-lg overflow-hidden h-[558px]">
          {g && (
            <>
              {/* Background image */}
              <img
                src={g.imageUrl}
                alt={g.name}
                className="absolute inset-0 w-full h-full object-cover"
                loading="eager"
              />

              {/* Dark veil to improve contrast */}
              <div className="absolute inset-0 bg-black/70" />

              <div className="pointer-events-none absolute -top-30 -left-30 w-[700px] h-[150px] bg-[#1E1E1E] rotate-[-24deg]">
                {/* Orange diagonal line accent */}
                <div className="pointer-events-none absolute bottom-0 left-0 w-full h-1 bg-bb-orange transform"></div>
              </div>

              <div className="pointer-events-none absolute -bottom-30 -right-30 w-[700px] h-[150px] bg-[#1E1E1E] rotate-[-24deg]">
                {/* Orange diagonal line accent */}
                <div className="pointer-events-none absolute top-0 left-0 w-full h-1 bg-bb-orange transform"></div>
              </div>

              {/* Content */}
              <div className="relative h-full grid grid-cols-1 sm:grid-cols-3">
                {/* Left column: text block vertically centered */}
                <div className="sm:col-span-2 flex">
                  <div className="flex flex-col justify-center gap-4 pl-16 pr-8 py-8 w-full">
                    <div className="absolute top-5 left-10 text-white/95 text-6xl font-semibold">{activeIndex + 1}</div>

                    <h3 className="text-white text-3xl md:text-4xl font-bold leading-tight">
                      {g.name}
                    </h3>

                    {/* Description (truncated) */}
                    {g.description && (
                      <p className="text-white/85 text-base md:text-lg max-w-[640px]">
                        {truncate(g.description, 180)}
                      </p>
                    )}

                    {/* Stats row */}
                    <div className="mt-2 flex flex-wrap gap-8 md:gap-12">
                      <div>
                        <div className="text-bb-orange text-xl md:text-2xl font-bold">
                          {g.playersMin ?? '-'}–{g.playersMax ?? '-'}
                        </div>
                        <div className="text-white/90">Players</div>
                      </div>
                      <div>
                        <div className="text-bb-orange text-xl md:text-2xl font-bold">
                          {g.timeMin ?? '-'}{g.timeMax ? `–${g.timeMax}` : ''}
                        </div>
                        <div className="text-white/90">Minutes</div>
                      </div>
                      <div>
                        <div className="text-bb-orange text-xl md:text-2xl font-bold">
                          {g.agePlus != null ? `${g.agePlus}+` : '-'}
                        </div>
                        <div className="text-white/90">Ages</div>
                      </div>
                    </div>

                    {/* CTA under stats */}
                    <div className="pt-2">
                      <Link
                        to={`/detail/${g.id}`}
                        className="inline-block rounded-full border-2 border-bb-orange px-5 py-2 text-bb-orange font-semibold hover:bg-bb-orange hover:border-white hover:text-white transition"
                      >
                        More Details
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Right column: cover image card */}
                <div className="relative hidden sm:block">
                  <div className="absolute left-6 top-4/10 -translate-y-1/2">
                    <img
                      src={g.imageUrl}
                      alt={g.name}
                      className="w-[247px] h-[339px] object-cover rounded-2xl shadow-2xl"
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* Rating badge bottom-right */}
                <div className="absolute right-6 bottom-4 flex items-center gap-2">
                  <svg viewBox="0 0 24 24" className="w-7 h-7 text-bb-orange" aria-hidden="true">
                    <path
                      d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21 12 17.27z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="text-white text-2xl font-bold">
                    {g.averageRating != null ? Number(g.averageRating).toFixed(1) : '0.0'}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
