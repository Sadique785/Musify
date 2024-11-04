from django.contrib.auth.management.commands import createsuperuser
from django.core.management import CommandError
from django.contrib.auth import get_user_model

class Command(createsuperuser.Command):
    help = 'Create a superuser with additional fields.'

    def add_arguments(self, parser):
        super().add_arguments(parser)
        parser.add_argument('--user_id', type=int, help='User ID for the superuser')

    def handle(self, *args, **options):
        user_id = options.get('user_id')

        if not user_id:
            raise CommandError('user_id is required.')

        # Get the other fields
        username = options.get('username')
        email = options.get('email')
        password = options.get('password')

        UserModel = get_user_model()
        try:
            user = UserModel.objects.create_superuser(
                username=username,
                email=email,
                user_id=user_id,
                password=password,
                **options
            )
            self.stdout.write(self.style.SUCCESS(f'Successfully created superuser: {user.email}'))
        except Exception as e:
            raise CommandError(f'Error creating superuser: {str(e)}')
