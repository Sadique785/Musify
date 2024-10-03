from django.core.management.commands.runserver import Command as RunserverCommand

class Command(RunserverCommand):
    def add_arguments(self, parser):
        super().add_arguments(parser)
        # Override the default port to 8000
        parser.add_argument('addrport', nargs='?', default='0.0.0.0:8001')
