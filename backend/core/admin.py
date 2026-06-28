from django.contrib import admin

from .models import Assignment, Candidate, CandidateExperience, Company, Tag


class AssignmentInline(admin.TabularInline):
    """Edit a company's candidate assignments right on the company page."""

    model = Assignment
    extra = 0
    autocomplete_fields = ('candidate',)


class CandidateExperienceInline(admin.TabularInline):
    """Edit a candidate's experience highlights inline."""

    model = CandidateExperience
    extra = 0


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'status', 'point_of_contact', 'updated_at')
    list_filter = ('status',)
    search_fields = ('name', 'point_of_contact', 'contact_email')
    filter_horizontal = ('members',)
    inlines = (AssignmentInline,)


@admin.register(Candidate)
class CandidateAdmin(admin.ModelAdmin):
    list_display = ('name', 'title', 'email', 'updated_at')
    search_fields = ('name', 'email', 'title')
    filter_horizontal = ('focus_areas',)
    inlines = (CandidateExperienceInline,)


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name', 'order')
    list_editable = ('order',)
    search_fields = ('name',)


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ('candidate', 'company', 'status', 'updated_at')
    list_filter = ('status', 'company')
    search_fields = ('candidate__name', 'company__name')
    autocomplete_fields = ('candidate', 'company')
