# Vartistic Studio — Build & Protection System

## What this does

| Layer | Tool | Effect |
|---|---|---|
| JS Obfuscation | `javascript-obfuscator` | Renames variables to hex, encodes strings in base64, adds dead code, self-defends against beautifiers |
| JS Minify | `terser` | Strips whitespace, mangles names |
| CSS Minify | `clean-css` | Removes all comments, whitespace, merges rules |
| HTML Minify | `html-minifier-terser` | Collapses whitespace, removes comments |
| Anti-DevTools | Injected script | Disables right-click, F12, Ctrl+U, Ctrl+Shift+I, crashes debugger |

---

## Setup (one-time)

1. Copy `build.js`, `package.json` into your project root (same folder as `index.html`)
2. Install dependencies:
```bash
npm install
```

---

## Build

```bash
npm run build
# or
node build.js
```

Output goes to `./dist/` — **deploy this folder**, not the root.

---

## Deploy

### Netlify
Replace your existing `netlify.toml` with the one provided.
Netlify will auto-run `npm install && node build.js` on every push and publish `dist/`.

### Vercel
Replace your existing `vercel.json` with the one provided.
Vercel will do the same.

### Manual / cPanel / FTP
Run `node build.js` locally, then upload the contents of `dist/` to your server.

---

## What visitors see in DevTools

- **HTML**: One long unreadable line, no comments, no indentation
- **CSS**: One long compressed string
- **JS**: Hex variable names (`_0x3f2a`), base64 encoded strings, self-defending code, active `debugger` trap that freezes DevTools

## What CANNOT be hidden

The browser must receive HTML/CSS/JS to render it. A very determined developer with network sniffing tools can still intercept the raw bytes. The goal of this system is to make casual copying and scraping economically not worth the effort — which it achieves very effectively.

Your Flask `app.py` backend is already 100% hidden (server-side).

---

## Adding new HTML pages

Open `build.js` and add the filename to the `HTML_FILES` array:

```js
const HTML_FILES = [
  'index.html',
  'about.html',
  // 'newpage.html',  ← add here
];
```
