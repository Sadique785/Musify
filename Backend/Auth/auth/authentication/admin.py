from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DefaultUserAdmin
from .models import CustomUser, Role, UserRole,Profile, Talent, Genre

@admin.register(CustomUser)
class CustomUserAdmin(DefaultUserAdmin):
    model = CustomUser
    # Customize fieldsets and add_fieldsets as needed
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('username',)}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2'),
        }),
    )
    list_display = ('email', 'username', 'is_staff')
    search_fields = ('email', 'username')
    ordering = ('email',)


admin.site.register(Role)


admin.site.register(UserRole)

admin.site.register(Profile)
admin.site.register(Talent)
admin.site.register(Genre)