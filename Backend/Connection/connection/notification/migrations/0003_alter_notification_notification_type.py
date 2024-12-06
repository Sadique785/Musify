# Generated by Django 5.1.3 on 2024-12-01 19:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('notification', '0002_notification'),
    ]

    operations = [
        migrations.AlterField(
            model_name='notification',
            name='notification_type',
            field=models.CharField(choices=[('FOLLOW_REQUEST', 'Follow Request'), ('FOLLOW_CANCELLED', 'Follow Request Cancelled'), ('FOLLOW_ACCEPT', 'Follow Request Accepted'), ('POST_LIKE', 'Post Like'), ('POST_COMMENT', 'Post Comment')], max_length=20),
        ),
    ]
