# Generated by Django 5.1 on 2024-09-21 04:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0009_profile_gender_alter_role_id'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='name',
            field=models.CharField(default='your name', max_length=255),
        ),
    ]
