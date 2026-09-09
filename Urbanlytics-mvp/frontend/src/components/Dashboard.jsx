import { useEffect, useState } from 'react'
import { getDashboard } from '../api/client'

const SOURCE_META = {
  traffic: { label: 'Traffic', color: '#00D4FF' },
  industry: { label: 'Industry', color: '#00E5A0' },
  stubble: { label: 'Stubble Burning', color: '#FF3B5C' },
}

function statusColor(status) {
  const s = status?.toLowerCase()
  if (s === 'hazardous') return '#FF3B5C'
  if (s === 'severe' || s === 'very unhealthy') return '#FF9142'
  if (s === 'moderate') return '#FFD23F'
  return '#00E5A0'
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [timestamp, setTimestamp] = useState(new Date())

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch((err) => setError(err.message))

    const tick = setInterval(() => setTimestamp(new Date()), 1000 * 30)
    return () => clearInterval(tick)
  }, [])

  if (error) {
    return (
      <section className="panel p-6 h-full">
        <p className="text-hazard text-sm">
          Couldn't reach the backend. Confirm it's running at http://localhost:8000.
        </p>
      </section>
    )
  }

  if (!data) {
    return (
      <section className="panel p-6 h-full animate-pulse">
        <div className="h-4 w-24 bg-card-border rounded mb-6" />
        <div className="h-16 w-32 bg-card-border rounded mb-8" />
        <div className="space-y-3">
          <div className="h-3 w-full bg-card-border rounded" />
          <div className="h-3 w-full bg-card-border rounded" />
          <div className="h-3 w-full bg-card-border rounded" />
        </div>
      </section>
    )
  }

  const color = statusColor(data.status)

  return (
    <section className="panel p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-medium text-muted">Current air quality</h2>
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full border"
          style={{ color, borderColor: color + '55', backgroundColor: color + '15' }}
        >
          {data.status}
        </span>
      </div>

      <div className="flex items-baseline gap-2 mt-4">
        <span className="font-mono text-7xl font-semibold tabular-nums" style={{ color }}>
          {data.aqi}
        </span>
        <span className="text-muted text-sm mb-2">AQI</span>
      </div>

      <p className="text-sm text-muted mt-1">{data.location}</p>

      <div className="mt-8">
        <h3 className="text-xs font-medium text-muted mb-3">Pollution sources</h3>
        <div className="space-y-4">
          {Object.entries(data.sources).map(([key, value]) => {
            const meta = SOURCE_META[key] ?? { label: key, color: '#8CA0C4' }
            return (
              <div key={key}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-300">{meta.label}</span>
                  <span className="font-mono text-gray-400">{value}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[#0A1628] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-[width] duration-700 ease-out"
                    style={{ width: `${value}%`, backgroundColor: meta.color }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-auto pt-8 text-xs text-muted">
        Last updated{' '}
        {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </section>
  )
}
