# Generated by Django 5.1 on 2025-01-20 14:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0015_alter_customuser_email_alter_customuser_username'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='image_url',
            field=models.URLField(blank=True, max_length=500, null=True),
        ),
    ]
