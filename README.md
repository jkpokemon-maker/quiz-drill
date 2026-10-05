# Quiz Drill

Offline quiz drills for N1 Japanese grammar nuances and CCNA 200-301. Plain HTML/CSS/JS, with no build step and no dependencies.

## Run it

- **From disk:** double-click `index.html`. Everything works except "install as app".
- **Installable / offline on any device:** host the folder on a static host (e.g. GitHub Pages, free). Open it once, then use the browser's "Install" option; after that it works offline.

Progress is saved in the browser (localStorage) and stays on that device and browser only.

## Add questions

Edit `data/japanese.js` or `data/ccna.js`. Each question needs a unique, stable `id`, because progress is stored by id.

```js
{ id: 'cc-999', type: 'mc', prompt: '…', choices: ['correct', 'wrong', 'wrong'], answer: 0, explanation: '…' }
{ id: 'cc-998', type: 'fill', prompt: '…', accept: ['110'], explanation: '…' }
```

Choices are shuffled when shown, so the correct one can be listed first. Adding a new topic name creates a new topic chip automatically.

If you host the app and add new files, add them to `ASSETS` in `sw.js` and bump `CACHE`.
