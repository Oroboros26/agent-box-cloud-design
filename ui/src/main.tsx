import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MotionConfig } from 'framer-motion'
import './index.css'
import { ThemeProvider } from './lib/theme'
import { AgentsProvider, BoxProvider } from './lib/mock'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Overview from './pages/Overview'
import Home from './pages/Home'
import Inbox from './pages/Inbox'
import Agents from './pages/Agents'
import AddAgent from './pages/AddAgent'
import AgentDetail from './pages/AgentDetail'
import Plan from './pages/Plan'
import Ports from './pages/Ports'
import Sync from './pages/Sync'
import Cost from './pages/Cost'
import Setup from './pages/Setup'

const qc = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: false } } })

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={qc}>
        <MotionConfig reducedMotion="user">
          <BoxProvider><AgentsProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/app" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="inbox" element={<Inbox />} />
                  <Route path="agents" element={<Agents />} />
                  <Route path="agents/new" element={<AddAgent />} />
                  <Route path="agents/:id" element={<AgentDetail />} />
                  <Route path="plan" element={<Plan />} />
                  <Route path="box" element={<Overview />} />
                  <Route path="ports" element={<Ports />} />
                  <Route path="sync" element={<Sync />} />
                  <Route path="cost" element={<Cost />} />
                  <Route path="setup" element={<Setup />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </AgentsProvider></BoxProvider>
        </MotionConfig>
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
