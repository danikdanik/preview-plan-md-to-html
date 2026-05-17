#!/usr/bin/env node
// Unwraps pandoc-generated Mermaid blocks and injects CDN + styles + floating TOC + footer

const fs = require('fs');

const file     = process.argv[2];
const srcFile  = process.argv[3] || '';   // original .md path
const gitInfo  = process.argv[4] || '';   // "branch @ worktree" or empty
const genTime  = process.argv[5] || new Date().toISOString();

if (!file) {
  console.error('Usage: postprocess.js <file.html> [src] [git-info] [datetime]');
  process.exit(1);
}
if (!fs.existsSync(file)) {
  console.error('File not found:', file);
  process.exit(1);
}

let html = fs.readFileSync(file, 'utf8');

// Unwrap <pre class="mermaid"><code>...</code></pre> -> <div class="mermaid">...</div>
// pandoc wraps fenced code blocks in <pre><code>; we need bare <div> for Mermaid JS
html = html.replace(
  /<pre[^>]*class="[^"]*mermaid[^"]*"[^>]*>\s*<code[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/g,
  (_, content) => {
    const decoded = content
      .replace(/&gt;/g, '>')
      .replace(/&lt;/g, '<')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    return `<div class="mermaid">${decoded}</div>`;
  }
);

const headInject = `<script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
<style>
  body { max-width: 900px; margin: 40px auto 80px; padding: 0 24px;
         font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
         line-height: 1.65; font-size: 15px; }
  h1, h2 { border-bottom: 1px solid #e0e0e0; padding-bottom: 8px; }
  code { background: #f4f4f4; padding: 1px 5px; border-radius: 3px; font-size: 13px; }
  pre { background: #f4f4f4; border: 1px solid #e0e0e0; border-radius: 6px;
        padding: 16px; overflow-x: auto; }
  pre code { background: none; padding: 0; }
  .mermaid { border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin: 16px 0; }
  table { border-collapse: collapse; width: 100%; margin: 14px 0; }
  th, td { border: 1px solid #e0e0e0; padding: 8px 12px; text-align: left; }
  th { background: #f4f4f4; font-weight: 600; }

  /* Floating TOC panel */
  #toc-panel {
    position: fixed;
    top: 40px;
    left: 20px;
    width: 210px;
    max-height: calc(100vh - 80px);
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 13px;
    line-height: 1.5;
    z-index: 100;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    transition: width 0.2s ease;
  }
  #toc-panel.collapsed { width: 36px; }
  #toc-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px 8px;
    border-bottom: 1px solid #e0e0e0;
  }
  #toc-title {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #999;
    white-space: nowrap;
    overflow: hidden;
  }
  #toc-toggle {
    background: none;
    border: none;
    cursor: pointer;
    color: #aaa;
    font-size: 14px;
    padding: 0 0 0 6px;
    line-height: 1;
    flex-shrink: 0;
  }
  #toc-toggle:hover { color: #555; }
  #toc-links {
    padding: 8px 0 10px;
    overflow-y: auto;
    max-height: calc(100vh - 140px);
  }
  #toc-panel.collapsed #toc-title,
  #toc-panel.collapsed #toc-links { display: none; }
  #toc-links a {
    display: block;
    padding: 3px 12px;
    color: #555;
    text-decoration: none;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  #toc-links a:hover { color: #111; background: #f7f7f7; }
  #toc-links a.toc-h1 { font-weight: 600; color: #333; }
  #toc-links a.toc-h2 { padding-left: 20px; }
  #toc-links a.toc-h3 { padding-left: 30px; font-size: 12px; color: #777; }
  #toc-links a.active { color: #2563eb; font-weight: 500; }

  /* Footer */
  #doc-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fafafa;
    border-top: 1px solid #e8e8e8;
    padding: 6px 20px;
    font-size: 11px;
    color: #999;
    display: flex;
    gap: 20px;
    align-items: center;
    z-index: 99;
    font-family: ui-monospace, "SF Mono", monospace;
    white-space: nowrap;
    overflow: hidden;
  }
  #doc-footer span { overflow: hidden; text-overflow: ellipsis; }
  #doc-footer .label { color: #bbb; font-size: 10px; text-transform: uppercase;
                       letter-spacing: 0.05em; margin-right: 4px; }
</style>`;

// Escape for safe inline JS string embedding
function jsStr(s) {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
}

const footerSrc    = srcFile  ? `<span><span class="label">src</span>${srcFile}</span>` : '';
const footerGit    = gitInfo  ? `<span><span class="label">git</span>${gitInfo}</span>` : '';
const footerTime   = genTime  ? `<span><span class="label">generated</span>${genTime}</span>` : '';

const bodyInject = `<div id="doc-footer">${footerSrc}${footerGit}${footerTime}</div>

<script>
mermaid.initialize({ startOnLoad: true, theme: 'default' });

(function() {
  var headings = Array.from(document.querySelectorAll('h1, h2, h3')).filter(function(h) { return h.id; });
  if (headings.length < 2) return;

  var panel = document.createElement('nav');
  panel.id = 'toc-panel';

  var header = document.createElement('div');
  header.id = 'toc-header';

  var title = document.createElement('span');
  title.id = 'toc-title';
  title.textContent = 'Contents';

  var toggle = document.createElement('button');
  toggle.id = 'toc-toggle';
  toggle.title = 'Toggle TOC';
  toggle.textContent = '◀';
  toggle.addEventListener('click', function() {
    var collapsed = panel.classList.toggle('collapsed');
    toggle.textContent = collapsed ? '▶' : '◀';
  });

  header.appendChild(title);
  header.appendChild(toggle);
  panel.appendChild(header);

  var links = document.createElement('div');
  links.id = 'toc-links';

  headings.forEach(function(h) {
    var a = document.createElement('a');
    a.href = '#' + h.id;
    a.textContent = h.textContent.replace(/¶$/, '').trim();
    a.className = 'toc-' + h.tagName.toLowerCase();
    links.appendChild(a);
  });

  panel.appendChild(links);
  document.body.prepend(panel);

  // Scroll spy — highlight the section currently in view
  var allLinks = links.querySelectorAll('a');
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        allLinks.forEach(function(l) { l.classList.remove('active'); });
        var active = links.querySelector('a[href="#' + entry.target.id + '"]');
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-10% 0px -80% 0px' });

  headings.forEach(function(h) { observer.observe(h); });
})();
</script>`;

html = html.replace('</head>', `${headInject}\n</head>`);
html = html.replace('</body>', `${bodyInject}\n</body>`);

fs.writeFileSync(file, html);
