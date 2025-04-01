import './index.css'
import { StrictMode } from 'react'
import { Home } from './pages/home/home'
import { createRoot } from 'react-dom/client'
import { Presentation } from './pages/presentation/presentation'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/presentation",
    element: <Presentation />,
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)