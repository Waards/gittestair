// Preset security questions offered in Admin → Settings → Security.
// The chosen question text is stored in the settings table; the answer
// is stored server-side as a SHA-256 hash (never in plain text).
export const SECURITY_QUESTIONS = [
  "What is your mother's maiden name?",
  'What was the name of your first pet?',
  'What city were you born in?',
  'What was the make of your first car?',
  'What elementary school did you attend?',
  "What is your favorite food?",
  'What was your childhood nickname?',
]
