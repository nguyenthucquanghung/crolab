# Generated by Django 3.2.8 on 2021-12-12 18:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_auto_20211212_1757'),
    ]

    operations = [
        migrations.AddField(
            model_name='comment',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, default=None),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='job',
            name='accepted_qty',
            field=models.IntegerField(default=0),
        ),
    ]
