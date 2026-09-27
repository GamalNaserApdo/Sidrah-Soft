"""Consistency test: frontend and backend Egyptian university datasets must match.

Verifies that src/data/egyptianUniversities.js and
backend/apps/training/egyptian_universities.py define the same set of
universities with the same values, names, and categories.
"""

import re
import os
from django.test import TestCase

from apps.training.egyptian_universities import (
    EGYPTIAN_UNIVERSITIES,
    OTHER_UNIVERSITY_VALUE,
    VALID_UNIVERSITY_VALUES,
    VALID_EDUCATION_STATUS_VALUES,
    EDUCATION_STATUS_CHOICES,
)


def _parse_frontend_dataset():
    """Parse the JS dataset file and return a list of (value, name_en, name_ar, category) tuples."""
    # Resolve path relative to the django project root
    backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    project_root = os.path.dirname(backend_dir)
    js_path = os.path.join(project_root, 'src', 'data', 'egyptianUniversities.js')

    if not os.path.exists(js_path):
        # Try alternate layout (backend is at <root>/backend)
        js_path = os.path.join(project_root, '..', 'src', 'data', 'egyptianUniversities.js')
        js_path = os.path.normpath(js_path)

    with open(js_path, encoding='utf-8') as f:
        content = f.read()

    # Extract EGYPTIAN_UNIVERSITIES array entries.
    # Each entry looks like: { value: 'xxx', name_en: '...', name_ar: '...', category: '...' },
    pattern = re.compile(
        r"\{\s*value:\s*'([^']+)',\s*"
        r"name_en:\s*'([^']*)',\s*"
        r"name_ar:\s*'([^']*)',\s*"
        r"category:\s*'([^']*)'\s*\}"
    )
    matches = pattern.findall(content)
    return matches


class UniversityDatasetConsistencyTest(TestCase):
    """Ensure frontend JS and backend Python datasets are in sync."""

    def test_frontend_file_exists(self):
        """The frontend dataset file must exist."""
        backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        project_root = os.path.dirname(backend_dir)
        js_path = os.path.join(project_root, 'src', 'data', 'egyptianUniversities.js')
        if not os.path.exists(js_path):
            js_path = os.path.normpath(os.path.join(project_root, '..', 'src', 'data', 'egyptianUniversities.js'))
        self.assertTrue(os.path.exists(js_path), f'Frontend dataset not found at {js_path}')

    def test_datasets_have_same_count(self):
        """Both datasets must have the same number of universities."""
        frontend = _parse_frontend_dataset()
        self.assertEqual(len(frontend), len(EGYPTIAN_UNIVERSITIES),
                         f'Frontend has {len(frontend)} universities, backend has {len(EGYPTIAN_UNIVERSITIES)}')

    def test_datasets_have_same_values(self):
        """Every university value must match between frontend and backend."""
        frontend = _parse_frontend_dataset()
        frontend_values = {m[0] for m in frontend}
        backend_values = {u.value for u in EGYPTIAN_UNIVERSITIES}
        self.assertEqual(frontend_values, backend_values,
                         f'Mismatch: frontend-only={frontend_values - backend_values}, '
                         f'backend-only={backend_values - frontend_values}')

    def test_datasets_have_same_names_and_categories(self):
        """Every university's name_en, name_ar, and category must match."""
        frontend = _parse_frontend_dataset()
        frontend_map = {m[0]: (m[1], m[2], m[3]) for m in frontend}
        for uni in EGYPTIAN_UNIVERSITIES:
            self.assertIn(uni.value, frontend_map, f'University {uni.value} missing from frontend')
            fe_en, fe_ar, fe_cat = frontend_map[uni.value]
            self.assertEqual(fe_en, uni.name_en,
                             f'name_en mismatch for {uni.value}: frontend="{fe_en}" backend="{uni.name_en}"')
            self.assertEqual(fe_ar, uni.name_ar,
                             f'name_ar mismatch for {uni.value}: frontend="{fe_ar}" backend="{uni.name_ar}"')
            self.assertEqual(fe_cat, uni.category,
                             f'category mismatch for {uni.value}: frontend="{fe_cat}" backend="{uni.category}"')

    def test_no_duplicate_values(self):
        """No duplicate university values in the backend dataset."""
        values = [u.value for u in EGYPTIAN_UNIVERSITIES]
        self.assertEqual(len(values), len(set(values)),
                         f'Duplicate values: {set([v for v in values if values.count(v) > 1])}')

    def test_other_value_present(self):
        """The 'other' value must be in VALID_UNIVERSITY_VALUES."""
        self.assertIn(OTHER_UNIVERSITY_VALUE, VALID_UNIVERSITY_VALUES)

    def test_education_status_choices_consistent(self):
        """Education status choices must have valid structure."""
        values = [v for v, _, _ in EDUCATION_STATUS_CHOICES]
        self.assertEqual(len(values), len(set(values)), 'Duplicate education status values')
        self.assertIn('other', values, 'Education status must include "other"')
        self.assertIn('graduate', values, 'Education status must include "graduate"')

    def test_education_status_values_set_matches_choices(self):
        """VALID_EDUCATION_STATUS_VALUES must match EDUCATION_STATUS_CHOICES."""
        choices_values = {v for v, _, _ in EDUCATION_STATUS_CHOICES}
        self.assertEqual(choices_values, VALID_EDUCATION_STATUS_VALUES)

    def test_expected_category_counts(self):
        """Verify the dataset matches the official SCU 2025 category counts."""
        from collections import Counter
        cats = Counter(u.category for u in EGYPTIAN_UNIVERSITIES)
        self.assertEqual(cats['public'], 28, 'Should have 28 public universities')
        self.assertEqual(cats['private'], 34, 'Should have 34 private universities')
        self.assertEqual(cats['national'], 32, 'Should have 32 national universities')
        self.assertEqual(cats['technological'], 12, 'Should have 12 technological universities')
        self.assertEqual(cats['special'], 1, 'Should have 1 special nature university')
        self.assertEqual(cats['international'], 6, 'Should have 6 international agreement universities')
        total = sum(cats.values())
        self.assertEqual(total, 113, f'Should have 113 total universities, got {total}')
