# Generated by Django 5.1 on 2024-09-21 05:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0010_alter_profile_name'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='location',
            field=models.CharField(default='city', max_length=255),
        ),
    ]
