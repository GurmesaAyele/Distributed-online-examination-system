from django.apps import AppConfig
from django.db.models.signals import post_migrate

class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'

    def ready(self):
        from django.contrib.auth import get_user_model
        from django.db.models.signals import post_migrate

        def create_default_admin(sender, **kwargs):
            User = get_user_model()
            if not User.objects.filter(username='Grum21').exists():
                User.objects.create_superuser(
                    username='Grum21',
                    password='14162121',
                    role='admin',
                    email='admin@example.com'
                )

        post_migrate.connect(create_default_admin, sender=self)
