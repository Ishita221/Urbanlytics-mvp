import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { getForecast } from '../api/client'

function CustomDot(props) {
  const { cx, cy, payload } = props
  const isAlert = Boolean(payload.alert)
  return (
    <circle
      cx={cx}
      cy={cy}
      r={isAlert ? 6 : 4}
      fill={isAlert ? '#FF3B5C' : '#00D4FF'}
      stroke={isAlert ? '#FF3B5C' : '#00D4FF'}
      strokeWidth={isAlert ? 2 : 0}
      fillOpacity={isAlert ? 1 : 0.9}
    />
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className="panel px-3 py-2 text-xs shadow-lg">
      <p className="text-muted mb-0.5">{label}</p>
      <p className="font-mono text-cyan font-semibold">{point.aqi} AQI</p>
      {point.alert && <p className="text-hazard mt-0.5">Spike expected</p>}
    </div>
  )
}

export default function Forecast() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    getForecast()
      .then(setData)
      .catch((err) => setError(err.message))
  }, [])

  const alertDay = data?.find((d) => d.alert)

  if (error) {
    return (
      <section className="panel p-6 h-full">
        <p className="text-hazard text-sm">
          Couldn't reach the backend. Confirm it's running at http://localhost:8000.
        </p>
      </section>
    )
  }

  return (
    <section className="panel p-6 h-full flex flex-col">
      <h2 className="text-sm font-medium text-muted mb-1">7-day forecast</h2>
      <p className="text-xs text-muted mb-4">Projected daily AQI for Delhi</p>

      {alertDay && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg border border-hazard/40 bg-hazard/10">
          <span aria-hidden="true">⚠️</span>
          <p className="text-xs text-red-200">
            Spike on {alertDay.day} — expected {alertDay.aqi} AQI
          </p>
        </div>
      )}

      <div className="flex-1 min-h-[220px]">
        {!data ? (
          <div className="h-full w-full animate-pulse bg-card-border rounded-lg" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
              <CartesianGrid stroke="#26385C" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="day"
                stroke="#8CA0C4"
                tick={{ fill: '#8CA0C4', fontSize: 12 }}
                axisLine={{ stroke: '#26385C' }}
                tickLine={false}
              />
              <YAxis
                stroke="#8CA0C4"
                tick={{ fill: '#8CA0C4', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                domain={['dataMin - 20', 'dataMax + 20']}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#26385C' }} />
              <Line
                type="monotone"
                dataKey="aqi"
                stroke="#00D4FF"
                strokeWidth={2}
                dot={<CustomDot />}
                activeDot={{ r: 7, fill: '#00D4FF' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  )
}
