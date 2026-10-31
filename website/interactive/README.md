# Interactive ASCII walkthrough

- [English](context-explainer.html)
- [中文](context-explainer.zh-CN.html)

Both checked-in HTML files are standalone: download and open either file directly,
or serve `website/` using `python3 -m http.server 8090`. No install, external scripts,
fonts, network requests, model calls, or build step is required to view them.

The first animation projects the active source-tree nodes into the next model
input. Original messages shrink into summaries, four summaries merge into a
parent, and restoration adds either a tool result or a file receipt. The second
animation keeps parent and child Pi contexts separate during delegation.

The model-input order, sizes and cadence are schematic. The examples use 50K
original-token batches, 1K summaries, four-block promotions and a 2K fixed input.
Real model decisions and protected ranges differ; these are not benchmark results.
The `.out`, `demo.txt`, and session names are examples and are never created.

## Editing

The two fragments in `src/` share their interaction logic across languages.
`src/en.json` localizes all static and dynamically generated labels. Run:

```bash
node website/interactive/build.mjs
```

The builder emits both pages with all CSS and scripts inlined and fails if the
English fragment contains untranslated Chinese or a host/network dependency.
`src/standalone.css` supplies the standalone controls and light/dark theme.
Browser storage is optional; blocked storage does not prevent playback.

See [中文维护说明](README.zh-CN.md).
