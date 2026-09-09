import Dashboard from './components/Dashboard'
import Forecast from './components/Forecast'
import Simulation from './components/Simulation'

export default function App() {
  return (
    <div className="min-h-screen bg-base flex flex-col">
      <header className="border-b border-card-border px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Urbanlytics</h1>
          <p className="text-xs text-muted mt-0.5">Delhi air quality monitoring &amp; response</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="h-2 w-2 rounded-full bg-teal" />
          Live
        </div>
      </header>

      <main className="flex-1 p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto h-full">
          <div className="lg:col-span-1">
            <Dashboard />
          </div>
          <div className="lg:col-span-1">
            <Forecast />
          </div>
          <div className="lg:col-span-1">
            <Simulation />
          </div>
        </div>
      </main>
    </div>
  )
}
