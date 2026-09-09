// ✅ UPDATED BACKEND URL - RENDER DEPLOYMENT
const BASE_URL = 'https://urbanlytics-mvp-1.onrender.com/api';

async function handleResponse(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail ? JSON.stringify(body.detail) : `Request failed: ${res.status}`)
  }
  return res.json()
}

export async function getDashboard() {
  const res = await fetch(`${BASE_URL}/dashboard`)
  return handleResponse(res)
}

export async function getForecast() {
  const res = await fetch(`${BASE_URL}/forecast`)
  return handleResponse(res)
}

export async function runSimulation(trafficReduction) {
  const res = await fetch(`${BASE_URL}/simulation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ traffic_reduction: trafficReduction })
  })
  return handleResponse(res)
}
