#!/usr/bin/env node

/**
 * ============================================================
 *  Vartistic Studio — Production Build Script
 *  Minifies HTML/CSS + Obfuscates JS
 *  Run: node build.js
 * ============================================================
 *
 *  Install dependencies first (one-time):
 *    npm install
 *
 *  Output goes to: ./dist/
 * ============================================================
 */

const fs   = require('fs');
const path = require('path');

// ── Dependency check ──────────────────────────────────────────
function requireDep(pkg) {
  try { return require(pkg); }
  catch {
    console.error(`\n❌  Missing package: "${pkg}"\n    Run: npm install\n`);
    process.exit(1);
  }
}

const { minify: minifyHTML }    = requireDep('html-minifier-terser');
const { minify: minifyJS }      = requireDep('terser');
const CleanCSS                   = requireDep('clean-css');
const JavaScriptObfuscator       = requireDep('javascript-obfuscator');

// ── Config ────────────────────────────────────────────────────
const SRC  = '.';          // your project root
const DIST = './dist';     // output folder

// HTML files to process (add more if needed)
const HTML_FILES = [
  'index.html',
  'about.html',
  'contact.html',
  'services.html',
  'work.html',
  'team.html',
  'terms.html',
];

// Files / dirs to copy as-is (no processing)
const COPY_AS_IS = [
  'images',
  'Videos',
  'ads.txt',
  'robots.txt',
  'sitemap.xml',
  '_redirects',
  'netlify.toml',
  'vercel.json',
];

// ── HTML minifier options ─────────────────────────────────────
const HTML_OPTIONS = {
  collapseWhitespace:            true,
  removeComments:                true,
  removeRedundantAttributes:     true,
  removeScriptTypeAttributes:    true,
  removeStyleLinkTypeAttributes: true,
  useShortDoctype:               true,
  minifyCSS:                     true,
  minifyJS:                      false, // JS handled separately
  keepClosingSlash:              false,
};

// ── CSS minifier options ──────────────────────────────────────
const CSS_OPTIONS = {
  level: { 1: { all: true }, 2: { all: true } }
};

// ── JS obfuscator options ─────────────────────────────────────
// High protection, still functional
const OBFUSCATOR_OPTIONS = {
  compact:                           true,
  controlFlowFlattening:             true,
  controlFlowFlatteningThreshold:    0.5,
  deadCodeInjection:                 true,
  deadCodeInjectionThreshold:        0.2,
  debugProtection:                   true,   // crashes debugger
  debugProtectionInterval:           2000,   // re-triggers every 2s
  disableConsoleOutput:              true,   // kills console.log in prod
  identifierNamesGenerator:         'hexadecimal',
  log:                               false,
  numbersToExpressions:              true,
  renameGlobals:                     false,
  selfDefending:                     true,   // resists formatting/beautifying
  simplify:                          true,
  splitStrings:                      true,
  splitStringsChunkLength:           10,
  stringArray:                       true,
  stringArrayCallsTransform:         true,
  stringArrayEncoding:               ['base64'],
  stringArrayIndexShift:             true,
  stringArrayRotate:                 true,
  stringArrayShuffle:                true,
  stringArrayWrappersCount:          2,
  stringArrayWrappersChainedCalls:   true,
  stringArrayWrappersParametersMaxCount: 4,
  stringArrayWrappersType:           'function',
  stringArrayThreshold:              0.75,
  transformObjectKeys:               true,
  unicodeEscapeSequence:             false,
};

