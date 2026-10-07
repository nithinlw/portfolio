# Nithin Weerasinghe, portfolio

A hand-built static site: plain HTML, CSS and JavaScript, no build step. Everything deployable lives in `site/`.

**Design.** A traditional academic portfolio with a few bold touches. Yoshitoshi Abe shows up in the pale sky gradients, the overhead wires and the light film grain. Trigger shows up in the heavy uppercase nav and buttons, which are bold ink text that turns teal on hover. It also shows up in the black pill used for each page's main button, the white rounded cards and the halftone dots in the footer. Teal (`--teal`) is the only accent color. Fonts are Newsreader for display, Geist for text and Geist Mono for labels. Light and dark themes follow the system setting and can be switched with the toggle. Motion stays small: a fade-up on scroll, headings whose words rise in, and a two-blade diagonal page transition. All of it is turned off under `prefers-reduced-motion`.

## Pages

| File | Contents |
| --- | --- |
| `index.html` | Hero, research interests, four research cards, publications, other work |
| `va-llm.html`, `policy-map.html`, `covid-tweets.html`, `parsons.html` | Research briefs structured by the Heilmeier Catechism: objective, current practice, approach, impact, risks, resources, timeline, evaluation |
| `research.html` | Full CV with a sticky section rail |
| `posters.html` | Poster wall, rendered from `assets/data/posters.json` |
| `other-work.html` | A Grimoire's Tale (itch.io embed), digit recognition, carillon arrangement |
| `about.html` | Bio, timeline, interests, motto, essay |

All styling is in `assets/css/site.css` and all behavior is in `assets/js/site.js`. The nav and footer are injected by `site.js`, which reads `<body data-page="...">` to mark the current page.

## Run locally

```
python serve.py 5173
```

This serves `site/` with caching disabled. Then open http://localhost:5173.

## Deploy (Vercel)

Import `nithinlw/portfolio` in Vercel and choose the "Other" framework preset. `vercel.json` sets the output directory to `site/`, and there is no build step. Every push to `main` redeploys.

## Adding posters

1. Put the image (JPG or PNG) and, optionally, the PDF in `site/assets/posters/`.
2. In `site/assets/data/posters.json`, set `"image"` and `"pdf"` on the matching item, for example `"sleep-2026.jpg"`. To add a new poster, copy an item and edit it.
3. If an item has no image, it shows a placeholder card that says "Poster to follow". Items are sorted newest first.

## Live dashboard link

`window.LIVE_DASHBOARD_URL` at the bottom of `site/policy-map.html` is set to https://social-media-policy-map.vercel.app/ and drives the "Open the live dashboard" button. If you clear it, the button hides. The dashboard screenshots (`assets/img/dash-*.jpg`, `thumb-policy-map.jpg`) were captured in October 2026. Recapture them when the dashboards change.

## Before publishing

- The CV PDF in `site/assets/files/` includes a phone number and is published as is. To change that, replace the file and push.
- `assets/img/burton.jpg` (Burton Memorial Tower) came from the old portfolio. Confirm it can be reused, or credit the photographer.
- The page copy contains no patient data and no em-dashes or en-dashes. Keep it that way when you edit.

## Folders

- `site/`: the website
- `old-portfolio/`: the previous site, kept for reference
- `archive/img/`: images no longer used on the site (graphic design work, extra game screenshots), kept out of the deploy
- `tools/prep_images.py`: resizes and compresses source images into `site/assets/img/`
