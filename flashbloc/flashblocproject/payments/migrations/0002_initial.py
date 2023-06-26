# Generated by Django 4.0.3 on 2023-06-26 01:45

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('channelstate', '0002_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('payments', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='transactionlocal',
            name='receiver',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='topupreceipt',
            name='ledger',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='channelstate.ledger'),
        ),
        migrations.AddField(
            model_name='topupreceipt',
            name='sender',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='ptplocal',
            name='ledger',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='channelstate.ledger'),
        ),
        migrations.AddField(
            model_name='ptplocal',
            name='payment_id',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='payments.ptpglobal'),
        ),
        migrations.AddField(
            model_name='ptplocal',
            name='sender',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='ptpglobal',
            name='destination',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='AddressTo', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='ptpglobal',
            name='origin',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='accountFrom', to=settings.AUTH_USER_MODEL),
        ),
    ]
