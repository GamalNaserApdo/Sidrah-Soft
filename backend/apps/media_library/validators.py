"""Media upload validation — extension, MIME, Pillow integrity, size, dimensions."""
from io import BytesIO

from PIL import Image, ImageFile

from django.core.exceptions import ValidationError


ImageFile.LOAD_TRUNCATED_IMAGES = False

ALLOWED_EXTENSIONS = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'webp': 'image/webp',
    'gif': 'image/gif',
}

PILLOW_FORMAT_TO_MIME = {
    'JPEG': 'image/jpeg',
    'PNG': 'image/png',
    'WEBP': 'image/webp',
    'GIF': 'image/gif',
}

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
MAX_DIMENSION = 4000  # Max width or height in pixels
MAX_TOTAL_PIXELS = 40_000_000  # 40 megapixels — decompression bomb protection


class MediaValidationError(ValidationError):
    """Validation error with a clear code for API responses."""

    def __init__(self, message, code='invalid_media'):
        super().__init__(message, code=code)


def validate_extension(filename):
    """Check that the file extension is in the allowed list."""
    if not filename or '.' not in filename:
        raise MediaValidationError(
            'File must have an allowed extension: .jpg, .jpeg, .png, .webp, .gif',
            code='invalid_extension',
        )
    ext = filename.rsplit('.', 1)[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise MediaValidationError(
            f'Extension ".{ext}" is not allowed. Allowed: .jpg, .jpeg, .png, .webp, .gif',
            code='invalid_extension',
        )
    # Reject double extensions like file.jpg.exe
    parts = filename.rsplit('.', 1)[0].rsplit('.', 1)
    if len(parts) == 2 and parts[1].lower() not in ALLOWED_EXTENSIONS:
        raise MediaValidationError(
            'Files with misleading double extensions are not allowed.',
            code='dangerous_extension',
        )
    return ext


def validate_file_size(size):
    """Check that the file size is within the allowed limit."""
    if size is None or size <= 0:
        raise MediaValidationError('File is empty.', code='empty_file')
    if size > MAX_FILE_SIZE:
        max_mb = MAX_FILE_SIZE // (1024 * 1024)
        raise MediaValidationError(
            f'File size exceeds the {max_mb} MB limit.',
            code='file_too_large',
        )


def verify_image(uploaded_file):
    """
    Open the uploaded file with Pillow to verify it is a valid image.

    Returns a tuple of (width, height, mime_type).

    Raises MediaValidationError if the file is not a valid image,
    is a decompression bomb, or has unsupported format.
    """
    try:
        uploaded_file.seek(0)
        raw = uploaded_file.read()
        uploaded_file.seek(0)
    except Exception:
        raise MediaValidationError('Could not read file data.', code='read_error')

    if not raw:
        raise MediaValidationError('File is empty.', code='empty_file')

    # Check against decompression bomb before opening
    if len(raw) > MAX_FILE_SIZE:
        raise MediaValidationError(
            'File size exceeds the 5 MB limit.',
            code='file_too_large',
        )

    try:
        img = Image.open(BytesIO(raw))
        img.verify()
    except Exception:
        raise MediaValidationError(
            'File is not a valid image or is corrupted.',
            code='invalid_image',
        )

    # Re-open for dimension extraction (verify() closes the image)
    try:
        img = Image.open(BytesIO(raw))
        img.load()
    except Exception:
        raise MediaValidationError(
            'Image data could not be loaded (possibly corrupted or truncated).',
            code='invalid_image',
        )

    width, height = img.size
    if width <= 0 or height <= 0:
        raise MediaValidationError(
            'Image has invalid dimensions.',
            code='invalid_dimensions',
        )

    if width > MAX_DIMENSION or height > MAX_DIMENSION:
        raise MediaValidationError(
            f'Image dimensions exceed the {MAX_DIMENSION}px maximum '
            f'(got {width}x{height}).',
            code='dimensions_too_large',
        )

    total_pixels = width * height
    if total_pixels > MAX_TOTAL_PIXELS:
        raise MediaValidationError(
            f'Image total pixel count ({total_pixels}) exceeds the '
            f'{MAX_TOTAL_PIXELS} pixel limit (possible decompression bomb).',
            code='decompression_bomb',
        )

    pil_format = img.format
    if pil_format not in PILLOW_FORMAT_TO_MIME:
        raise MediaValidationError(
            f'Image format "{pil_format}" is not supported. '
            f'Allowed: JPEG, PNG, WebP, GIF.',
            code='unsupported_format',
        )

    mime_type = PILLOW_FORMAT_TO_MIME[pil_format]

    # Reject SVG even if Pillow somehow opens it
    if 'svg' in mime_type.lower() or 'svg' in (pil_format or '').lower():
        raise MediaValidationError(
            'SVG files are not allowed.',
            code='svg_rejected',
        )

    return width, height, mime_type


def validate_uploaded_file(uploaded_file):
    """
    Full validation pipeline for an uploaded image file.

    Returns dict with keys: ext, width, height, mime_type, file_size.

    Raises MediaValidationError on any validation failure.
    """
    filename = getattr(uploaded_file, 'name', '') or ''
    ext = validate_extension(filename)

    file_size = uploaded_file.size if hasattr(uploaded_file, 'size') else None
    if file_size is None:
        uploaded_file.seek(0)
        raw = uploaded_file.read()
        uploaded_file.seek(0)
        file_size = len(raw)

    validate_file_size(file_size)

    width, height, mime_type = verify_image(uploaded_file)

    # Cross-check: extension MIME must match detected MIME
    expected_mime = ALLOWED_EXTENSIONS[ext]
    if mime_type != expected_mime:
        raise MediaValidationError(
            f'File extension ".{ext}" does not match detected image format '
            f'({mime_type}). Possible MIME spoofing.',
            code='mime_mismatch',
        )

    return {
        'ext': ext,
        'width': width,
        'height': height,
        'mime_type': mime_type,
        'file_size': file_size,
    }
