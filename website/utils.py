import pytz
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

TIMEZONE_SESSION_KEY = 'TIMEZONE_SESSION_KEY'


def set_session_timezone(session, tz_name):
    session[TIMEZONE_SESSION_KEY] = tz_name
    a = 1


def get_session_timezone(session):
    res = session.get(TIMEZONE_SESSION_KEY)
    return res


def coerce_timezone(zone):
    try:
        return pytz.timezone(zone)
    except pytz.UnknownTimeZoneError:
        raise ValidationError(
            _('Unknown timezone.'), code='invalid'
        )
