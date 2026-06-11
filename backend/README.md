# PepPredictor modlamp API

This FastAPI service provides the Python/modlamp reference calculations used by PepPredictor for:

- net charge at pH 7.4, amidated C-terminus
- net charge at pH 7.0, amidated C-terminus
- isoelectric point
- Boman index

The Cloudflare Pages frontend can run without this service. When `window.PEPPREDICTOR_API_URL` is configured in `config.js`, the frontend calls this API and uses the returned modlamp descriptors before applying the PepPredictor scoring rules.

## Local Run

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Health check:

```bash
curl http://localhost:8000/health
```

Descriptor request:

```bash
curl -X POST http://localhost:8000/api/modlamp ^
  -H "Content-Type: application/json" ^
  -d "{\"sequences\":[\"GLFDIIKKIAESF\",\"RRWWRF\"]}"
```

## Deployment

Deploy this `backend/` directory as a Python web service. For Render-style services:

- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Root directory: `backend`

After deployment, set the frontend API URL in `config.js`:

```js
window.PEPPREDICTOR_API_URL = "https://your-api-host";
```
