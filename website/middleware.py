from django.utils import timezone
from django.utils.deprecation import MiddlewareMixin
from .utils import get_session_timezone


class TimezoneMiddleware(MiddlewareMixin):

    def get_timezone_from_request(self, request):
        session = getattr(request, 'session', None)
        if session:
            res = get_session_timezone(session)
            return res

    def process_request(self, request):
        zone = self.get_timezone_from_request(request)
        if zone:
            timezone.activate(zone)
