# Generated by Django 5.1 on 2024-09-19 11:31

import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0008_profile_genres_alter_role_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='gender',
            field=models.CharField(blank=True, max_length=50),
        ),
        migrations.AlterField(
            model_name='role',
            name='id',
            field=models.AutoField(primary_key=True, serialize=False),
        ),
    ]