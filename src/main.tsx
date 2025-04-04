//main.tsx
import './index.css'
import { StrictMode } from 'react'
import { Home } from './pages/home/home'
import { createRoot } from 'react-dom/client'
import { Presentation } from './pages/presentation/presentation'
import { JoinRoom } from './pages/joinRoom/joinRoom'
import { PresentationViewer } from './pages/presentationViewer/presentationViewer'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/presentation/:id",
    element: <Presentation />,
  },
  {
    path: "/join",
    element: <JoinRoom />,
  },
  {
    path: "/view/:roomId", 
    element: <PresentationViewer />,
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)