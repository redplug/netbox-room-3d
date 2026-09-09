# Generated against NetBox 4.5.0 / Django 5.2.9.
import django.db.models.deletion
import netbox.models.deletion
import taggit.managers
import utilities.json
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True
    dependencies = [('dcim', '0225_gfk_indexes'), ('extras', '0134_owner')]
    operations = [
        migrations.CreateModel(
            name='RoomLayout',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False)),
                ('created', models.DateTimeField(auto_now_add=True, null=True)),
                ('last_updated', models.DateTimeField(auto_now=True, null=True)),
                ('custom_field_data', models.JSONField(blank=True, default=dict, encoder=utilities.json.CustomFieldJSONEncoder)),
                ('name', models.CharField(max_length=100)),
                ('width', models.PositiveIntegerField(default=12000)),
                ('depth', models.PositiveIntegerField(default=8000)),
                ('height', models.PositiveIntegerField(default=3000)),
                ('grid', models.PositiveIntegerField(default=600)),
                ('include_descendants', models.BooleanField(default=False)),
                ('revision', models.PositiveIntegerField(default=1)),
                ('scene', models.JSONField(blank=True, default=dict)),
                ('location', models.OneToOneField(on_delete=django.db.models.deletion.PROTECT, related_name='room_3d', to='dcim.location')),
                ('tags', taggit.managers.TaggableManager(through='extras.TaggedItem', to='extras.Tag')),
            ],
            options={'ordering': ('name',)},
            bases=(netbox.models.deletion.DeleteMixin, models.Model),
        ),
    ]
