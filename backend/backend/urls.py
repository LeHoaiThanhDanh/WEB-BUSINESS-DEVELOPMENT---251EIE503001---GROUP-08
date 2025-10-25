from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('accounts.urls')),
    # Frontend pages rendered as Django templates
    path('', TemplateView.as_view(template_name='Pages/Homepage/Home.html'), name='home'),
    path('home/', TemplateView.as_view(template_name='Pages/Homepage/Home.html'), name='home_alias'),
    path('index/', TemplateView.as_view(template_name='Pages/Homepage/Home.html'), name='index'),
    path('home2/', TemplateView.as_view(template_name='Pages/Homepage/Home.html'), name='home2'),
    path('login/', TemplateView.as_view(template_name='Pages/Login/Login.html'), name='login'),
    path('login-admin/', TemplateView.as_view(template_name='Pages/Login/LoginAdmin.html'), name='login_admin'),
    path('register/', TemplateView.as_view(template_name='Pages/Register/Register.html'), name='register'),
    path('product/', TemplateView.as_view(template_name='Pages/Product/product.html'), name='product'),
    path('menu/', TemplateView.as_view(template_name='Pages/Menu/menu.html'), name='menu'),
    path('cart/', TemplateView.as_view(template_name='Pages/Cart/cart.html'), name='cart'),
    path('profile/', TemplateView.as_view(template_name='Pages/Profile/profile.html'), name='profile'),
    path('contact/', TemplateView.as_view(template_name='Pages/Contact/Contact.html'), name='contact'),
    path('agency/', TemplateView.as_view(template_name='Pages/Agency/agency.html'), name='agency'),
    path('aboutus/', TemplateView.as_view(template_name='Pages/Aboutus/Aboutus.html'), name='aboutus'),
]

# Serve legacy absolute asset paths like "/assets/..." during development
urlpatterns += static('/assets/', document_root=(settings.BASE_DIR.parent / 'assets'))
urlpatterns += static('/src/', document_root=(settings.BASE_DIR.parent / 'src'))
urlpatterns += static('/public/', document_root=(settings.BASE_DIR.parent / 'public'))
urlpatterns += static('/lang/', document_root=(settings.BASE_DIR.parent / 'lang'))
