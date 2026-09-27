"""Backend tests for the Dynamic Form Builder.

Covers:
- Form creation
- Field creation and ordering
- Option ordering
- Required validation
- Invalid option rejection
- Inactive form rejection
- Custom field submission
- System field protection
- Unauthorized CMS access
- Submission listing
- Export
- EN/AR values
- Archive/deactivate behavior
"""
from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from apps.forms.models import (
    FormDefinition, FormField, FormFieldOption,
    FormAssignment, FormSubmission, FormSubmissionValue,
)

User = get_user_model()


@override_settings(
    EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
)
class FormBuilderTests(TestCase):
    """Comprehensive tests for the Dynamic Form Builder."""

    def setUp(self):
        self.client = APIClient()
        # Create admin user
        self.admin = User.objects.create_user(
            username='admin',
            password='testpass123',
            role='admin',
            is_active=True,
        )
        self.admin.is_staff = True
        self.admin.save()
        # Create regular non-CMS user
        self.regular_user = User.objects.create_user(
            username='regular',
            password='testpass123',
            role='viewer',
            is_active=True,
        )
        # Authenticate as admin
        self.client.force_authenticate(user=self.admin)

    # -----------------------------------------------------------------------
    # Form Creation
    # -----------------------------------------------------------------------

    def test_create_form(self):
        """Test creating a form definition."""
        response = self.client.post('/api/v1/cms/forms/definitions/', {
            'name': 'Newsletter Signup',
            'slug': 'newsletter-signup',
            'title_en': 'Subscribe to our newsletter',
            'title_ar': 'اشترك في نشرتنا',
            'description_en': 'Get the latest updates',
            'description_ar': 'احصل على أحدث التحديثات',
            'submit_button_en': 'Subscribe',
            'submit_button_ar': 'اشترك',
            'success_message_en': 'Thanks for subscribing!',
            'success_message_ar': 'شكراً لاشتراكك!',
            'is_active': True,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Newsletter Signup')
        self.assertEqual(response.data['slug'], 'newsletter-signup')
        form = FormDefinition.objects.get(slug='newsletter-signup')
        self.assertTrue(form.is_active)
        self.assertEqual(form.title_en, 'Subscribe to our newsletter')
        self.assertEqual(form.title_ar, 'اشترك في نشرتنا')

    def test_list_forms(self):
        """Test listing forms."""
        FormDefinition.objects.create(name='Form 1', slug='form-1', title_en='Form 1')
        FormDefinition.objects.create(name='Form 2', slug='form-2', title_en='Form 2')
        response = self.client.get('/api/v1/cms/forms/definitions/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
        self.assertGreaterEqual(len(response.data['results']), 2)

    # -----------------------------------------------------------------------
    # Field Creation and Ordering
    # -----------------------------------------------------------------------

    def test_create_field(self):
        """Test creating a field in a form."""
        form = FormDefinition.objects.create(name='Test Form', slug='test-form', title_en='Test')
        response = self.client.post(
            f'/api/v1/cms/forms/definitions/{form.id}/fields/',
            {
                'field_type': 'text',
                'label_en': 'Full Name',
                'label_ar': 'الاسم الكامل',
                'is_required': True,
                'display_order': 1,
            },
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['label_en'], 'Full Name')
        self.assertFalse(response.data['is_system'])

    def test_field_ordering(self):
        """Test that fields are ordered by display_order."""
        form = FormDefinition.objects.create(name='Test Form', slug='test-form-2', title_en='Test')
        FormField.objects.create(form=form, field_type='text', label_en='Field C', display_order=3)
        FormField.objects.create(form=form, field_type='text', label_en='Field A', display_order=1)
        FormField.objects.create(form=form, field_type='text', label_en='Field B', display_order=2)
        response = self.client.get(f'/api/v1/cms/forms/definitions/{form.id}/fields/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data['results'] if isinstance(response.data, dict) else response.data
        labels = [f['label_en'] for f in data]
        self.assertEqual(labels, ['Field A', 'Field B', 'Field C'])

    # -----------------------------------------------------------------------
    # Option Ordering
    # -----------------------------------------------------------------------

    def test_option_ordering(self):
        """Test that options are ordered by display_order."""
        form = FormDefinition.objects.create(name='Test Form', slug='test-form-3', title_en='Test')
        field = FormField.objects.create(form=form, field_type='select', label_en='Color', display_order=1)
        FormFieldOption.objects.create(field=field, value='red', label_en='Red', display_order=3)
        FormFieldOption.objects.create(field=field, value='blue', label_en='Blue', display_order=1)
        FormFieldOption.objects.create(field=field, value='green', label_en='Green', display_order=2)
        response = self.client.get(f'/api/v1/cms/forms/fields/{field.id}/options/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data['results'] if isinstance(response.data, dict) else response.data
        values = [o['value'] for o in data]
        self.assertEqual(values, ['blue', 'green', 'red'])

    # -----------------------------------------------------------------------
    # Required Validation
    # -----------------------------------------------------------------------

    def test_required_field_rejected_when_empty(self):
        """Test that required fields reject empty submissions."""
        form = FormDefinition.objects.create(name='Test Form', slug='test-form-4', title_en='Test', is_active=True)
        FormField.objects.create(form=form, field_type='text', field_key='name', label_en='Name', is_required=True, display_order=1)
        response = self.client.post(
            f'/api/v1/forms/{form.slug}/submit/',
            {'name': '', 'website': ''},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('name', response.data)

    # -----------------------------------------------------------------------
    # Invalid Option Rejection
    # -----------------------------------------------------------------------

    def test_invalid_option_rejected(self):
        """Test that invalid option values are rejected."""
        form = FormDefinition.objects.create(name='Test Form', slug='test-form-5', title_en='Test', is_active=True)
        field = FormField.objects.create(form=form, field_type='select', field_key='color', label_en='Color', is_required=True, display_order=1)
        FormFieldOption.objects.create(field=field, value='red', label_en='Red', display_order=1)
        FormFieldOption.objects.create(field=field, value='blue', label_en='Blue', display_order=2)
        response = self.client.post(
            f'/api/v1/forms/{form.slug}/submit/',
            {'color': 'yellow', 'website': ''},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('color', response.data)

    def test_inactive_option_rejected(self):
        """Test that inactive options are rejected."""
        form = FormDefinition.objects.create(name='Test Form', slug='test-form-5b', title_en='Test', is_active=True)
        field = FormField.objects.create(form=form, field_type='select', field_key='color', label_en='Color', is_required=True, display_order=1)
        FormFieldOption.objects.create(field=field, value='red', label_en='Red', display_order=1, is_active=True)
        FormFieldOption.objects.create(field=field, value='blue', label_en='Blue', display_order=2, is_active=False)
        response = self.client.post(
            f'/api/v1/forms/{form.slug}/submit/',
            {'color': 'blue', 'website': ''},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('color', response.data)

    # -----------------------------------------------------------------------
    # Inactive Form Rejection
    # -----------------------------------------------------------------------

    def test_inactive_form_rejected(self):
        """Test that submissions to inactive forms are rejected."""
        form = FormDefinition.objects.create(name='Test Form', slug='test-form-6', title_en='Test', is_active=False)
        response = self.client.post(
            f'/api/v1/forms/{form.slug}/submit/',
            {'website': ''},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # -----------------------------------------------------------------------
    # Custom Field Submission
    # -----------------------------------------------------------------------

    def test_custom_field_submission(self):
        """Test successful submission with custom fields."""
        form = FormDefinition.objects.create(name='Test Form', slug='test-form-7', title_en='Test', is_active=True)
        FormField.objects.create(form=form, field_type='text', field_key='name', label_en='Name', is_required=True, display_order=1)
        FormField.objects.create(form=form, field_type='email', field_key='email', label_en='Email', is_required=True, display_order=2)
        response = self.client.post(
            f'/api/v1/forms/{form.slug}/submit/',
            {'name': 'John Doe', 'email': 'john@example.com', 'website': ''},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], 'submitted')
        submission = FormSubmission.objects.get(form=form)
        self.assertEqual(submission.values.count(), 2)
        name_value = submission.values.get(field_key='name')
        self.assertEqual(name_value.value, 'John Doe')

    # -----------------------------------------------------------------------
    # System Field Protection
    # -----------------------------------------------------------------------

    def test_system_field_cannot_be_deleted(self):
        """Test that system fields cannot be deleted via CMS."""
        form = FormDefinition.objects.create(name='Test Form', slug='test-form-8', title_en='Test')
        field = FormField.objects.create(form=form, field_type='email', field_key='email', label_en='Email', is_system=True, display_order=1)
        response = self.client.delete(f'/api/v1/cms/forms/definitions/{form.id}/fields/{field.id}/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(FormField.objects.filter(id=field.id).exists())

    def test_system_field_type_cannot_be_changed(self):
        """Test that system field types cannot be changed."""
        form = FormDefinition.objects.create(name='Test Form', slug='test-form-9', title_en='Test')
        field = FormField.objects.create(form=form, field_type='email', field_key='email', label_en='Email', is_system=True, display_order=1)
        response = self.client.patch(
            f'/api/v1/cms/forms/definitions/{form.id}/fields/{field.id}/',
            {'field_type': 'text'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_system_field_key_cannot_be_changed(self):
        """Test that system field keys cannot be changed."""
        form = FormDefinition.objects.create(name='Test Form', slug='test-form-10', title_en='Test')
        field = FormField.objects.create(form=form, field_type='email', field_key='email', label_en='Email', is_system=True, display_order=1)
        response = self.client.patch(
            f'/api/v1/cms/forms/definitions/{form.id}/fields/{field.id}/',
            {'field_key': 'changed_key'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # -----------------------------------------------------------------------
    # Unauthorized CMS Access
    # -----------------------------------------------------------------------

    def test_unauthorized_user_cannot_access_cms(self):
        """Test that non-CMS users cannot access CMS endpoints."""
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.get('/api/v1/cms/forms/definitions/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_anonymous_user_cannot_access_cms(self):
        """Test that anonymous users cannot access CMS endpoints."""
        self.client.force_authenticate(user=None)
        response = self.client.get('/api/v1/cms/forms/definitions/')
        self.assertIn(response.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

    # -----------------------------------------------------------------------
    # Submission Listing
    # -----------------------------------------------------------------------

    def test_submission_listing(self):
        """Test listing submissions for a form."""
        form = FormDefinition.objects.create(name='Test Form', slug='test-form-11', title_en='Test', is_active=True)
        FormField.objects.create(form=form, field_type='text', field_key='name', label_en='Name', is_required=True, display_order=1)
        # Create submissions
        for i in range(3):
            sub = FormSubmission.objects.create(form=form, language='en', status='new')
            FormSubmissionValue.objects.create(submission=sub, field_key='name', field_label='Name', field_type='text', value=f'User {i}')
        response = self.client.get(f'/api/v1/cms/forms/submissions/?form={form.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
        self.assertGreaterEqual(len(response.data['results']), 3)

    def test_submission_filtering_by_status(self):
        """Test filtering submissions by status."""
        form = FormDefinition.objects.create(name='Test Form', slug='test-form-12', title_en='Test', is_active=True)
        FormSubmission.objects.create(form=form, language='en', status='new')
        FormSubmission.objects.create(form=form, language='en', status='reviewed')
        FormSubmission.objects.create(form=form, language='en', status='archived')
        response = self.client.get(f'/api/v1/cms/forms/submissions/?form={form.id}&status=new')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for sub in response.data['results']:
            self.assertEqual(sub['status'], 'new')

    # -----------------------------------------------------------------------
    # Export
    # -----------------------------------------------------------------------

    def test_export_csv(self):
        """Test CSV export of submissions."""
        form = FormDefinition.objects.create(name='Test Form', slug='test-form-13', title_en='Test', is_active=True)
        field = FormField.objects.create(form=form, field_type='text', field_key='name', label_en='Name', is_required=True, display_order=1)
        sub = FormSubmission.objects.create(form=form, language='en', status='new')
        FormSubmissionValue.objects.create(submission=sub, field_key='name', field_label='Name', field_type='text', value='John Doe')
        response = self.client.get(f'/api/v1/cms/forms/submissions/export/?form={form.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'text/csv; charset=utf-8')
        content = response.content.decode('utf-8-sig')
        self.assertIn('John Doe', content)
        self.assertIn('Name', content)

    def test_export_requires_form_id(self):
        """Test that export requires a form ID."""
        response = self.client.get('/api/v1/cms/forms/submissions/export/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # -----------------------------------------------------------------------
    # EN/AR Values
    # -----------------------------------------------------------------------

    def test_en_ar_values_preserved(self):
        """Test that EN and AR values are preserved in form definition."""
        form = FormDefinition.objects.create(
            name='Bilingual Form',
            slug='bilingual-form',
            title_en='English Title',
            title_ar='عنوان عربي',
            description_en='English Description',
            description_ar='وصف عربي',
            is_active=True,
        )
        FormField.objects.create(
            form=form,
            field_type='text',
            field_key='name',
            label_en='Name',
            label_ar='الاسم',
            placeholder_en='Enter your name',
            placeholder_ar='أدخل اسمك',
            display_order=1,
        )
        response = self.client.get(f'/api/v1/forms/{form.slug}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title_en'], 'English Title')
        self.assertEqual(response.data['title_ar'], 'عنوان عربي')
        field = response.data['fields'][0]
        self.assertEqual(field['label_en'], 'Name')
        self.assertEqual(field['label_ar'], 'الاسم')
        self.assertEqual(field['placeholder_en'], 'Enter your name')
        self.assertEqual(field['placeholder_ar'], 'أدخل اسمك')

    # -----------------------------------------------------------------------
    # Archive/Deactivate Behavior
    # -----------------------------------------------------------------------

    def test_archive_submission(self):
        """Test archiving a submission."""
        form = FormDefinition.objects.create(name='Test Form', slug='test-form-14', title_en='Test', is_active=True)
        sub = FormSubmission.objects.create(form=form, language='en', status='new')
        response = self.client.patch(
            f'/api/v1/cms/forms/submissions/{sub.id}/',
            {'status': 'archived'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        sub.refresh_from_db()
        self.assertEqual(sub.status, 'archived')

    def test_deactivate_field(self):
        """Test deactivating a field."""
        form = FormDefinition.objects.create(name='Test Form', slug='test-form-15', title_en='Test')
        field = FormField.objects.create(form=form, field_type='text', field_key='name', label_en='Name', is_active=True, display_order=1)
        response = self.client.patch(
            f'/api/v1/cms/forms/definitions/{form.id}/fields/{field.id}/',
            {'is_active': False},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        field.refresh_from_db()
        self.assertFalse(field.is_active)

    def test_inactive_field_ignored_in_submission(self):
        """Test that inactive fields are ignored during submission."""
        form = FormDefinition.objects.create(name='Test Form', slug='test-form-16', title_en='Test', is_active=True)
        FormField.objects.create(form=form, field_type='text', field_key='name', label_en='Name', is_required=True, is_active=True, display_order=1)
        FormField.objects.create(form=form, field_type='text', field_key='hidden', label_en='Hidden', is_required=False, is_active=False, display_order=2)
        response = self.client.post(
            f'/api/v1/forms/{form.slug}/submit/',
            {'name': 'John', 'website': ''},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        submission = FormSubmission.objects.get(form=form)
        self.assertEqual(submission.values.count(), 1)
        self.assertEqual(submission.values.first().field_key, 'name')

    # -----------------------------------------------------------------------
    # Form Assignment
    # -----------------------------------------------------------------------

    def test_form_assignment(self):
        """Test assigning a form to a target."""
        form = FormDefinition.objects.create(name='Test Form', slug='test-form-17', title_en='Test', is_active=True)
        response = self.client.post('/api/v1/cms/forms/assignments/', {
            'form': form.id,
            'target': 'ai_automation',
            'is_active': True,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # Fetch assigned form
        response = self.client.get('/api/v1/forms/assigned/ai_automation/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['slug'], 'test-form-17')

    def test_invalid_assignment_target_rejected(self):
        """Test that invalid assignment targets are rejected."""
        form = FormDefinition.objects.create(name='Test Form', slug='test-form-18', title_en='Test', is_active=True)
        response = self.client.post('/api/v1/cms/forms/assignments/', {
            'form': form.id,
            'target': 'invalid_target',
            'is_active': True,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # -----------------------------------------------------------------------
    # Honeypot Protection
    # -----------------------------------------------------------------------

    def test_honeypot_rejects_submission(self):
        """Test that honeypot field rejects submission."""
        form = FormDefinition.objects.create(name='Test Form', slug='test-form-19', title_en='Test', is_active=True)
        FormField.objects.create(form=form, field_type='text', field_key='name', label_en='Name', is_required=True, display_order=1)
        response = self.client.post(
            f'/api/v1/forms/{form.slug}/submit/',
            {'name': 'John', 'website': 'spam'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # -----------------------------------------------------------------------
    # Form with submissions cannot be deleted
    # -----------------------------------------------------------------------

    def test_form_with_submissions_cannot_be_deleted(self):
        """Test that forms with submissions cannot be deleted."""
        form = FormDefinition.objects.create(name='Test Form', slug='test-form-20', title_en='Test', is_active=True)
        FormSubmission.objects.create(form=form, language='en', status='new')
        response = self.client.delete(f'/api/v1/cms/forms/definitions/{form.id}/')
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertTrue(FormDefinition.objects.filter(id=form.id).exists())

    # -----------------------------------------------------------------------
    # Type-specific validation
    # -----------------------------------------------------------------------

    def test_email_validation(self):
        """Test email field validation."""
        form = FormDefinition.objects.create(name='Test Form', slug='test-form-21', title_en='Test', is_active=True)
        FormField.objects.create(form=form, field_type='email', field_key='email', label_en='Email', is_required=True, display_order=1)
        response = self.client.post(
            f'/api/v1/forms/{form.slug}/submit/',
            {'email': 'invalid-email', 'website': ''},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    def test_url_validation(self):
        """Test URL field validation."""
        form = FormDefinition.objects.create(name='Test Form', slug='test-form-22', title_en='Test', is_active=True)
        FormField.objects.create(form=form, field_type='url', field_key='website_url', label_en='Website', is_required=True, display_order=1)
        response = self.client.post(
            f'/api/v1/forms/{form.slug}/submit/',
            {'website_url': 'not-a-url', 'website': ''},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('website_url', response.data)

    def test_number_validation(self):
        """Test number field validation."""
        form = FormDefinition.objects.create(name='Test Form', slug='test-form-23', title_en='Test', is_active=True)
        FormField.objects.create(form=form, field_type='number', field_key='age', label_en='Age', is_required=True, display_order=1)
        response = self.client.post(
            f'/api/v1/forms/{form.slug}/submit/',
            {'age': 'not-a-number', 'website': ''},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('age', response.data)

    def test_phone_validation(self):
        """Test phone field validation."""
        form = FormDefinition.objects.create(name='Test Form', slug='test-form-24', title_en='Test', is_active=True)
        FormField.objects.create(form=form, field_type='phone', field_key='phone', label_en='Phone', is_required=True, display_order=1)
        response = self.client.post(
            f'/api/v1/forms/{form.slug}/submit/',
            {'phone': '123', 'website': ''},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('phone', response.data)

    def test_date_validation(self):
        """Test date field validation."""
        form = FormDefinition.objects.create(name='Test Form', slug='test-form-25', title_en='Test', is_active=True)
        FormField.objects.create(form=form, field_type='date', field_key='birthdate', label_en='Birth Date', is_required=True, display_order=1)
        response = self.client.post(
            f'/api/v1/forms/{form.slug}/submit/',
            {'birthdate': 'invalid-date', 'website': ''},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('birthdate', response.data)

    # -----------------------------------------------------------------------
    # Public form schema endpoint
    # -----------------------------------------------------------------------

    def test_public_form_schema(self):
        """Test that public form schema endpoint returns form definition."""
        form = FormDefinition.objects.create(name='Test Form', slug='test-form-26', title_en='Test', is_active=True)
        FormField.objects.create(form=form, field_type='text', field_key='name', label_en='Name', is_required=True, display_order=1)
        field = FormField.objects.create(form=form, field_type='select', field_key='color', label_en='Color', is_required=False, display_order=2)
        FormFieldOption.objects.create(field=field, value='red', label_en='Red', display_order=1)
        FormFieldOption.objects.create(field=field, value='blue', label_en='Blue', display_order=2)
        self.client.force_authenticate(user=None)
        response = self.client.get(f'/api/v1/forms/{form.slug}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['slug'], 'test-form-26')
        self.assertEqual(len(response.data['fields']), 2)
        select_field = [f for f in response.data['fields'] if f['field_type'] == 'select'][0]
        self.assertEqual(len(select_field['options']), 2)

    def test_inactive_form_not_publicly_accessible(self):
        """Test that inactive forms are not publicly accessible."""
        form = FormDefinition.objects.create(name='Test Form', slug='test-form-27', title_en='Test', is_active=False)
        self.client.force_authenticate(user=None)
        response = self.client.get(f'/api/v1/forms/{form.slug}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_unknown_fields_rejected(self):
        """Unknown fields in submission should be rejected with 400."""
        form = FormDefinition.objects.create(name='Test Form', slug='test-form-28', title_en='Test', is_active=True)
        FormField.objects.create(
            form=form, field_key='name', field_type='text',
            label_en='Name', is_required=True, display_order=1,
        )
        self.client.force_authenticate(user=None)
        response = self.client.post(f'/api/v1/forms/{form.slug}/submit/', {
            'name': 'Test User',
            'unknown_field': 'should be rejected',
            'website': '',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('unknown_field', response.data)

    def test_csv_formula_injection_protection(self):
        """CSV export should sanitize cells starting with =, +, -, @."""
        form = FormDefinition.objects.create(name='Test Form', slug='test-form-29', title_en='Test', is_active=True)
        FormField.objects.create(
            form=form, field_key='name', field_type='text',
            label_en='Name', is_required=True, display_order=1,
        )
        # Create a submission with formula injection attempt
        sub = FormSubmission.objects.create(form=form, language='en', source_page='/test', status='new')
        FormSubmissionValue.objects.create(
            submission=sub, field_key='name', field_label='Name',
            field_type='text', value='=cmd|calc!A0',
        )
        # Export
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(f'/api/v1/cms/forms/submissions/export/?form={form.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        content = response.content.decode('utf-8-sig')
        # The formula should be sanitized with a single quote prefix
        self.assertIn("'=cmd|calc!A0", content)
        self.assertNotIn('"=cmd|calc!A0"', content)  # Raw formula should not appear

    # -----------------------------------------------------------------------
    # Form Assignment Tests
    # -----------------------------------------------------------------------

    def _create_form(self, name='Test Form', slug=None):
        return FormDefinition.objects.create(
            name=name,
            slug=slug or name.lower().replace(' ', '-'),
            title_en=name,
            is_active=True,
        )

    def test_assignment_create_allowed_target(self):
        """Creating an assignment to an allowed target should succeed."""
        form = self._create_form('Assign Test 1')
        response = self.client.post('/api/v1/cms/forms/assignments/', {
            'form': form.id, 'target': 'ai_automation', 'is_active': True,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['target'], 'ai_automation')
        self.assertTrue(response.data['is_active'])

    def test_assignment_unsupported_target_rejected(self):
        """Assigning to an unsupported target should be rejected."""
        form = self._create_form('Assign Test 2')
        response = self.client.post('/api/v1/cms/forms/assignments/', {
            'form': form.id, 'target': 'evil_page', 'is_active': True,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('target', response.data)

    def test_assignment_duplicate_active_rejected(self):
        """Two active assignments to the same target should be rejected."""
        form1 = self._create_form('Assign Test 3')
        form2 = self._create_form('Assign Test 4')
        # First assignment
        r1 = self.client.post('/api/v1/cms/forms/assignments/', {
            'form': form1.id, 'target': 'ai_automation', 'is_active': True,
        }, format='json')
        self.assertEqual(r1.status_code, status.HTTP_201_CREATED)
        # Second active assignment to same target
        r2 = self.client.post('/api/v1/cms/forms/assignments/', {
            'form': form2.id, 'target': 'ai_automation', 'is_active': True,
        }, format='json')
        self.assertEqual(r2.status_code, status.HTTP_400_BAD_REQUEST)

    def test_assignment_unassign_preserves_form(self):
        """Removing an assignment should NOT delete the form or its submissions."""
        form = self._create_form('Assign Test 5')
        # Create a submission
        sub = FormSubmission.objects.create(form=form, language='en', source_page='/test')
        FormSubmissionValue.objects.create(submission=sub, field_key='name', field_label='Name', value='Test')
        # Create assignment
        assignment = FormAssignment.objects.create(form=form, target='ai_automation', is_active=True)
        # Delete assignment
        response = self.client.delete(f'/api/v1/cms/forms/assignments/{assignment.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        # Form must still exist
        self.assertTrue(FormDefinition.objects.filter(id=form.id).exists())
        # Submissions must still exist
        self.assertTrue(FormSubmission.objects.filter(id=sub.id).exists())
        self.assertEqual(FormSubmission.objects.filter(form=form).count(), 1)

    def test_public_assignment_lookup(self):
        """Public assigned-form endpoint should return the assigned form."""
        form = self._create_form('Assign Test 6')
        FormAssignment.objects.create(form=form, target='ai_automation', is_active=True)
        self.client.force_authenticate(user=None)
        response = self.client.get('/api/v1/forms/assigned/ai_automation/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['slug'], form.slug)

    def test_public_assignment_lookup_no_assignment(self):
        """Public assigned-form endpoint should return 404 when no assignment."""
        self.client.force_authenticate(user=None)
        response = self.client.get('/api/v1/forms/assigned/ai_automation/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_public_assignment_lookup_inactive_form(self):
        """Public assigned-form endpoint should 404 if the form is inactive."""
        form = self._create_form('Assign Test 7')
        form.is_active = False
        form.save()
        FormAssignment.objects.create(form=form, target='ai_automation', is_active=True)
        self.client.force_authenticate(user=None)
        response = self.client.get('/api/v1/forms/assigned/ai_automation/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_public_assignment_lookup_inactive_assignment(self):
        """Public assigned-form endpoint should 404 if the assignment is inactive."""
        form = self._create_form('Assign Test 8')
        FormAssignment.objects.create(form=form, target='ai_automation', is_active=False)
        self.client.force_authenticate(user=None)
        response = self.client.get('/api/v1/forms/assigned/ai_automation/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_unauthorized_assignment_mutation(self):
        """Non-CMS users cannot create assignments."""
        form = self._create_form('Assign Test 9')
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.post('/api/v1/cms/forms/assignments/', {
            'form': form.id, 'target': 'ai_automation', 'is_active': True,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_assignment_targets_endpoint(self):
        """The targets endpoint should return operational targets with labels."""
        response = self.client.get('/api/v1/cms/forms/assignments/targets/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        targets = response.data['targets']
        self.assertIsInstance(targets, list)
        # ai_automation should be operational
        target_values = [t['value'] for t in targets]
        self.assertIn('ai_automation', target_values)
        # contact and landing_generic should NOT be operational
        self.assertNotIn('contact', target_values)
        self.assertNotIn('landing_generic', target_values)
        # Each target should have EN/AR labels
        for t in targets:
            self.assertIn('label_en', t)
            self.assertIn('label_ar', t)

    def test_assignment_includes_target_labels(self):
        """Assignment serializer should include target_label_en and target_label_ar."""
        form = self._create_form('Assign Test 10')
        FormAssignment.objects.create(form=form, target='ai_automation', is_active=True)
        response = self.client.get('/api/v1/cms/forms/assignments/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        if isinstance(results, list) and len(results) > 0:
            a = results[0]
            self.assertIn('target_label_en', a)
            self.assertIn('target_label_ar', a)
            self.assertEqual(a['target_label_en'], 'AI Automation Page')