// ── Helpers ───────────────────────────────────────────────────
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    ensureDir(dest);
    for (const child of fs.readdirSync(src)) {
      copyRecursive(path.join(src, child), path.join(dest, child));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

function fmtBytes(bytes) {
  return bytes < 1024
    ? `${bytes} B`
    : `${(bytes / 1024).toFixed(1)} KB`;
}

function savings(original, processed) {
  const saved  = original.length - processed.length;
  const pct    = ((saved / original.length) * 100).toFixed(1);
  return `${fmtBytes(original.length)} → ${fmtBytes(processed.length)}  (saved ${pct}%)`;
}

// ── Main build ────────────────────────────────────────────────
(async () => {
  console.log('\n🔨  Vartistic Studio — Production Build\n' + '─'.repeat(50));

  // 1. Clean dist
  if (fs.existsSync(DIST)) fs.rmSync(DIST, { recursive: true });
  ensureDir(DIST);
  console.log('✅  Cleaned dist/');

  // 2. Minify CSS
  const cssIn  = fs.readFileSync(path.join(SRC, 'style.css'), 'utf8');
  const cssOut = new CleanCSS(CSS_OPTIONS).minify(cssIn).styles;
  fs.writeFileSync(path.join(DIST, 'style.css'), cssOut);
  console.log(`✅  style.css       ${savings(cssIn, cssOut)}`);

  // 3. Obfuscate + minify JS
  const jsIn   = fs.readFileSync(path.join(SRC, 'script.js'), 'utf8');
  // Step A: terser minify
  const terserResult = await minifyJS(jsIn, {
    compress: { drop_console: false }, // obfuscator handles console
    mangle:   true,
  });
  const jsMini = terserResult.code;
  // Step B: obfuscate
  const jsOut  = JavaScriptObfuscator.obfuscate(jsMini, OBFUSCATOR_OPTIONS).getObfuscatedCode();
  fs.writeFileSync(path.join(DIST, 'script.js'), jsOut);
  console.log(`✅  script.js       ${savings(jsIn, jsOut)}`);

  // 4. Minify HTML files
  for (const file of HTML_FILES) {
    const srcPath = path.join(SRC, file);
    if (!fs.existsSync(srcPath)) {
      console.log(`⚠️   ${file} not found — skipped`);
      continue;
    }
    const htmlIn  = fs.readFileSync(srcPath, 'utf8');
    const htmlOut = await minifyHTML(htmlIn, HTML_OPTIONS);
    fs.writeFileSync(path.join(DIST, file), htmlOut);
    console.log(`✅  ${file.padEnd(18)} ${savings(htmlIn, htmlOut)}`);
  }

  // 5. Copy static assets
  for (const item of COPY_AS_IS) {
    const srcPath  = path.join(SRC, item);
    const destPath = path.join(DIST, item);
    if (fs.existsSync(srcPath)) {
      copyRecursive(srcPath, destPath);
      console.log(`📁  Copied: ${item}`);
    }
  }

  // 6. Security headers injection — add anti-devtools script to every HTML
  const antiDevTools = `<script>!function(){document.addEventListener("contextmenu",function(e){e.preventDefault()});document.addEventListener("keydown",function(e){if(e.key==="F12"||(e.ctrlKey&&e.shiftKey&&["I","J","C","i","j","c"].includes(e.key))||(e.ctrlKey&&["u","U","s","S"].includes(e.key))){e.preventDefault();return false}});var _0x=function(){var w=window,t=+new Date;(function _l(){if(+new Date-t>100){document.body.innerHTML="<div style='display:flex;align-items:center;justify-content:center;height:100vh;background:#0e0e0e;color:#d4af37;font-family:sans-serif;font-size:2rem;'>© Vartistic Studio</div>";return}window.requestAnimationFrame(_l)})()};setInterval(function(){var s=+new Date;debugger;if(+new Date-s>100)_0x()},1500)}();</script>`;

  for (const file of HTML_FILES) {
    const destPath = path.join(DIST, file);
    if (!fs.existsSync(destPath)) continue;
    let html = fs.readFileSync(destPath, 'utf8');
    // Inject right before </body>
    if (html.includes('</body>')) {
      html = html.replace('</body>', antiDevTools + '</body>');
      fs.writeFileSync(destPath, html);
    }
  }
  console.log('🔒  Anti-devtools script injected into all HTML files');

  // 7. Write build manifest
  const manifest = {
    built:   new Date().toISOString(),
    files:   HTML_FILES,
    version: '1.0.0',
  };
  fs.writeFileSync(path.join(DIST, 'build-manifest.json'), JSON.stringify(manifest, null, 2));

  console.log('\n' + '─'.repeat(50));
  console.log('🚀  Build complete! Deploy the contents of  ./dist/\n');
})();
