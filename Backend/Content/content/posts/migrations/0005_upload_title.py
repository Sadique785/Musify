# Generated by Django 5.1.1 on 2024-10-14 05:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('posts', '0004_reportedpost'),
    ]

    operations = [
        migrations.AddField(
            model_name='upload',
            name='title',
            field=models.CharField(blank=True, default='Title', max_length=300),
        ),
    ]