import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const CATS = [
  { key: 'Adventure', name: 'Adventure',   img: '/home/category/adventure.png' },
  { key: 'Bluffing',  name: 'Bluffing',    img: '/home/category/bluffing.png' },
  { key: 'Party Game',     name: 'Party Games', img: '/home/category/party.png' },
  { key: 'Puzzle',    name: 'Puzzle',      img: '/home/category/puzzle.png' },
]

export default function CategorySection() {
  return (
    <section className="space-y-6">
      <h2 className="h-section">Categories</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {CATS.map((cat) => (
          <Link
            key={cat.name}
            to={`/category/${cat.key}`}
            className="group relative aspect-[377/196] rounded-lg overflow-hidden transition-transform hover:scale-105"
          >
            <img
              src={cat.img}
              alt={cat.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4">
              <h3 className="text-white text-lg md:text-xl font-bold">{cat.name}</h3>
            </div>
          </Link>
        ))}
      </div>

      <div className="flex justify-end">
        <Link
          to="/category"
          className="flex items-center gap-2 text-white hover:text-bb-orange transition-colors"
        >
          <span className="text-lg font-semibold">View More</span>
          <ArrowRight className="h-6 w-6" />
        </Link>
      </div>
    </section>
  );
}
