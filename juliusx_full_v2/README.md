# JuliusX — static site

This repo contains your static portfolio + shop.

## Edit content
- Add/remove gallery items: `content/gallery.json` (and drop files into `/images` or `/media`).
- Add/remove products: `content/products.json` (Stripe Checkout links go in `checkout_url`).
- Site name / tagline / nav / socials: `content/site.json`.

## Local preview
Just open `index.html` in a browser. Some browsers block `fetch` from local files; if gallery doesn't load,
run a tiny server from the folder:
- Python 3: `python3 -m http.server 8000` → visit http://localhost:8000

## Deploy (GitHub Pages)
1) Create a new repo, upload files.
2) Settings → Pages → Deploy from a branch → `main` → `/ (root)`.
3) (Optional) Add a `CNAME` file containing `juliusx.com` and point your DNS to GitHub Pages.

## Contact form
Create a Formspree form and replace the action URL in `contact.html` (`YOUR_FORM_CODE`).

