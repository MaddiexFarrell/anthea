from django.db import migrations

# Default tags to remove from the seeded set.
REMOVE = ['Sales', 'Operations', 'Product', 'Design', 'Engineering', 'Data']


def remove(apps, schema_editor):
    Tag = apps.get_model('core', 'Tag')
    Tag.objects.filter(name__in=REMOVE).delete()


def restore(apps, schema_editor):
    Tag = apps.get_model('core', 'Tag')
    for name in REMOVE:
        Tag.objects.get_or_create(name=name)


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0007_seed_tags_map_experience'),
    ]

    operations = [
        migrations.RunPython(remove, restore),
    ]
