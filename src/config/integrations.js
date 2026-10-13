// Public identifiers only. Formspree verifies the Turnstile token server-side.
// Replace these values after creating the hosted form and Turnstile widget.
export const FORMSPREE_FORM_ID = 'REPLACE_WITH_FORMSPREE_FORM_ID'
export const TURNSTILE_SITE_KEY = 'REPLACE_WITH_CLOUDFLARE_TURNSTILE_SITE_KEY'
export const contactFormConfigured = !FORMSPREE_FORM_ID.startsWith('REPLACE_') && !TURNSTILE_SITE_KEY.startsWith('REPLACE_')
