# Generated by Django 5.1 on 2024-12-31 13:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('friends', '0003_notificationsettings'),
    ]

    operations = [
        migrations.AlterField(
            model_name='notificationsettings',
            name='is_enabled',
            field=models.BooleanField(default=True),
        ),
    ]
