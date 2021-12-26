# Generated by Django 3.2.8 on 2021-12-26 20:05

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_auto_20211226_1919'),
    ]

    operations = [
        migrations.AddField(
            model_name='job',
            name='deadline',
            field=models.IntegerField(default=10),
        ),
        migrations.AddField(
            model_name='task',
            name='accepted_at',
            field=models.DateTimeField(auto_now_add=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='task',
            name='is_submitted',
            field=models.BooleanField(default=False),
        ),
    ]
