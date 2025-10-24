from django.urls import path
from .views import login_view, register_view, random_products_view

urlpatterns = [
    path('login', login_view, name='api-login'),
    path('register', register_view, name='api-register'),
    path('products/random', random_products_view, name='api-products-random'),
]
