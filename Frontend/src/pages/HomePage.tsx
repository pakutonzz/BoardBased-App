import HomeHero from '@/components/home/HomeHero'
import CategorySection from '@/components/home/CategorySection'
import RecommendedGames from '@/components/home/RecommendedGames'
import BoardGamesGrid from '@/components/home/BoardGamesGrid'

export default function HomePage(){
  return (
    <div className="min-h-screen pb-16">
      <div className="ccontainer-app space-y-16 pt-8">
        <HomeHero/>
        <CategorySection/>
        <RecommendedGames/>
        <BoardGamesGrid/>
      </div>
    </div>
  )
}
