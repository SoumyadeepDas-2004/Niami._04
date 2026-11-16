# Artist portfolio (static site)

Plain HTML, CSS and JavaScript. No build step, no backend, no cost on Cloudflare Pages' free tier.

## Structure
`index/gallery/about/commissions/404.html`, `css/style.css`, `js/main.js` (header, footer, site details), `js/gallery.js` (gallery + lightbox), `data/artworks.json`, `assets/images/`.

## Add an artwork (no code changes)
1. Save the optimized image in `assets/images/`.
2. Add one entry to `data/artworks.json`:
```json
{
  "id": 7,
  "title": "Dreams in Colour",
  "image": "assets/images/dreams-in-colour.webp",
  "width": 1200,
  "height": 1500,
  "category": "Illustration",
  "description": "An expressive original artwork.",
  "year": 2026,
  "medium": "Digital illustration",
  "featured": true,
  "order": 1
}
```
3. `git add . && git commit -m "Add artwork" && git push`. Cloudflare Pages redeploys automatically.

Notes: `id` must be unique. Lower `order` shows first. `featured: true` shows on the home page (first 3). New categories appear as filters automatically. `width`/`height` are the image's pixel size and prevent layout shift. Optional `alt` gives custom alt text. Remove the six `sample-*` entries and files when real work is added.

## Image guidance
Export WebP, longest edge about 1600 px, quality 80–85, ideally under 300 KB (try squoosh.app). Keep the original high-resolution files in a separate folder or backup, not in this repo.

## Deploy to Cloudflare Pages
1. Push the project to GitHub.
2. Cloudflare dashboard, Workers & Pages, Create, Pages, Connect to Git, pick the repo.
3. Framework preset: None. Build command: leave empty. Output directory: `/` (root). Deploy.
4. Optional: add a custom domain under the project's Custom domains tab.

## Placeholder checklist
- [ ] `js/main.js`: `SITE` name, Instagram URL, email
- [ ] `<title>`, description and Open Graph tags in every HTML file (`[ARTIST NAME]`)
- [ ] `[YOUR-DOMAIN]` in `sitemap.xml`, `robots.txt` and the `og:image` tags
- [ ] Add `assets/og-image.jpg` (1200×630 JPG, SVG is not supported for previews)
- [ ] Home, About and Commissions text in square brackets
- [ ] Replace sample artworks; update `favicon.svg`

## Test checklist
- [ ] Run locally: `python3 -m http.server 8000`, open http://localhost:8000 (opening files directly blocks `fetch`)
- [ ] Gallery loads, filters work, no broken images
- [ ] Lightbox: click, arrows, Escape, click outside, Tab stays inside
- [ ] Rename `data/artworks.json` temporarily: a friendly message appears
- [ ] Mobile menu works at 375 px width; no sideways scrolling
- [ ] Keyboard-only navigation shows visible focus
- [ ] Visit a missing URL: 404 page appears with correct styling
- [ ] Lighthouse scores are high for Performance, Accessibility and SEO
