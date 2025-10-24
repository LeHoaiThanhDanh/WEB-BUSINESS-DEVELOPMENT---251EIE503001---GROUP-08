Backend (Django + DRF)

Quick start

1) Create venv and install deps
   python -m venv .venv
   .venv\Scripts\activate   # Windows PowerShell: .venv\Scripts\Activate.ps1
   pip install -r requirements.txt

2) Migrate DB
   python manage.py migrate

3) Run server on port 4000 to match frontend API_BASE
   python manage.py runserver 4000

API contract (matches existing frontend)

- POST /api/login
  Body: { "username": "...", "password": "..." }
  Response OK: { "ok": true, "user": { "id": 1, "username": "...", "email": "..." } }
  Response Error: { "ok": false, "message": "..." }

- POST /api/register
  Body: { "username": "...", "password": "...", "email"?: "...", "fullName"?: "..." }
  Response OK: { "ok": true, "user": { ... } }

CORS is enabled for development (CORS_ALLOW_ALL_ORIGINS=True).
If you prefer port 8000, set in browser: localStorage.setItem('API_BASE','http://localhost:8000')

