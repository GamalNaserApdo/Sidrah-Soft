const SCRIPT_PROPERTIES = PropertiesService.getScriptProperties();

const COLUMN_MAP = {
  timestamp: 'Timestamp',
  full_name: 'Full Name',
  email: 'Email',
  phone: 'Phone',
  national_id: 'National ID',
  college_or_school: 'College or School',
  academic_year: 'Academic Year',
  preferred_language: 'Preferred Language',
  notes: 'Notes',
};

const REQUIRED_PROPERTIES = ['BACKEND_URL', 'APPS_SCRIPT_SECRET', 'FORM_KEY'];

function getProperty(key) {
  const value = SCRIPT_PROPERTIES.getProperty(key);
  if (!value) throw new Error(`Missing required Script Property: ${key}`);
  return value;
}

function validateConfiguration() {
  REQUIRED_PROPERTIES.forEach(getProperty);
}

function answer(namedValues, field) {
  const values = namedValues[COLUMN_MAP[field]] || [];
  return String(values[0] || '').trim();
}

function stableSubmissionId(event) {
  const spreadsheetId = event.source.getId();
  const sheetId = event.range.getSheet().getSheetId();
  const row = event.range.getRow();
  const timestamp = answer(event.namedValues, 'timestamp');
  const input = `${spreadsheetId}:${sheetId}:${row}:${timestamp}`;
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, input);
  return digest.map((byte) => (`0${(byte & 0xff).toString(16)}`).slice(-2)).join('');
}

function buildPayload(event) {
  return {
    form_key: getProperty('FORM_KEY'),
    external_submission_id: stableSubmissionId(event),
    full_name: answer(event.namedValues, 'full_name'),
    email: answer(event.namedValues, 'email'),
    phone: answer(event.namedValues, 'phone'),
    national_id: answer(event.namedValues, 'national_id'),
    college_or_school: answer(event.namedValues, 'college_or_school'),
    academic_year: answer(event.namedValues, 'academic_year'),
    preferred_language: answer(event.namedValues, 'preferred_language') || 'en',
    notes: answer(event.namedValues, 'notes'),
  };
}

function onFormSubmit(event) {
  validateConfiguration();
  if (!event || !event.namedValues || !event.range || !event.source) {
    throw new Error('This function must run from a linked Google Sheet form-submit trigger.');
  }
  postSubmission(buildPayload(event));
}

function postSubmission(payload) {
  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: { 'X-Apps-Script-Secret': getProperty('APPS_SCRIPT_SECRET') },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };
  let lastError;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    let response;
    try {
      response = UrlFetchApp.fetch(getProperty('BACKEND_URL'), options);
    } catch (error) {
      lastError = error;
      if (attempt < 3) Utilities.sleep((2 ** attempt) * 500);
      continue;
    }

    const status = response.getResponseCode();
    if (status === 200 || status === 201) return;
    lastError = new Error(`Backend returned HTTP ${status}`);
    if (status >= 400 && status < 500 && status !== 408 && status !== 429) throw lastError;
    if (attempt < 3) Utilities.sleep((2 ** attempt) * 500);
  }

  throw lastError;
}
