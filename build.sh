#!/bin/bash

# Install dependencies
pip install -r requirements.txt

# Collect static files
cd backend
python manage.py collectstatic --noinput
