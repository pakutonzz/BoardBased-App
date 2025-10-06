import { createBrowserRouter } from 'react-router-dom'
import Shell from '@/components/layout/Shell'
import HomePage from '@/pages/HomePage'
import CrawlPage from '@/pages/CrawlPage'
import DetailPage from '@/pages/DetailPage'
import SettingsPage from '@/pages/SettingsPage'
import CategoryPage from '@/pages/CategoryPage'
import CategoryResultsPage from '@/pages/CategoryResultsPage'


export const router = createBrowserRouter([
  {
    path: '/',
    element: <Shell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'crawl', element: <CrawlPage /> },
      { path: 'detail/:id', element: <DetailPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'category', element: <CategoryPage /> },
      { path: '/category/:category', element: <CategoryResultsPage /> }
    ]
  }
])
