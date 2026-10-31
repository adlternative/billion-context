import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const directory = dirname(fileURLToPath(import.meta.url));
const translations = JSON.parse(await readFile(join(directory, 'src/en.json'), 'utf8'));
const css = await readFile(join(directory, 'src/standalone.css'), 'utf8');
const source = await Promise.all(['compression', 'delegate'].map(async name => ({ name, text: await readFile(join(directory, `src/${name}.html`), 'utf8') })));

function english(text) {
  for (const [from, to] of Object.entries(translations).sort((a, b) => b[0].length - a[0].length)) text = text.replaceAll(from, to);
  const untranslated = text.split('\n').filter(line => /[\u3400-\u9fff]/u.test(line));
  if (untranslated.length) throw new Error(`Untranslated English content:\n${untranslated.join('\n')}`);
  return text;
}

const copy = {
  en: {
    file: 'context-explainer.html', other: 'context-explainer.zh-CN.html', switch: '中文', title: 'billion-context: interactive ASCII walkthrough',
    description: 'Explore model-visible context, layered summaries, on-demand restoration, and independent Pi delegate sessions.',
    compression: 'Compression and restoration', delegate: 'Pi delegation',
    introduction: 'Watch the input blocks shrink and merge while their source messages remain addressable. Then compare this with delegation into a separate Pi process.',
    notice: 'Teaching simulation, not a live session or a performance benchmark. 50K → 1K and four-block promotion are illustrative; real ranges, timing, and summary sizes are chosen by the model. Fixed input and receipt sizes are simplified.',
    distinction: 'Default restore returns the previous layer; full:true requests original messages. Large text may be written to a file before it is read. Delegation is a separate mechanism and can use compression inside the child session.',
    storage: 'Runs offline. Controls are saved locally when browser storage is available; they never start real agents or write project files.',
    sources: 'Implementation references', sourceCompression: 'Restore behavior', sourceDelegate: 'Pi subprocess delegation',
    nojs: 'Enable JavaScript to play the local, client-side simulations.',
  },
  'zh-CN': {
    file: 'context-explainer.zh-CN.html', other: 'context-explainer.html', switch: 'English', title: 'billion-context：ASCII 交互原理演示',
    description: '交互查看模型可见上下文、分层摘要、按需解压与独立 Pi 子会话。',
    compression: '压缩与解压', delegate: 'Pi 子代理',
    introduction: '观察模型输入中的原文块如何收缩、摘要如何逐层合并，以及原文引用如何保留。再与独立 Pi 子进程中的任务派发对照。',
    notice: '教学模拟，不是实时会话或性能测试。50K → 1K 与每四块晋升均为示意参数；实际范围、时机与摘要大小由模型选择。固定输入与回执大小经过简化。',
    distinction: '默认解压取上一层；full:true 请求原文。大文本可能先写入文件，再按需读取。delegate 属于独立机制，子会话内部也可以使用压缩。',
    storage: '可离线运行。浏览器允许时仅在本机保存交互进度；不会启动真实代理或修改项目文件。',
    sources: '实现参考', sourceCompression: '解压行为', sourceDelegate: 'Pi 子进程派发',
    nojs: '请启用 JavaScript 以播放本地交互演示。',
  },
};

const runtime = `
window.createExplainerState = function (name) {
  const key = 'billion-context:interactive:v1:' + name;
  let state = null;
  try { state = JSON.parse(localStorage.getItem(key)); } catch (_) {}
  const store = {
    widgetState: state,
    setWidgetState(next) {
      store.widgetState = next;
      try { localStorage.setItem(key, JSON.stringify(next)); } catch (_) {}
      return Promise.resolve();
    }
  };
  return store;
};
document.addEventListener('pointerover', function (event) {
  const target = event.target.closest('[data-tooltip]');
  if (!target) return;
  const value = target.getAttribute('data-tooltip');
  target.setAttribute('aria-label', value);
  if (target.namespaceURI === 'http://www.w3.org/2000/svg') {
    if (!target.querySelector(':scope > title')) {
      const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      title.textContent = value;
      target.appendChild(title);
    }
  } else target.setAttribute('title', value);
});`;

for (const [language, labels] of Object.entries(copy)) {
  const fragments = source.map(item => ({ ...item, text: language === 'en' ? english(item.text) : item.text }));
  const html = `<!doctype html>
<html lang="${language}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="${labels.description}">
<meta name="referrer" content="no-referrer">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'; base-uri 'none'; form-action 'none'">
<title>${labels.title}</title>
<style>${css}</style>
</head>
<body>
<header class="page-header">
  <a class="brand" href="../index.html">billion-context</a>
  <nav aria-label="${language === 'en' ? 'Page navigation' : '页面导航'}">
    <a href="#compression">${labels.compression}</a><a href="#delegate">${labels.delegate}</a>
    <a href="${labels.other}" lang="${language === 'en' ? 'zh-CN' : 'en'}" hreflang="${language === 'en' ? 'zh-CN' : 'en'}">${labels.switch}</a>
  </nav>
</header>
<main>
  <h1>${labels.title}</h1>
  <p class="introduction">${labels.introduction}</p>
  <p class="notice">${labels.notice}</p>
  <noscript>${labels.nojs}</noscript>
  <script>${runtime}</script>
  <section id="compression" aria-label="${labels.compression}">${fragments[0].text}</section>
  <p class="distinction">${labels.distinction}</p>
  <section id="delegate" aria-label="${labels.delegate}">${fragments[1].text}</section>
</main>
<footer>
  <p>${labels.storage}</p>
  <p>${labels.sources}: <a href="https://github.com/ranxianglei/billion-context/blob/master/src/decompress-shared.ts">${labels.sourceCompression}</a> · <a href="https://github.com/ranxianglei/billion-context/blob/master/pi-subagents/src/delegate-tool.ts">${labels.sourceDelegate}</a></p>
</footer>
</body>
</html>
`;
  if (/window\.openai|persistent\.oaistatic|<iframe|<script[^>]*\bsrc=|<link[^>]*stylesheet/.test(html)) throw new Error('Standalone page contains a host or network dependency');
  await writeFile(join(directory, labels.file), html);
  process.stdout.write(`${labels.file}: ${Buffer.byteLength(html)} bytes\n`);
}
