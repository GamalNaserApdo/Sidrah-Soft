"""Import old certificates from a CSV or XLSX file.

Usage:
    python manage.py import_certificates --file certificates.csv --dry-run
    python manage.py import_certificates --file certificates.xlsx
    python manage.py import_certificates --file certs.xlsx --dry-run --error-file errors.csv

Supported formats:
    .csv  — UTF-8 (with or without BOM), comma-separated, header row required.
    .xlsx — Excel workbook, first sheet used, header row required.

Columns (header row required):
    recipient_name       — Required. Full name of the certificate recipient.
    certificate_type     — Required. "completion" or "recognition".
    program_slug         — Required for completion. Program slug.
    training_start_date  — Optional. YYYY-MM-DD.
    training_end_date    — Optional. YYYY-MM-DD.
    issue_date           — Optional. YYYY-MM-DD. Defaults to today.
    existing_reference   — Optional. If provided, must be unique.
    status               — Optional. "draft" or "issued". Defaults to "issued".
    certificate_title    — Optional. Overrides program title.
    recognition_reason   — Optional. For recognition type.

Features:
    - Dry run mode: validates without saving, prints a report.
    - Idempotency: skips rows with existing_reference that already exist.
    - Validation: reports all errors before any import.
    - Transaction: all valid rows are imported atomically.
    - Summary: prints counts of imported, skipped, and error rows.
    - Error CSV: writes validation errors to a separate file for correction.
"""
import csv
import os
import sys
from datetime import datetime, date

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from apps.training.models import Certificate, Program, TrainingRegistration


def _read_csv(file_path):
    """Read a CSV file and return list of dict rows."""
    with open(file_path, 'r', encoding='utf-8-sig', newline='') as f:
        reader = csv.DictReader(f)
        return list(reader)


def _read_xlsx(file_path):
    """Read an XLSX file and return list of dict rows (first sheet)."""
    try:
        from openpyxl import load_workbook
    except ImportError:
        raise CommandError(
            'openpyxl is required for XLSX import. Install it with: pip install openpyxl>=3.1,<4'
        )

    wb = load_workbook(filename=file_path, read_only=True, data_only=True)
    ws = wb.active

    rows_iter = ws.iter_rows(values_only=True)
    try:
        headers = [str(cell).strip() if cell is not None else '' for cell in next(rows_iter)]
    except StopIteration:
        wb.close()
        return []

    result = []
    for row_values in rows_iter:
        if all(v is None for v in row_values):
            continue  # skip empty rows
        row_dict = {}
        for i, header in enumerate(headers):
            value = row_values[i] if i < len(row_values) else None
            if isinstance(value, datetime):
                row_dict[header] = value.strftime('%Y-%m-%d')
            elif isinstance(value, date):
                row_dict[header] = value.strftime('%Y-%m-%d')
            elif value is None:
                row_dict[header] = ''
            else:
                row_dict[header] = str(value).strip()
        result.append(row_dict)

    wb.close()
    return result


