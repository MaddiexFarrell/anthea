from django.db import migrations

# Predefined focus-area tags. Admins can add/rename/delete more from the
# dashboard's "Manage tags" page later.
PREDEFINED_TAGS = [
    'Growth',
    'Marketing',
    'Social media',
    'Content',
    'Brand',
    'Sales',
    'Operations',
    'Product',
    'Design',
    'Engineering',
    'Data',
    'Community',
]

# Old experience values -> new "stage" values.
EXPERIENCE_MAP = {
    '0-2': 'new_grad',
    '3+': 'new_grad',
}


def seed(apps, schema_editor):
    Tag = apps.get_model('core', 'Tag')
    for i, name in enumerate(PREDEFINED_TAGS):
        Tag.objects.get_or_create(name=name, defaults={'order': i})

    Candidate = apps.get_model('core', 'Candidate')
    for old, new in EXPERIENCE_MAP.items():
        Candidate.objects.filter(experience=old).update(experience=new)


def unseed(apps, schema_editor):
    Tag = apps.get_model('core', 'Tag')
    Tag.objects.filter(name__in=PREDEFINED_TAGS).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0006_tag_alter_candidate_experience_alter_candidate_title_and_more'),
    ]

    operations = [
        migrations.RunPython(seed, unseed),
    ]
