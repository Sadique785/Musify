# Generated by Django 5.1.1 on 2024-12-25 05:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('posts', '0003_contentuser_blocked_users'),
    ]

    operations = [
        migrations.AddField(
            model_name='upload',
            name='content_source',
            field=models.CharField(choices=[('UPLOAD', 'Direct Upload'), ('EDITED_AUDIO', 'Edited Audio')], default='UPLOAD', max_length=20),
        ),
    ]