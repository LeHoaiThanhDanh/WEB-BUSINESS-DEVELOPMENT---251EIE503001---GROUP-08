import json
import random
from pathlib import Path

from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.decorators import (
    api_view,
    permission_classes,
    authentication_classes,
)
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

PRODUCTS_FILE = settings.BASE_DIR.parent / 'public' / 'data' / 'products.json'


@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])  # disable SessionAuthentication to avoid CSRF 403
@csrf_exempt
def login_view(request):
    username = (request.data.get('username') or '').strip()
    password = (request.data.get('password') or '').strip()
    if not username or not password:
        return Response({'ok': False, 'message': 'Thiếu thông tin'}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(username=username, password=password)
    if not user:
        return Response({'ok': False, 'message': 'Sai tài khoản hoặc mật khẩu'}, status=status.HTTP_401_UNAUTHORIZED)

    data = {
        'id': user.id,
        'username': user.username,
        'email': user.email or ''
    }
    return Response({'ok': True, 'user': data}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])  # disable SessionAuthentication to avoid CSRF 403
@csrf_exempt
def register_view(request):
    U = get_user_model()
    username = (request.data.get('username') or '').strip()
    password = (request.data.get('password') or '').strip()
    email = (request.data.get('email') or '').strip()
    full_name = (request.data.get('fullName') or '').strip()

    if not username or not password:
        return Response({'ok': False, 'message': 'Thiếu username/password'}, status=status.HTTP_400_BAD_REQUEST)
    if U.objects.filter(username=username).exists():
        return Response({'ok': False, 'message': 'Tên đăng nhập đã tồn tại'}, status=status.HTTP_400_BAD_REQUEST)

    user = U.objects.create_user(username=username, password=password, email=email)
    if full_name:
        # Store full name in first_name for simplicity
        user.first_name = full_name
        user.save(update_fields=['first_name'])

    data = {
        'id': user.id,
        'username': user.username,
        'email': user.email or ''
    }
    return Response({'ok': True, 'user': data}, status=status.HTTP_201_CREATED)


def _load_products():
    try:
        with Path(PRODUCTS_FILE).open(encoding='utf-8') as handle:
            data = json.load(handle)
            return data if isinstance(data, list) else []
    except FileNotFoundError:
        return []
    except json.JSONDecodeError:
        return []


@api_view(['GET'])
@permission_classes([AllowAny])
@authentication_classes([])
def random_products_view(request):
    products = _load_products()
    if not products:
        return Response({'ok': False, 'items': []}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    try:
        count = int(request.query_params.get('count', '4'))
    except (TypeError, ValueError):
        count = 4
    count = max(1, min(count, 20))

    exclude_raw = request.query_params.getlist('exclude')
    exclude_ids = set()
    for raw in exclude_raw:
        try:
            exclude_ids.add(int(raw))
        except (TypeError, ValueError):
            if raw:
                exclude_ids.add(raw)

    def _is_excluded(item):
        item_id = item.get('id')
        if item_id is None:
            return False
        return item_id in exclude_ids or str(item_id) in exclude_ids

    filtered = [item for item in products if not _is_excluded(item)]
    if len(filtered) < len(products):
        extras = [item for item in products if item not in filtered]
    else:
        extras = []
    pool = filtered + extras
    if not pool:
        pool = products

    selected = random.sample(pool, k=min(count, len(pool)))
    return Response({'ok': True, 'items': selected}, status=status.HTTP_200_OK)
