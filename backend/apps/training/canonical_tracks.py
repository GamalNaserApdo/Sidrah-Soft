"""Canonical Program.track mapping — single source of truth.

Program.track groups related programs in operational reports (e.g. the
Starter and Professional variants of "Data Analysis" are one track).

Used by:
- migration 0019_populate_program_tracks (fixes EXISTING databases)
- seed_program() in seed_training_content (fixes FRESH databases)

Key: Program.slug (stable identifier — never rely on display titles).
Value: canonical track name shown in "Registrations by Track".

Rules:
- Same-titled Starter/Professional variants map to that shared title.
- Differently-titled equivalents map to ONE agreed canonical name.
- Ungrouped programs use their own title as their track.
- NEVER guess: a slug absent from this map keeps its existing track.
"""

CANONICAL_TRACKS = {
    # ------------------------------------------------------------------
    # Professional branch
    # ------------------------------------------------------------------
    'frontend-development': 'Frontend Development',
    'backend-development': 'Backend Development',
    'flutter-development': 'Flutter Development',
    'basic-python': 'Basic Python',
    'cpp-programming': 'C++ Programming Fundamentals',
    # Problem Solving & Data Structures using C++ is the advanced C++ course;
    # it reports under the C++ track.
    'problem-solving-data-structures': 'C++ Programming Fundamentals',
    'devops-engineering': 'DevOps Engineering',
    # ICDL Preparation reports under the ICDL / Digital Skills track.
    'icdl': 'ICDL / Digital Skills',
    'data-analysis': 'Data Analysis',

    # ------------------------------------------------------------------
    # Starter branch — shares canonical tracks with Professional variants
    # ------------------------------------------------------------------
    'starter-python-programming': 'Python Programming',
    'starter-frontend-development': 'Frontend Development',
    'starter-data-analysis': 'Data Analysis',
    'starter-flutter-development': 'Flutter Development',
    'starter-icdl-digital-skills': 'ICDL / Digital Skills',

    # ------------------------------------------------------------------
    # Summer branch
    # ------------------------------------------------------------------
    'summer-training': 'Summer Training',
}


def canonical_track(slug, title_fallback=''):
    """Return the canonical track for a program slug.

    Falls back to the program's own title when the slug is not in the map
    (single-program tracks use their title). Returns '' only when both the
    slug is unmapped and no fallback was provided.
    """
    return CANONICAL_TRACKS.get(slug) or title_fallback
