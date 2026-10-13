# Sujan S — Portfolio

Static site: no build step. GSAP ScrollTrigger + Lenis smooth scroll from CDNs, Geist fonts. Navy + sky-blue design.

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
index.html       content & sections
css/style.css    design tokens, layout, responsive rules
js/stars.js      sparse twinkling star layer (scroll parallax)
js/main.js       smooth scroll, reveals, typewriter, avatar tilt, tabs, tech stack, resume modal
img/avatar.webp  hero avatar (background removed)
```
