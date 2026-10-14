// Public identifiers only. Formspree receives and forwards form submissions.
// You can set them here or via .env (e.g., VITE_FORMSPREE_FORM_ID)
export const FORMSPREE_FORM_ID = (import.meta.env.VITE_FORMSPREE_FORM_ID || 'REPLACE_WITH_FORMSPREE_FORM_ID').trim()
export const TURNSTILE_SITE_KEY = (import.meta.env.VITE_TURNSTILE_SITE_KEY || 'REPLACE_WITH_CLOUDFLARE_TURNSTILE_SITE_KEY').trim()

export const hasTurnstile = !TURNSTILE_SITE_KEY.startsWith('REPLACE_') && TURNSTILE_SITE_KEY !== ''
export const contactFormConfigured = !FORMSPREE_FORM_ID.startsWith('REPLACE_') && FORMSPREE_FORM_ID !== ''