class Command(BaseCommand):
    help = 'Import old certificates from a CSV or XLSX file.'

    def add_arguments(self, parser):
        parser.add_argument('--file', required=True, help='Path to CSV or XLSX file.')
        parser.add_argument('--dry-run', action='store_true', help='Validate without saving.')
        parser.add_argument('--error-file', default='', help='Write error rows to this CSV file.')

    def handle(self, *args, **options):
        file_path = options['file']
        dry_run = options['dry_run']
        error_file = options.get('error_file', '')

        ext = os.path.splitext(file_path)[1].lower()
        try:
            if ext == '.csv':
                rows = _read_csv(file_path)
            elif ext == '.xlsx':
                rows = _read_xlsx(file_path)
            else:
                raise CommandError(
                    f'Unsupported file format: {ext}. Supported formats: .csv, .xlsx'
                )
        except FileNotFoundError:
            raise CommandError(f'File not found: {file_path}')
        except CommandError:
            raise
        except Exception as e:
            raise CommandError(f'Error reading file: {e}')

        if not rows:
            self.stdout.write(self.style.WARNING(f'{ext.upper()} file is empty.'))
            return

        self.stdout.write(f'Read {len(rows)} rows from {file_path} ({ext.upper()})')
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN — no data will be saved.'))

        errors = []
        valid_rows = []
        skipped = 0

        for idx, row in enumerate(rows, start=2):  # start=2 because row 1 is header
            row_errors = self._validate_row(row, idx)
            if row_errors:
                errors.extend(row_errors)
            else:
                # Check idempotency
                existing_ref = row.get('existing_reference', '').strip()
                if existing_ref and Certificate.objects.filter(reference=existing_ref).exists():
                    skipped += 1
                    self.stdout.write(f'  Row {idx}: Skipped (reference {existing_ref} already exists)')
                else:
                    valid_rows.append((idx, row))

        # Print validation report
        if errors:
            self.stdout.write(self.style.ERROR(f'\nValidation errors ({len(errors)}):'))
            for err in errors:
                self.stdout.write(f'  Row {err["row"]}: {err["field"]}: {err["message"]}')

            # Write error CSV if requested
            if error_file:
                self._write_error_csv(error_file, rows, errors)
                self.stdout.write(f'Error details written to {error_file}')

            if not dry_run and not valid_rows:
                self.stdout.write(self.style.ERROR('No valid rows to import.'))
                return
            if not valid_rows:
                self.stdout.write(self.style.WARNING('\nNo valid rows. Nothing to import.'))
                return

        if not valid_rows:
            self.stdout.write(self.style.WARNING('\nNo valid rows to import.'))
            return

        self.stdout.write(f'\nValid rows: {len(valid_rows)}, Skipped: {skipped}, Errors: {len(errors)}')

        if dry_run:
            self.stdout.write(self.style.WARNING('\nDry run complete. No data saved.'))
            self._print_preview(valid_rows)
            return

        # Import in a transaction
        imported = 0
        try:
            with transaction.atomic():
                for idx, row in valid_rows:
                    cert = self._create_certificate(row)
                    cert.save()
                    imported += 1
                    self.stdout.write(f'  Row {idx}: Imported {cert.reference}')
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Import failed: {e}'))
            raise

        self.stdout.write(self.style.SUCCESS(f'\nImport complete: {imported} certificates imported, {skipped} skipped.'))

    def _validate_row(self, row, idx):
        """Validate a single CSV row. Returns list of error dicts."""
        errors = []

        recipient_name = (row.get('recipient_name') or '').strip()
        if not recipient_name:
            errors.append({'row': idx, 'field': 'recipient_name', 'message': 'Required.'})

        cert_type = (row.get('certificate_type') or '').strip().lower()
        if cert_type not in ('completion', 'recognition'):
            errors.append({'row': idx, 'field': 'certificate_type', 'message': 'Must be "completion" or "recognition".'})

        program_slug = (row.get('program_slug') or '').strip()
        if cert_type == 'completion' and not program_slug:
            errors.append({'row': idx, 'field': 'program_slug', 'message': 'Required for completion type.'})

        if cert_type == 'completion' and program_slug:
            if not Program.objects.filter(slug=program_slug).exists():
                errors.append({'row': idx, 'field': 'program_slug', 'message': f'Program "{program_slug}" not found.'})

        if cert_type == 'recognition' and not recipient_name:
            errors.append({'row': idx, 'field': 'recipient_name', 'message': 'Required for recognition type.'})

        # Validate dates
        for date_field in ('training_start_date', 'training_end_date', 'issue_date'):
            val = (row.get(date_field) or '').strip()
            if val:
                try:
                    datetime.strptime(val, '%Y-%m-%d')
                except ValueError:
                    errors.append({'row': idx, 'field': date_field, 'message': 'Must be YYYY-MM-DD format.'})

        # Validate status
        status = (row.get('status') or 'issued').strip().lower()
        if status not in ('draft', 'issued'):
            errors.append({'row': idx, 'field': 'status', 'message': 'Must be "draft" or "issued".'})

        # Validate existing reference uniqueness
        existing_ref = (row.get('existing_reference') or '').strip()
        if existing_ref:
            if Certificate.objects.filter(reference=existing_ref).exists():
                # Not an error — will be skipped (idempotency)
                pass
            # Check format
            if len(existing_ref) > 64:
                errors.append({'row': idx, 'field': 'existing_reference', 'message': 'Max 64 characters.'})

        return errors

    def _create_certificate(self, row):
        """Create a Certificate instance from a validated row."""
        cert_type = row.get('certificate_type', 'completion').strip().lower()
        status = row.get('status', 'issued').strip().lower()
        existing_ref = (row.get('existing_reference') or '').strip()

        cert = Certificate(
            certificate_type=cert_type,
            status=status,
            recipient_name=row.get('recipient_name', '').strip(),
            certificate_title=(row.get('certificate_title') or '').strip(),
            recognition_reason=(row.get('recognition_reason') or '').strip(),
        )

        if existing_ref:
            cert.reference = existing_ref

        # Parse dates
        for field, attr in [
            ('training_start_date', 'training_start_date'),
            ('training_end_date', 'training_end_date'),
        ]:
            val = (row.get(field) or '').strip()
            if val:
                setattr(cert, attr, datetime.strptime(val, '%Y-%m-%d').date())

        issue_date = (row.get('issue_date') or '').strip()
        if issue_date:
            from django.utils import timezone
            d = datetime.strptime(issue_date, '%Y-%m-%d').date()
            cert.issued_at = timezone.make_aware(datetime.combine(d, datetime.min.time()))
        elif status == 'issued':
            from django.utils import timezone
            cert.issued_at = timezone.now()

        # Link program
        program_slug = (row.get('program_slug') or '').strip()
        if program_slug:
            cert.program = Program.objects.filter(slug=program_slug).first()

        return cert

    def _print_preview(self, valid_rows):
        """Print a preview of what would be imported."""
        self.stdout.write('\nPreview (first 5 rows):')
        for idx, row in valid_rows[:5]:
            name = row.get('recipient_name', '')
            cert_type = row.get('certificate_type', '')
            program = row.get('program_slug', '')
            self.stdout.write(f'  Row {idx}: {name} ({cert_type}) — {program}')
        if len(valid_rows) > 5:
            self.stdout.write(f'  ... and {len(valid_rows) - 5} more.')

    def _write_error_csv(self, path, rows, errors):
        """Write error details to a CSV file (no PII beyond what's in the source)."""
        error_by_row = {}
        for err in errors:
            error_by_row.setdefault(err['row'], []).append(f'{err["field"]}: {err["message"]}')

        with open(path, 'w', encoding='utf-8', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['row_number', 'errors'])
            for row_num, msgs in sorted(error_by_row.items()):
                writer.writerow([row_num, '; '.join(msgs)])
