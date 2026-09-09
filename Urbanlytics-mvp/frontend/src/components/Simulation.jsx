import { useEffect, useState } from 'react'
import { runSimulation } from '../api/client'

export default function Simulation() {
  const [trafficReduction, setTrafficReduction] = useState(20)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    const handle = setTimeout(() => {
      runSimulation(trafficReduction)
        .then((res) => {
          setResult(res)
          setError(null)
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false))
    }, 150) // debounce so we don't fire a request on every pixel of drag

    return () => clearTimeout(handle)
  }, [trafficReduction])

  return (
    <section className="panel p-6 h-full flex flex-col">
      <h2 className="text-sm font-medium text-muted mb-1">Policy simulation</h2>
      <p className="text-xs text-muted mb-6">Model the effect of reducing traffic</p>

      <div className="mb-8">
        <div className="flex justify-between items-baseline mb-3">
          <label htmlFor="traffic-slider" className="text-sm text-gray-300">
            Traffic reduction
          </label>
          <span className="font-mono text-cyan text-lg font-semibold tabular-nums">
            {trafficReduction}%
          </span>
        </div>
        <input
          id="traffic-slider"
          type="range"
          min={0}
          max={50}
          step={1}
          value={trafficReduction}
          onChange={(e) => setTrafficReduction(Number(e.target.value))}
          className="w-full accent-cyan cursor-pointer"
          style={{ accentColor: '#00D4FF' }}
        />
        <div className="flex justify-between text-[11px] text-muted mt-1">
          <span>0%</span>
          <span>50%</span>
        </div>
      </div>

      {error && (
        <p className="text-hazard text-xs mb-4">
          Couldn't reach the backend. Confirm it's running at http://localhost:8000.
        </p>
      )}

      <div className={`transition-opacity duration-150 ${loading ? 'opacity-60' : 'opacity-100'}`}>
        <div className="flex items-center gap-3 mb-5">
          <div>
            <p className="text-[11px] text-muted mb-1">Current</p>
            <p className="font-mono text-2xl text-gray-300 tabular-nums">
              {result ? Math.round(result.current_aqi) : '—'}
            </p>
          </div>
          <span className="text-muted mt-4">→</span>
          <div>
            <p className="text-[11px] text-muted mb-1">After action</p>
            <p className="font-mono text-2xl text-teal font-semibold tabular-nums">
              {result ? Math.round(result.new_aqi) : '—'}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <p className="font-mono text-4xl font-bold text-teal tabular-nums">
            {result ? `${Math.round(result.reduction_percent)}%` : '—'}
          </p>
          <p className="text-xs text-muted mt-1">reduction in AQI</p>
        </div>

        <div className="rounded-lg border border-card-border bg-[#0A1628] px-4 py-3">
          <p className="text-[11px] text-muted mb-1">Recommendation</p>
          <p className="text-sm text-gray-200">{result?.recommendation ?? 'Calculating…'}</p>
        </div>
      </div>
    </section>
  )
}
