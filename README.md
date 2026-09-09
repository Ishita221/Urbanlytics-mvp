# Urbanlytics MVP — Backend

FastAPI backend for the Urbanlytics air-quality dashboard: current AQI, a 7-day forecast, and a traffic-reduction policy simulator, all with time-of-day-aware mock data.

```
Urbanlytics-mvp/
├── app/
│   ├── __init__.py
│   └── main.py          ← FastAPI app, routes, and mock data
├── .dockerignore
├── .gitignore
├── Dockerfile
├── requirements.txt
├── run.py                ← entry point for local dev
└── README.md
```

## Run locally

```bash
pip install -r requirements.txt
python run.py
```

API runs at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

## Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/dashboard` | GET | Current AQI, status, location, and pollution-source breakdown. Shifts with time of day: traffic-heavy mornings, stubble-heavy evenings, plus a small jitter so it never looks static. |
| `/api/forecast` | GET | 7-day AQI forecast, with a flagged spike day. |
| `/api/simulation` | POST | Accepts `{ "traffic_reduction": 0-50 }`, returns the projected AQI and a recommendation. |

## Deploy to Render

1. Push this repo to GitHub.
2. In Render, create a new **Web Service** and connect the repo.
3. Render will detect the `Dockerfile` automatically — no build/start command needed.
4. Once deployed, note the service URL (e.g. `https://urbanlytics-api.onrender.com`) — you'll need it as `VITE_API_URL` in the frontend deployment.

### CORS note

`app/main.py` currently allows all origins (`allow_origins=["*"]`) for MVP convenience. Once your frontend is deployed, restrict this to its actual domain:

```python
allow_origins=["https://your-frontend.vercel.app"]
```

## Test with Docker locally

```bash
docker build -t urbanlytics-api .
docker run -p 8000:8000 urbanlytics-api
```
