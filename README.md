# Sujan S — Portfolio

Static site: no build step. GSAP ScrollTrigger + Lenis smooth scroll from CDNs; Inter Tight, Instrument Serif and Geist Mono from Google Fonts.

## Run locally

ES modules need a server (opening `index.html` directly won't work):

```bash
python -m http.server 5173
```

Then open http://localhost:5173

## Résumé

Put your PDF at the project root as **`sujan.pdf`**. All "View Résumé" buttons open it in a viewer modal (on phones it opens in a new tab), with Open and Download actions. Until the file exists, the modal shows a placeholder.

## Deploy

Drag the folder into Vercel / Netlify, or push to GitHub and enable GitHub Pages. No config needed.

## Structure

```
index.html            content & sections
css/style.css         design tokens ("Signal": black, warm white, lime accent), layout, responsive
js/main.js            dot-matrix hero field, Lenis smooth scroll, GSAP reveals, stacking case studies,
                      F1 chat demo, typing code/email, cursor, résumé modal
img/avatar.webp       hero avatar (background removed)
img/sujan-beach.webp  About photo
img/healthmate.webp   HealthMate AI screenshot
```
