from django.contrib import admin
from django.contrib.auth import user_logged_in
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from .list_admin import ListAdminMixin
from .models import SiteSettings, TimeZone, UserTimeZone
from django.core.exceptions import PermissionDenied
from django.template.response import TemplateResponse
from django.contrib.admin.options import IncorrectLookupParameters
from .utils import set_session_timezone
from django.template.defaulttags import register


class UserTimeZoneAdmin(admin.ModelAdmin):
    list_display = ['user', 'timezone']
    autocomplete_fields = ['timezone']


class TimeZoneAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']


def create_user_profile(sender, instance, created, **kwargs):
    if created:
        first = TimeZone.objects.first()
        UserTimeZone.objects.create(user=instance, timezone=first)


post_save.connect(create_user_profile, sender=User)


@receiver(user_logged_in)
def assign_user_timezone(request, user, **kwargs):
    tz_name = 'GMT'
    try:
        user_tz = user.time_zone
        timezone = user_tz.timezone
        tz_name = timezone.name
    except:
        a = 1
    set_session_timezone(request.session, tz_name)


class GroupedAdmin(admin.ModelAdmin):

    @register.filter
    def get_item(dictionary, key):
        return dictionary.get(key) or ''

    def changelist_view_parent(self, request, extra_context=None):
        opts = self.model._meta
        app_label = opts.app_label
        if not self.has_view_or_change_permission(request):
            raise PermissionDenied
        try:
            cl = self.get_changelist_instance(request)
        except IncorrectLookupParameters:
            raise

        context = {
            **self.admin_site.each_context(request),
            'module_name': str(opts.verbose_name_plural),
            'title': cl.title,
            'cl': cl,
            'opts': cl.opts,
            **(extra_context or {}),
        }

        request.current_app = self.admin_site.name
        template_list = [
            'admin/%s/%s/grouped_list.html' % (app_label, opts.model_name),
            'admin/%s/grouped_list.html' % app_label,
            'admin/grouped_list.html'
        ]
        res = TemplateResponse(request, self.change_list_template or template_list, context)
        return res

    def get_paginator(self, request, queryset, per_page, orphans=0, allow_empty_first_page=True):
        cnt = self.total_count
        list_for_counts = [x for x in range(cnt)]
        per_page = self.per_page_records
        res = self.paginator(list_for_counts, per_page, orphans, allow_empty_first_page)
        return res

    @classmethod
    def query_set_to_list(cls, raw_qs, columns):
        list_from_qs = list(raw_qs)
        list_res = []
        for row in list_from_qs:
            list_row = {'id': row.id, 'html': ''}
            for col in columns:
                if col == 'id':
                    continue
                list_row['html'] += '<td>'+str(getattr(row, col))+'</td>'
            list_res.append(list_row)
        return list_res


class SettingAdmin(admin.ModelAdmin):
    list_display = ['field_name', 'field_value']


admin.site.register(SiteSettings, SettingAdmin)
admin.site.register(TimeZone, TimeZoneAdmin)
admin.site.register(UserTimeZone, UserTimeZoneAdmin)
