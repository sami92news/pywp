from django.conf import settings
from django.conf.urls import url
from django.contrib import admin
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.urls import path, include, re_path
from django.views.generic import RedirectView
from django.views.static import serve

media_urls = []
if settings.LOCALHOST:
    media_urls = [re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT, }), ]


admin.autodiscover()

site_urls = [
    url('favicon.ico', RedirectView.as_view(url='/static/website/images/favicon.ico')),
    url('serviceworker.js', RedirectView.as_view(url='/static/website/js/serviceworker.js')),
    path('admin/', admin.site.urls),
]


@login_required
def home_view(request):
    html = '<div><h3>Home Page</h3> <a href="/admin">Admin</a> <a href="/ajax/news/add-draft-slug/">Draft</a></div>'
    res = HttpResponse(html)
    return res

app_urls = [
    path('utils/', include('website.urls')),
    path('', home_view),
]

urlpatterns = site_urls + media_urls + app_urls
