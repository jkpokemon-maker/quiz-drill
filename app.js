(() => {
  'use strict';

  const SUBJECTS = {
    japanese: { name: '日本語文法', tag: 'N1 nuances', lang: 'ja' },
    ccna: { name: 'CCNA', tag: '200-301', lang: 'en' },
  };
  const MODES = {
    smart: { name: 'Smart', desc: 'Due reviews first, then new questions, then the rest.' },
    random: { name: 'Random', desc: 'Shuffle everything in the selected topics.' },
    weak: { name: 'Weak spots', desc: 'Questions with your lowest accuracy first.' },
  };
  const LENGTHS = [10, 20, 40];

  // Leitner-style spaced repetition: a correct answer moves a question up one box,
  // a wrong answer sends it back to box 0 (due again immediately).
  const INTERVALS_DAYS = [0, 1, 3, 7, 14, 30];
  const MASTERED_BOX = 4;
  const DAY = 86400000;
  const STORE_KEY = 'quiz-drill.v1';

  const QUIZ = window.QUIZ || { questions: [], generators: [] };
  const app = document.getElementById('app');

  // ---------- persistence ----------
  function loadState() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* storage blocked: run in memory only */ }
    return {};
  }
  const state = Object.assign({ progress: {}, genStats: {}, prefs: {} }, loadState());
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }

  function record(q, ok) {
    if (q.generated) {
      const key = q.subject + '|' + q.topic;
      const g = state.genStats[key] || (state.genStats[key] = { seen: 0, correct: 0 });
      g.seen++;
      if (ok) g.correct++;
    } else {
      const p = state.progress[q.id] || { box: 0, due: 0, seen: 0, correct: 0 };
      p.seen++;
      if (ok) p.correct++;
      p.box = ok ? Math.min(p.box + 1, INTERVALS_DAYS.length - 1) : 0;
      p.due = Date.now() + INTERVALS_DAYS[p.box] * DAY;
      state.progress[q.id] = p;
    }
    save();
  }

  // ---------- helpers ----------
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = s => String(s).replace(/[&<>"']/g, c => ESC[c]);
  const norm = s => String(s).normalize('NFKC').trim().toLowerCase().replace(/\s+/g, '');
  const pct = (c, n) => (n ? Math.round((100 * c) / n) : null);
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function bankFor(subject) { return QUIZ.questions.filter(q => q.subject === subject); }
  function generatorsFor(subject) { return QUIZ.generators.filter(g => g.subject === subject); }
  function topicsFor(subject) {
    const topics = [...new Set(bankFor(subject).map(q => q.topic))];
    generatorsFor(subject).forEach(g => { if (!topics.includes(g.topic)) topics.push(g.topic); });
    return topics;
  }
  function correctText(q) { return q.type === 'mc' ? q.choices[q.answer] : (q.display || q.accept[0]); }

  function subjectSummary(subject) {
    const now = Date.now();
    const s = { total: 0, due: 0, fresh: 0, mastered: 0 };
    for (const q of bankFor(subject)) {
      s.total++;
      const p = state.progress[q.id];
      if (!p) s.fresh++;
      else {
        if (p.due <= now) s.due++;
        if (p.box >= MASTERED_BOX) s.mastered++;
      }
    }
    return s;
  }

  // ---------- session building ----------
  function buildSession(subject, topics, length, mode) {
    const now = Date.now();
    const pool = bankFor(subject).filter(q => topics.includes(q.topic));
    const gens = generatorsFor(subject).filter(g => topics.includes(g.topic));
    const prog = q => state.progress[q.id];

    let ordered;
    if (mode === 'random') {
      ordered = shuffle(pool);
    } else if (mode === 'weak') {
      // Unseen questions sort last; among seen ones, low accuracy and low box come first.
      const score = q => { const p = prog(q); return p ? p.correct / p.seen + p.box * 0.1 : 9; };
      ordered = shuffle(pool).sort((a, b) => score(a) - score(b));
    } else {
      const due = pool.filter(q => prog(q) && prog(q).due <= now).sort((a, b) => prog(a).due - prog(b).due);
      const fresh = shuffle(pool.filter(q => !prog(q)));
      const later = pool.filter(q => prog(q) && prog(q).due > now).sort((a, b) => prog(a).due - prog(b).due);
      ordered = [...due, ...fresh, ...later];
    }

    // Generated topics get a share of the session proportional to topic count,
    // and also fill any slots the question bank can't.
    const bankTopics = new Set(pool.map(q => q.topic)).size;
    const genShare = gens.length ? Math.round((length * gens.length) / (bankTopics + gens.length)) : 0;
    const picked = ordered.slice(0, length - genShare);
    const genCount = gens.length ? length - picked.length : 0;
    const generated = Array.from({ length: genCount }, () => gens[Math.floor(Math.random() * gens.length)].make());
    return shuffle([...picked, ...generated]);
  }

  // ---------- views ----------
  let view = 'home';
  let session = null;
  const home = {
    subject: SUBJECTS[state.prefs.subject] ? state.prefs.subject : 'japanese',
    mode: MODES[state.prefs.mode] ? state.prefs.mode : 'smart',
    length: LENGTHS.includes(state.prefs.length) ? state.prefs.length : 20,
  };
  function chosenTopics(subject) {
    const all = topicsFor(subject);
    const saved = state.prefs.topics && state.prefs.topics[subject];
    return saved ? saved.filter(t => all.includes(t)) : all;
  }
  function setTopics(subject, topics) {
    state.prefs.topics = state.prefs.topics || {};
    state.prefs.topics[subject] = topics;
    save();
  }

  function renderHome() {
    view = 'home';
    session = null;
    const subject = home.subject;
    const chosen = chosenTopics(subject);
    const counts = {};
    bankFor(subject).forEach(q => { counts[q.topic] = (counts[q.topic] || 0) + 1; });

    const cards = Object.entries(SUBJECTS).map(([key, s]) => {
      const sum = subjectSummary(key);
      return `<button type="button" class="subject-card${key === subject ? ' active' : ''}" data-subject="${key}">
        <span class="subject-name" lang="${s.lang}">${esc(s.name)}</span>
        <span class="subject-tag">${esc(s.tag)}</span>
        <span class="subject-stats">${sum.due} due · ${sum.fresh} new · ${sum.mastered}/${sum.total} mastered</span>
      </button>`;
    }).join('');

    const chips = topicsFor(subject).map(t => `<button type="button" class="chip${chosen.includes(t) ? ' on' : ''}" data-topic="${esc(t)}" lang="${SUBJECTS[subject].lang}">${esc(t)}<small>${counts[t] ? counts[t] : '∞'}</small></button>`).join('');
    const modes = Object.entries(MODES).map(([k, m]) => `<button type="button" class="${k === home.mode ? 'on' : ''}" data-mode="${k}">${m.name}</button>`).join('');
    const lengths = LENGTHS.map(n => `<button type="button" class="${n === home.length ? 'on' : ''}" data-length="${n}">${n}</button>`).join('');

    app.innerHTML = `<section>
      <div class="subjects">${cards}</div>
      <div class="panel">
        <div class="section">
          <div class="section-head"><h2>Topics</h2><button type="button" class="link" data-action="toggle-all">${chosen.length ? 'Select none' : 'Select all'}</button></div>
          <div class="chips">${chips}</div>
        </div>
        <div class="section">
          <div class="section-head"><h2>Mode</h2></div>
          <div class="segmented">${modes}</div>
          <p class="hint">${esc(MODES[home.mode].desc)}</p>
        </div>
        <div class="section">
          <div class="section-head"><h2>Questions</h2></div>
          <div class="segmented">${lengths}</div>
        </div>
        <div class="start-row">
          <button type="button" class="primary" data-action="start"${chosen.length ? '' : ' disabled'}>Start session</button>
          ${chosen.length ? '' : '<span class="hint">Pick at least one topic.</span>'}
        </div>
      </div>
    </section>`;
  }

  function onHomeClick(t) {
    const subject = home.subject;
    if (t.dataset.subject) {
      home.subject = t.dataset.subject;
      state.prefs.subject = home.subject; save();
    } else if (t.dataset.topic !== undefined) {
      const chosen = chosenTopics(subject);
      const topic = t.dataset.topic;
      setTopics(subject, chosen.includes(topic) ? chosen.filter(x => x !== topic) : [...chosen, topic]);
    } else if (t.dataset.mode) {
      home.mode = t.dataset.mode;
      state.prefs.mode = home.mode; save();
    } else if (t.dataset.length) {
      home.length = Number(t.dataset.length);
      state.prefs.length = home.length; save();
    } else if (t.dataset.action === 'toggle-all') {
      setTopics(subject, chosenTopics(subject).length ? [] : topicsFor(subject));
    } else if (t.dataset.action === 'start') {
      const items = buildSession(subject, chosenTopics(subject), home.length, home.mode);
      if (items.length) startSession(items);
      return;
    } else return;
    renderHome();
  }

  function startSession(items) {
    session = { items, i: 0, results: [], current: null, order: null };
    enterSubpage();
    renderQuestion();
  }

  function renderQuestion() {
    view = 'quiz';
    const { items, i } = session;
    const q = items[i];
    const lang = SUBJECTS[q.subject].lang;
    session.current = null;
    session.order = q.type === 'mc' ? shuffle(q.choices.map((_, k) => k)) : null;

    let body;
    if (q.type === 'mc') {
      body = `<div class="choices">${session.order.map((k, n) => `<button type="button" class="choice" data-k="${k}" lang="${lang}"><kbd>${n + 1}</kbd><span>${esc(q.choices[k])}</span></button>`).join('')}</div>`;
    } else {
      body = `<form class="fill" autocomplete="off">
        <input type="text" name="answer" placeholder="${esc(q.placeholder || 'Your answer')}" aria-label="Your answer" spellcheck="false" autocapitalize="off">
        <button type="submit" class="primary">Check</button>
      </form>`;
    }

    app.innerHTML = `<section>
      <div class="progress"><div class="bar" style="width:${(100 * i) / items.length}%"></div></div>
      <div class="meta"><span class="tag" lang="${lang}">${esc(q.topic)}</span><span>${i + 1} / ${items.length}</span></div>
      <div class="panel">
        <p class="prompt" lang="${lang}">${esc(q.prompt)}</p>
        ${q.code ? `<pre class="code">${esc(q.code)}</pre>` : ''}
        ${body}
        <div class="feedback" hidden></div>
      </div>
      <div class="quiz-foot"><button type="button" class="link" data-action="quit">End session</button></div>
    </section>`;

    if (q.type === 'fill') {
      const form = app.querySelector('form.fill');
      form.addEventListener('submit', e => {
        e.preventDefault();
        if (session.current) return;
        const given = form.answer.value;
        if (!given.trim()) return;
        answer(given);
      });
      form.answer.focus();
    }
  }

  function answer(given) {
    const q = session.items[session.i];
    const lang = SUBJECTS[q.subject].lang;
    let ok;
    if (q.type === 'mc') {
      ok = Number(given) === q.answer;
      app.querySelectorAll('.choice').forEach(b => {
        const k = Number(b.dataset.k);
        b.disabled = true;
        if (k === q.answer) b.classList.add('correct');
        else if (String(k) === String(given)) b.classList.add('wrong');
      });
    } else {
      ok = q.accept.some(a => norm(a) === norm(given));
      const input = app.querySelector('.fill input');
      input.disabled = true;
      input.classList.add(ok ? 'correct' : 'wrong');
      app.querySelector('.fill button').hidden = true;
    }
    session.current = { ok, given };

    const fb = app.querySelector('.feedback');
    fb.hidden = false;
    fb.innerHTML = `<p class="verdict ${ok ? 'ok' : 'bad'}">${ok ? 'Correct' : 'Not quite'}</p>
      ${ok ? '' : `<p class="answer-line">Answer: <strong lang="${lang}">${esc(correctText(q))}</strong></p>`}
      ${q.explanation ? `<p class="explanation" lang="${lang}">${esc(q.explanation)}</p>` : ''}
      <div class="feedback-actions">
        <button type="button" class="primary" data-action="next">${session.i + 1 < session.items.length ? 'Next' : 'Finish'}</button>
        ${!ok && q.type === 'fill' ? '<button type="button" class="link" data-action="override">I was right — count it</button>' : ''}
        <span class="kbd-hint">Enter ↵</span>
      </div>`;
    fb.querySelector('[data-action="next"]').focus();
  }

  function commitCurrent() {
    if (!session.current) return;
    const q = session.items[session.i];
    record(q, session.current.ok);
    session.results.push({ q, ok: session.current.ok, given: session.current.given });
    session.current = null;
  }

  function next() {
    commitCurrent();
    session.i++;
    if (session.i < session.items.length) renderQuestion();
    else renderSummary();
  }

  function onQuizClick(t) {
    if (t.classList.contains('choice') && !session.current) answer(t.dataset.k);
    else if (t.dataset.action === 'next') next();
    else if (t.dataset.action === 'override' && session.current) {
      session.current.ok = true;
      next();
    } else if (t.dataset.action === 'quit') {
      commitCurrent();
      if (session.results.length) renderSummary();
      else goHome();
    }
  }

  function renderSummary() {
    view = 'summary';
    const { results } = session;
    const right = results.filter(r => r.ok).length;
    const missed = results.filter(r => !r.ok);
    const list = missed.map(({ q, given }) => {
      const lang = SUBJECTS[q.subject].lang;
      const yours = q.type === 'mc' ? q.choices[Number(given)] : given;
      return `<details>
        <summary lang="${lang}">${esc(q.prompt)}</summary>
        <div class="body" lang="${lang}">
          ${q.code ? `<pre class="code">${esc(q.code)}</pre>` : ''}
          <p>Your answer: <code>${esc(yours)}</code></p>
          <p>Correct: <strong>${esc(correctText(q))}</strong></p>
          ${q.explanation ? `<p class="explanation">${esc(q.explanation)}</p>` : ''}
        </div>
      </details>`;
    }).join('');

    app.innerHTML = `<section>
      <div class="panel">
        <div class="score">${right} / ${results.length}</div>
        <p class="score-sub">${pct(right, results.length)}% correct</p>
        <div class="actions">
          ${missed.length ? '<button type="button" class="primary" data-action="retry">Retry missed</button>' : ''}
          <button type="button" class="${missed.length ? 'secondary' : 'primary'}" data-action="again">New session</button>
          <button type="button" class="secondary" data-action="home">Home</button>
        </div>
      </div>
      ${missed.length ? `<div class="panel"><h2>Missed (${missed.length})</h2><div class="missed" style="margin-top:10px">${list}</div></div>` : ''}
    </section>`;
  }

  function onSummaryClick(t) {
    const a = t.dataset.action;
    if (a === 'retry') startSession(shuffle(session.results.filter(r => !r.ok).map(r => r.q)));
    else if (a === 'again') onHomeClick({ dataset: { action: 'start' } });
    else if (a === 'home') goHome();
  }

  function renderStats() {
    view = 'stats';
    session = null;
    enterSubpage();
    const panels = Object.entries(SUBJECTS).map(([key, s]) => {
      const sum = subjectSummary(key);
      const rows = topicsFor(key).map(topic => {
        const qs = bankFor(key).filter(q => q.topic === topic);
        let seen = 0, attempts = 0, correct = 0, mastered = 0;
        if (qs.length) {
          qs.forEach(q => {
            const p = state.progress[q.id];
            if (!p) return;
            seen++; attempts += p.seen; correct += p.correct;
            if (p.box >= MASTERED_BOX) mastered++;
          });
        } else {
          const g = state.genStats[key + '|' + topic];
          if (g) { attempts = g.seen; correct = g.correct; }
        }
        const acc = pct(correct, attempts);
        return `<tr>
          <td lang="${s.lang}">${esc(topic)}</td>
          <td class="num">${qs.length ? `${seen}/${qs.length}` : '—'}</td>
          <td class="num">${attempts}</td>
          <td class="num">${acc === null ? '—' : `${acc}%<span class="meter"><i style="width:${acc}%"></i></span>`}</td>
          <td class="num">${qs.length ? mastered : '—'}</td>
        </tr>`;
      }).join('');
      return `<div class="panel">
        <h3 lang="${s.lang}">${esc(s.name)} <span class="subject-tag">${esc(s.tag)}</span></h3>
        <div class="stat-row">
          <div class="stat"><b>${sum.due}</b><span>due now</span></div>
          <div class="stat"><b>${sum.total - sum.fresh}</b><span>seen of ${sum.total}</span></div>
          <div class="stat"><b>${sum.mastered}</b><span>mastered</span></div>
        </div>
        <div class="table-wrap"><table>
          <thead><tr><th>Topic</th><th class="num">Seen</th><th class="num">Attempts</th><th class="num">Accuracy</th><th class="num">Mastered</th></tr></thead>
          <tbody>${rows}</tbody>
        </table></div>
      </div>`;
    }).join('');

    app.innerHTML = `<section>
      <div class="back-row"><button type="button" class="link" data-action="back">← Back</button></div>
      ${panels}
      <div class="panel">
        <p class="hint" style="margin-top:0">“Mastered” means answered correctly ${MASTERED_BOX} times in a row across spaced reviews. Progress is stored only in this browser.</p>
        <div class="actions"><button type="button" class="secondary danger" data-action="reset">Reset all progress</button></div>
      </div>
    </section>`;
  }

  function onStatsClick(t) {
    if (t.dataset.action === 'back') goHome();
    else if (t.dataset.action === 'reset' && confirm('Erase all quiz progress in this browser?')) {
      state.progress = {};
      state.genStats = {};
      save();
      renderStats();
    }
  }

  // ---------- wiring ----------
  app.addEventListener('click', e => {
    const t = e.target.closest('button');
    if (!t || t.disabled) return;
    if (view === 'home') onHomeClick(t);
    else if (view === 'quiz') onQuizClick(t);
    else if (view === 'summary') onSummaryClick(t);
    else if (view === 'stats') onStatsClick(t);
  });

  document.addEventListener('keydown', e => {
    if (view !== 'quiz' || e.ctrlKey || e.metaKey || e.altKey) return;
    // A focused button already handles Enter/Space itself.
    if (e.target.tagName === 'BUTTON' && (e.key === 'Enter' || e.key === ' ')) return;
    const q = session.items[session.i];
    if (!session.current && q.type === 'mc' && /^[1-9]$/.test(e.key)) {
      const k = session.order[Number(e.key) - 1];
      if (k !== undefined) { e.preventDefault(); answer(String(k)); }
    } else if (session.current && (e.key === 'Enter' || e.key === 'ArrowRight')) {
      e.preventDefault();
      next();
    }
  });

  // Screens other than home get one history entry, so the phone's back button
  // (or back gesture) returns to home instead of closing the installed app.
  let pushed = false;
  let leaving = false;
  function enterSubpage() {
    if (pushed) return;
    history.pushState({ quizDrill: true }, '');
    pushed = true;
  }
  const midSession = () => view === 'quiz' && session && session.results.length > 0;
  function goHome() {
    if (pushed) {
      leaving = true;
      history.back(); // popstate renders home
    } else renderHome();
  }
  window.addEventListener('popstate', () => {
    if (!pushed) return;
    if (!leaving && midSession() && !confirm('Leave this session?')) {
      history.pushState({ quizDrill: true }, '');
      return;
    }
    leaving = false;
    pushed = false;
    renderHome();
  });

  document.getElementById('homeBtn').addEventListener('click', () => {
    if (midSession() && !confirm('Leave this session?')) return;
    goHome();
  });
  document.getElementById('statsBtn').addEventListener('click', () => {
    if (midSession() && !confirm('Leave this session?')) return;
    renderStats();
  });

  renderHome();

  // Offline install support only works over http(s); opening the file from disk skips it.
  if (/^https?:$/.test(location.protocol)) {
    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = 'manifest.json';
    document.head.appendChild(link);
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
