# Editorial portfolio

Static Vite + React portfolio. Page copy and image lists are maintained in `src/site/content.js`; no CMS, database, or project account is needed to run the site. Contact enquiries use Formspree after its public form ID and Turnstile site key are configured in `src/config/integrations.js`.

## Run locally

1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Run `npm run dev` and open the local URL Vite prints.

## Update content

Edit the identity, hero photos, portfolio categories, gallery photos, publications, and Instagram strip in `src/site/content.js`. Images currently use Unsplash image IDs; replace them with approved image IDs or local files placed in `public/`. Use descriptive alt text for each image. Run `npm run build` before deployment.

## Contact form

Create a Formspree form addressed to the client. Enable Cloudflare Turnstile in Formspree and configure the widget's allowed domains. Put only the public form ID and Turnstile site key in `src/config/integrations.js`. Never add the private Turnstile secret to the browser code.

## Deploy

Deploy to Vercel or Netlify with build command `npm run build` and output directory `dist`. The host config includes SPA rewrites and security headers. Replace all example identity, photos, publication references and links before launch.
