cd backend
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass 
.\.venv\Scripts\Activate.ps1
python manage.py migrate
python manage.py runserver