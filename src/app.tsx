import {useEffect} from 'react'
import {Outlet, useLocation} from 'react-router-dom'
import type {RouteRecord} from 'vite-react-ssg'
import {Candidates} from './pages/candidates'
import {Contact} from './pages/contact'
import {Home} from './pages/home'
import {NotFound} from './pages/not-found'

/* Reset scroll to the top on route changes. In-page anchor links (with a hash)
   are left alone so they can still scroll to their target. */
function ScrollToTop() {
  const {pathname, hash} = useLocation()
  useEffect(() => {
    if (hash) return
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

function RootLayout() {
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  )
}

/* Route table consumed by vite-react-ssg. Each route is prerendered to static
   HTML at build time. */
export const routes: RouteRecord[] = [
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {index: true, element: <Home />},
      {path: 'candidates', element: <Candidates />},
      {path: 'contact', element: <Contact />},
      {path: '*', element: <NotFound />},
    ],
  },
]
