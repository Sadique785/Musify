# Generated by Django 5.1 on 2024-09-16 13:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0002_profile_relationship'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='customuser',
            name='id',
        ),
        migrations.AddField(
            model_name='customuser',
            name='id',
            field=models.AutoField(primary_key=True, serialize=False),
        ),
    ]