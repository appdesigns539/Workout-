/* Workout Plan Generator — app */
(function () {
  const D = window.WORKOUT_DATA;
  const STORE = 'workout.v1';
  const app = document.getElementById('app');
  const EX = Object.fromEntries(D.EXERCISES.map(e => [e.id, e]));
  const LEVEL_NUM = { beginner: 1, intermediate: 2, advanced: 3 };
  const LENGTH_COUNT = { 30: 4, 45: 5, 60: 6, 75: 7, 90: 8 };

  // ---------- state ----------
  function defaults() {
    return {
      prefs: { goal: 'hypertrophy', level: 'beginner', days: 3, split: 'full', length: 45, equipment: ['dumbbell', 'bench', 'band'], focus: [] },
      plan: null, saved: [], session: null, history: [], units: 'lb', view: 'build', step: 0,
    };
  }
  let state = (() => {
    try {
      const s = JSON.parse(localStorage.getItem(STORE));
      if (s) { const d = defaults(); return { ...d, ...s, prefs: { ...d.prefs, ...(s.prefs || {}) } }; }
    } catch (e) { /* ignore */ }
    return defaults();
  })();
  const save = () => { try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) { /* storage unavailable */ } };

  // ---------- helpers ----------
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = () => Math.random().toString(36).slice(2, 10);
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const fmtDate = t => new Date(t).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const label = (list, id) => (list.find(x => x.id === id) || {}).label || id;

  function toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg; t.hidden = false;
    clearTimeout(toast._t); toast._t = setTimeout(() => { t.hidden = true; }, 1800);
  }

  function hasEquip(ex, equipment) {
    return ex.eq.every(group => group.split('|').some(item => equipment.includes(item)));
  }

  // ---------- generator ----------
  function candidates(slot, prefs, exclude) {
    const lvl = LEVEL_NUM[prefs.level];
    const pool = D.EXERCISES.filter(e => e.p.includes(slot) && hasEquip(e, prefs.equipment) && !exclude.has(e.id));
    const levelOk = pool.filter(e => e.lv <= lvl);
    return levelOk.length ? levelOk : pool;
  }

  const LOAD = { barbell: 3, machine: 2, cable: 2, dumbbell: 2, pullup: 2, kettlebell: 1.5, bench: 0.5, band: 0.5 };
  function loadRank(ex, equipment) {
    return ex.eq.reduce((sum, g) => sum + Math.max(0, ...g.split('|').filter(i => equipment.includes(i)).map(i => LOAD[i] || 0)), 0);
  }

  function pickExercise(slot, prefs, exclude, usage, primary) {
    let list = candidates(slot, prefs, exclude);
    let usedSlot = slot;
    if (!list.length) {
      for (const fb of D.FALLBACK[slot] || []) {
        list = candidates(fb, prefs, exclude);
        if (list.length) { usedSlot = fb; break; }
      }
    }
    if (!list.length) return null;
    // Prefer exercises used less often in this plan; strength goal prefers bigger lifts.
    // Prefer loaded movements over bodyweight ones when equipment is available.
    const loadable = prefs.equipment.some(x => x !== 'cardio');
    const score = e => (usage[e.id] || 0) * 10
      + (loadable && !e.eq.length && e.c ? 3 : 0)
      - (primary && e.c ? Math.min(3, loadRank(e, prefs.equipment)) * 1.2 : 0)
      + Math.random() * 1.5
      - (prefs.goal === 'strength' && e.c ? 1 : 0)
      - (prefs.level === 'advanced' ? e.lv : 0) * 0.5;
    const scored = shuffle(list).map(e => [score(e), e]).sort((a, b) => a[0] - b[0]);
    list = scored.map(x => x[1]);
    const ex = list[0];
    usage[ex.id] = (usage[ex.id] || 0) + 1;
    return { ex, slot: usedSlot };
  }

  function prescribe(ex, prefs, index) {
    const rx = D.RX[prefs.goal];
    // Heavy "main" prescriptions only make sense for loaded compound lifts.
    const kind = ex.unit === 'time' ? 'time' : (ex.c && ex.eq.length && !ex.side && index < 3 ? 'main' : 'acc');
    if (ex.rx) { const [s, r, t] = ex.rx; return { sets: s, reps: r, rest: t }; }
    let [sets, reps, rest] = rx[kind];
    if (prefs.level === 'beginner' && kind === 'main') sets = Math.max(2, sets - 1);
    if (prefs.level === 'advanced' && kind === 'acc') sets = Math.min(4, sets + 1);
    if (ex.side) reps += ' / side';
    return { sets, reps, rest };
  }

  function buildDay(key, prefs, usage, focusUsage) {
    const t = D.DAYS[key];
    const count = LENGTH_COUNT[prefs.length] || 5;
    const focusSlots = [];
    prefs.focus.forEach(fid => {
      const F = D.FOCUS.find(f => f.id === fid);
      if (!F) return;
      if (t.regions.includes('all') || F.regions.some(r => t.regions.includes(r))) {
        const n = focusUsage[fid] = (focusUsage[fid] || 0) + 1;
        focusSlots.push(F.slots[(n - 1) % F.slots.length]);
      }
    });
    const base = t.slots;
    let slots = [...base.slice(0, 2), ...focusSlots, ...base.slice(2)];
    slots = slots.slice(0, Math.min(slots.length, count + (focusSlots.length ? 1 : 0)));

    const exclude = new Set();
    const exercises = [];
    slots.forEach((slot, i) => {
      const pick = pickExercise(slot, prefs, exclude, usage, i < 3);
      if (!pick) return;
      exclude.add(pick.ex.id);
      exercises.push({ uid: uid(), id: pick.ex.id, slot: pick.slot });
    });
    // Top up if equipment limits removed slots
    const extras = ['core', 'glute', 'posture', 'hpush', 'squat', 'hpull'];
    for (const s of extras) {
      if (exercises.length >= Math.min(count, 4)) break;
      const pick = pickExercise(s, prefs, exclude, usage);
      if (pick) { exclude.add(pick.ex.id); exercises.push({ uid: uid(), id: pick.ex.id, slot: pick.slot }); }
    }
    exercises.forEach((e, i) => Object.assign(e, prescribe(EX[e.id], prefs, i)));

    return { key, name: t.name, type: t.type, exercises, warmup: warmup(t.type, prefs, exercises), cooldown: cooldown(t.type, prefs) };
  }

  function warmup(type, prefs) {
    const cardio = prefs.equipment.includes('cardio')
      ? '5 min easy cardio — bike, rower or treadmill'
      : '3–5 min easy cardio — brisk march, jumping jacks or jump rope';
    const list = [cardio, ...D.WARMUP[type]];
    if (type !== 'lower' && prefs.equipment.includes('band')) list.push('Band pull-aparts — 15 reps');
    list.push('2 lighter ramp-up sets of your first exercise (~50% and ~75%)');
    return list;
  }

  function cooldown(type, prefs) {
    const list = [...D.COOLDOWN[type]];
    if (prefs.focus.includes('posture') && type !== 'lower') list.push('Suboccipital stretch — chin tuck and gentle nod, 30 sec × 2');
    list.push('2–3 min easy walking and slow breathing');
    return list;
  }

  function generatePlan(prefs) {
    const split = D.SPLITS[prefs.split];
    const keys = split.build(prefs.days);
    const usage = {}; const focusUsage = {};
    const days = keys.map(k => buildDay(k, prefs, usage, focusUsage));
    return {
      id: uid(), created: Date.now(), name: `${split.name} — ${prefs.days} days`,
      prefs: JSON.parse(JSON.stringify(prefs)), days, schedule: D.SCHEDULES[prefs.days],
    };
  }

  function swapExercise(dayIdx, exUid) {
    const day = state.plan.days[dayIdx];
    const i = day.exercises.findIndex(e => e.uid === exUid);
    if (i < 0) return;
    const cur = day.exercises[i];
    const others = new Set(day.exercises.filter(e => e.uid !== exUid).map(e => e.id));
    const list = candidates(cur.slot, state.plan.prefs, others).sort((a, b) => a.name.localeCompare(b.name));
    if (list.length < 2) { toast('No other options with your equipment'); return; }
    const pos = list.findIndex(e => e.id === cur.id);
    const next = list[(pos + 1) % list.length];
    Object.assign(cur, { id: next.id }, prescribe(next, state.plan.prefs, i));
    save(); render();
  }

  // ---------- wizard ----------
  const STEPS = [
    { key: 'goal', title: "What's your main goal?", sub: 'This sets your sets, reps and rest times.' },
    { key: 'level', title: 'How experienced are you?', sub: 'Beginners get simpler exercises and fewer sets.' },
    { key: 'days', title: 'How many days a week?', sub: 'Pick what you can stick with. Consistency beats volume.' },
    { key: 'split', title: 'Choose a split', sub: 'How your training is divided across the week.' },
    { key: 'length', title: 'How long is each session?', sub: 'Not counting warm-up and cool-down.' },
    { key: 'equipment', title: 'What equipment do you have?', sub: 'Start from a preset, then fine-tune.' },
    { key: 'focus', title: 'Any muscles to prioritize?', sub: 'Optional. Pick up to 3 and they get extra work.' },
    { key: 'review', title: 'Ready to build', sub: 'Check your choices, then generate your plan.' },
  ];

  function splitOptions(days) {
    return Object.entries(D.SPLITS).filter(([, s]) => s.days.includes(days)).map(([id, s]) => ({
      id, label: s.name, desc: s.desc, rec: D.RECOMMENDED_SPLIT[days] === id,
      preview: s.build(days).map(k => D.DAYS[k].name).join(' · '),
    }));
  }

  function optionsFor(key) {
    const p = state.prefs;
    switch (key) {
      case 'goal': return D.GOALS;
      case 'level': return D.LEVELS;
      case 'days': return [2, 3, 4, 5, 6].map(n => ({ id: n, label: `${n} days`, desc: D.SCHEDULES[n].join(' · ') }));
      case 'split': return splitOptions(p.days);
      case 'length': return [30, 45, 60, 75, 90].map(n => ({ id: n, label: `${n} min`, desc: `About ${LENGTH_COUNT[n]} exercises` }));
      default: return [];
    }
  }

  function summaryValue(key) {
    const p = state.prefs;
    switch (key) {
      case 'goal': return label(D.GOALS, p.goal);
      case 'level': return label(D.LEVELS, p.level);
      case 'days': return `${p.days} days / week`;
      case 'split': return D.SPLITS[p.split]?.name || '—';
      case 'length': return `${p.length} min`;
      case 'equipment': return p.equipment.length ? p.equipment.map(id => label(D.EQUIPMENT, id)).join(', ') : 'Bodyweight only';
      case 'focus': return p.focus.length ? p.focus.map(id => label(D.FOCUS, id)).join(', ') : 'Balanced (no focus)';
      default: return '';
    }
  }

  function renderBuild() {
    const step = Math.min(state.step, STEPS.length - 1);
    const S = STEPS[step];
    const p = state.prefs;
    let body = '';

    if (['goal', 'level', 'days', 'split', 'length'].includes(S.key)) {
      body = `<div class="options ${S.key === 'days' || S.key === 'length' ? 'options-compact' : ''}">` + optionsFor(S.key).map(o => `
        <button class="option ${p[S.key] === o.id ? 'selected' : ''}" data-action="pick" data-key="${S.key}" data-val="${esc(o.id)}">
          <span class="option-title">${esc(o.label)}${o.rec ? ' <span class="badge">Recommended</span>' : ''}</span>
          ${o.desc ? `<span class="option-desc">${esc(o.desc)}</span>` : ''}
          ${o.preview ? `<span class="option-preview">${esc(o.preview)}</span>` : ''}
        </button>`).join('') + '</div>';
    } else if (S.key === 'equipment') {
      body = `<div class="presets">${D.EQUIP_PRESETS.map(pr => `<button class="btn btn-ghost" data-action="preset" data-id="${pr.id}">${esc(pr.label)}</button>`).join('')}</div>
        <div class="chips">${D.EQUIPMENT.map(e => `<button class="chip ${p.equipment.includes(e.id) ? 'on' : ''}" data-action="toggle" data-key="equipment" data-val="${e.id}">${esc(e.label)}</button>`).join('')}</div>
        <p class="hint">Bodyweight exercises are always included.</p>`;
    } else if (S.key === 'focus') {
      body = `<div class="chips">${D.FOCUS.map(f => `<button class="chip ${p.focus.includes(f.id) ? 'on' : ''}" data-action="toggle" data-key="focus" data-val="${f.id}">${esc(f.label)}</button>`).join('')}</div>
        <p class="hint">${p.focus.length}/3 selected</p>`;
    } else {
      body = `<dl class="summary">${STEPS.slice(0, -1).map((s, i) => `
        <div class="summary-row"><dt>${esc(s.key === 'length' ? 'Session' : s.key[0].toUpperCase() + s.key.slice(1))}</dt>
        <dd>${esc(summaryValue(s.key))}</dd><button class="link" data-action="goto" data-step="${i}">Edit</button></div>`).join('')}</dl>`;
    }

    const isLast = step === STEPS.length - 1;
    const isMulti = S.key === 'equipment' || S.key === 'focus';
    app.innerHTML = `
      <section class="card wizard">
        <div class="progress"><div class="progress-bar" style="width:${((step + 1) / STEPS.length) * 100}%"></div></div>
        <p class="step-count">Step ${step + 1} of ${STEPS.length}</p>
        <h1>${esc(S.title)}</h1>
        <p class="sub">${esc(S.sub)}</p>
        ${body}
        <div class="wizard-nav">
          <button class="btn btn-ghost" data-action="back" ${step === 0 ? 'disabled' : ''}>Back</button>
          ${isLast ? '<button class="btn btn-primary" data-action="generate">Generate plan</button>'
            : `<button class="btn ${isMulti ? 'btn-primary' : 'btn-ghost'}" data-action="next">${S.key === 'focus' && !p.focus.length ? 'Skip' : 'Next'}</button>`}
        </div>
      </section>`;
  }

  // ---------- plan ----------
  function renderPlan() {
    const plan = state.plan;
    if (!plan) {
      app.innerHTML = `<section class="card empty"><h1>No plan yet</h1><p class="sub">Answer a few quick questions and get a full week of workouts.</p>
        <button class="btn btn-primary" data-action="view" data-view="build">Build a plan</button>${savedList()}</section>`;
      return;
    }
    const p = plan.prefs;
    const week = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => {
      const i = plan.schedule.indexOf(d);
      return `<div class="week-day ${i >= 0 ? 'train' : ''}"><span>${d}</span><strong>${i >= 0 ? esc(plan.days[i].name) : 'Rest'}</strong></div>`;
    }).join('');

    app.innerHTML = `
      <section class="plan-head">
        <input class="plan-name" data-action="rename" value="${esc(plan.name)}" aria-label="Plan name">
        <div class="pills">
          <span class="pill">${esc(label(D.GOALS, p.goal))}</span><span class="pill">${esc(label(D.LEVELS, p.level))}</span>
          <span class="pill">${p.days} days</span><span class="pill">${p.length} min</span>
          ${p.focus.map(f => `<span class="pill pill-accent">${esc(label(D.FOCUS, f))}</span>`).join('')}
        </div>
        <div class="actions no-print">
          <button class="btn btn-ghost" data-action="regenerate">Regenerate</button>
          <button class="btn btn-ghost" data-action="saveplan">Save copy</button>
          <button class="btn btn-ghost" data-action="print">Print</button>
          <button class="btn btn-ghost" data-action="editprefs">Edit options</button>
        </div>
      </section>
      <div class="week">${week}</div>
      <p class="tip"><strong>Progression:</strong> ${esc(D.TIPS[p.goal])}</p>
      ${plan.days.map((d, di) => `
        <section class="card day">
          <header class="day-head">
            <div><p class="eyebrow">Day ${di + 1} · ${plan.schedule[di]}</p><h2>${esc(d.name)}</h2></div>
            <button class="btn btn-primary btn-sm no-print" data-action="start" data-day="${di}">Start workout</button>
          </header>
          <details class="block"><summary>Warm-up <span class="muted">· ~8 min</span></summary><ul>${d.warmup.map(w => `<li>${esc(w)}</li>`).join('')}</ul></details>
          <ol class="ex-list">${d.exercises.map(e => {
            const ex = EX[e.id];
            return `<li class="ex">
              <div class="ex-main"><span class="ex-name">${esc(ex.name)}</span><span class="ex-cue">${esc(ex.cue)}</span></div>
              <div class="ex-rx"><span class="rx">${e.sets} × ${esc(e.reps)}</span><span class="rest">Rest ${esc(e.rest)}</span></div>
              <div class="ex-tools no-print">
                <button class="icon" title="Swap exercise" aria-label="Swap ${esc(ex.name)}" data-action="swap" data-day="${di}" data-uid="${e.uid}">⇄</button>
                <button class="icon" title="Remove" aria-label="Remove ${esc(ex.name)}" data-action="remove" data-day="${di}" data-uid="${e.uid}">×</button>
              </div></li>`;
          }).join('')}</ol>
          <details class="block"><summary>Cool-down <span class="muted">· ~5 min</span></summary><ul>${d.cooldown.map(w => `<li>${esc(w)}</li>`).join('')}</ul></details>
        </section>`).join('')}
      <div class="no-print">${savedList()}</div>`;
  }

  function savedList() {
    if (!state.saved.length) return '';
    return `<section class="card saved"><h3>Saved plans</h3><ul class="saved-list">${state.saved.map(s => `
      <li><div><strong>${esc(s.name)}</strong><span class="muted"> · saved ${esc(fmtDate(s.savedAt))}</span></div>
      <div class="row-actions"><button class="btn btn-ghost btn-sm" data-action="loadplan" data-id="${s.id}">Load</button>
      <button class="btn btn-ghost btn-sm danger" data-action="delplan" data-id="${s.id}">Delete</button></div></li>`).join('')}</ul></section>`;
  }

  // ---------- log ----------
  function lastFor(exId) {
    for (const h of state.history) {
      const e = h.exercises.find(x => x.id === exId);
      if (e) {
        const done = e.sets.filter(s => s.w !== '' || s.r !== '');
        if (done.length) return done.map(s => `${s.w || '–'}×${s.r || '–'}`).join(', ');
      }
    }
    return '';
  }

  function startSession(di) {
    const d = state.plan.days[di];
    state.session = {
      id: uid(), started: Date.now(), dayName: d.name, planName: state.plan.name, notes: '',
      exercises: d.exercises.map(e => ({
        id: e.id, name: EX[e.id].name, target: `${e.sets} × ${e.reps}`, time: EX[e.id].unit === 'time',
        sets: Array.from({ length: e.sets }, () => ({ w: '', r: '', done: false })),
      })),
    };
    state.view = 'log'; save(); render(); window.scrollTo(0, 0);
  }

  function renderLog() {
    const s = state.session;
    if (!s) {
      const plan = state.plan;
      app.innerHTML = `<section class="card empty"><h1>Log a workout</h1>
        ${plan ? `<p class="sub">Pick a day from your plan to start logging.</p><div class="options options-compact">${plan.days.map((d, i) => `
          <button class="option" data-action="start" data-day="${i}"><span class="option-title">${esc(d.name)}</span><span class="option-desc">Day ${i + 1} · ${d.exercises.length} exercises</span></button>`).join('')}</div>`
        : `<p class="sub">Build a plan first, then log your sessions here.</p><button class="btn btn-primary" data-action="view" data-view="build">Build a plan</button>`}
      </section>`;
      return;
    }
    const u = state.units;
    app.innerHTML = `
      <section class="log-head">
        <div><p class="eyebrow">${esc(fmtDate(s.started))}</p><h1>${esc(s.dayName)}</h1></div>
        <div class="seg" role="group" aria-label="Units">
          <button class="${u === 'lb' ? 'on' : ''}" data-action="units" data-val="lb">lb</button>
          <button class="${u === 'kg' ? 'on' : ''}" data-action="units" data-val="kg">kg</button>
        </div>
      </section>
      ${s.exercises.map((e, ei) => {
        const last = lastFor(e.id);
        return `<section class="card log-ex">
          <header class="log-ex-head"><h3>${esc(e.name)}</h3><span class="muted">Target ${esc(e.target)}</span></header>
          ${last ? `<p class="last">Last time: ${esc(last)}</p>` : ''}
          <div class="sets">
            <div class="set set-head"><span>Set</span><span>${u}</span><span>${e.time ? 'sec' : 'reps'}</span><span></span></div>
            ${e.sets.map((st, si) => `<div class="set ${st.done ? 'done' : ''}">
              <span class="set-n">${si + 1}</span>
              <input inputmode="decimal" placeholder="—" value="${esc(st.w)}" data-action="setval" data-ex="${ei}" data-set="${si}" data-f="w" aria-label="Set ${si + 1} weight">
              <input inputmode="numeric" placeholder="—" value="${esc(st.r)}" data-action="setval" data-ex="${ei}" data-set="${si}" data-f="r" aria-label="Set ${si + 1} ${e.time ? 'seconds' : 'reps'}">
              <button class="check ${st.done ? 'on' : ''}" data-action="done" data-ex="${ei}" data-set="${si}" aria-label="Mark set ${si + 1} done">✓</button>
            </div>`).join('')}
          </div>
          <div class="set-tools"><button class="link" data-action="addset" data-ex="${ei}">+ Add set</button>
          ${e.sets.length > 1 ? `<button class="link muted" data-action="delset" data-ex="${ei}">Remove last set</button>` : ''}</div>
        </section>`;
      }).join('')}
      <section class="card"><label class="field-label" for="notes">Notes</label>
        <textarea id="notes" rows="3" placeholder="How did it feel? Anything to change next time?" data-action="notes">${esc(s.notes)}</textarea></section>
      <div class="actions end">
        <button class="btn btn-ghost danger" data-action="discard">Discard</button>
        <button class="btn btn-primary" data-action="finish">Finish &amp; save</button>
      </div>`;
  }

  // ---------- history ----------
  function volume(h) {
    return h.exercises.reduce((sum, e) => e.time ? sum : sum + e.sets.reduce((a, s) => a + (parseFloat(s.w) || 0) * (parseFloat(s.r) || 0), 0), 0);
  }

  function renderHistory() {
    const h = state.history;
    const weekAgo = Date.now() - 7 * 864e5;
    const thisWeek = h.filter(x => x.started >= weekAgo).length;
    app.innerHTML = `
      <section class="stats">
        <div class="stat"><strong>${h.length}</strong><span>Workouts logged</span></div>
        <div class="stat"><strong>${thisWeek}</strong><span>Last 7 days</span></div>
        <div class="stat"><strong>${h[0] ? esc(new Date(h[0].started).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })) : '—'}</strong><span>Last workout</span></div>
      </section>
      ${h.length ? h.map(x => `
        <details class="card hist">
          <summary><div><strong>${esc(x.dayName)}</strong><span class="muted"> · ${esc(fmtDate(x.started))}</span></div>
          <span class="muted">${Math.round(volume(x)).toLocaleString()} ${esc(x.units || state.units)} volume</span></summary>
          <ul class="hist-list">${x.exercises.map(e => {
            const sets = e.sets.filter(s => s.w !== '' || s.r !== '');
            return `<li><span>${esc(e.name)}</span><span class="muted">${sets.length ? esc(sets.map(s => `${s.w || '–'}×${s.r || '–'}`).join(', ')) : 'skipped'}</span></li>`;
          }).join('')}</ul>
          ${x.notes ? `<p class="hist-notes">${esc(x.notes)}</p>` : ''}
          <button class="btn btn-ghost btn-sm danger" data-action="delhist" data-id="${x.id}">Delete</button>
        </details>`).join('')
      : `<section class="card empty"><p class="sub">Finished workouts show up here.</p></section>`}
      <section class="backup">
        <button class="btn btn-ghost btn-sm" data-action="export">Export data</button>
        <label class="btn btn-ghost btn-sm">Import data<input type="file" accept="application/json" data-action="import" hidden></label>
      </section>`;
  }

  // ---------- render ----------
  function render() {
    document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('active', b.dataset.view === state.view));
    const logTab = document.querySelector('#tabs [data-view="log"]');
    logTab.classList.toggle('live', !!state.session);
    ({ build: renderBuild, plan: renderPlan, log: renderLog, history: renderHistory }[state.view] || renderBuild)();
  }

  // Two-tap confirm for destructive buttons
  function confirmTap(btn) {
    if (btn.dataset.armed) return true;
    btn.dataset.armed = '1'; const t = btn.textContent; btn.textContent = 'Tap again to confirm';
    setTimeout(() => { if (btn.isConnected) { delete btn.dataset.armed; btn.textContent = t; } }, 2500);
    return false;
  }

  document.getElementById('tabs').addEventListener('click', e => {
    const b = e.target.closest('button[data-view]');
    if (!b) return;
    state.view = b.dataset.view; save(); render(); window.scrollTo(0, 0);
  });

  app.addEventListener('click', e => {
    const b = e.target.closest('[data-action]');
    if (!b || b.tagName === 'INPUT' || b.tagName === 'TEXTAREA') return;
    const a = b.dataset.action; const p = state.prefs;
    switch (a) {
      case 'pick': {
        const k = b.dataset.key; const raw = b.dataset.val;
        p[k] = ['days', 'length'].includes(k) ? Number(raw) : raw;
        if (k === 'days') p.split = D.RECOMMENDED_SPLIT[p.days];
        save(); render();
        setTimeout(() => { state.step = Math.min(state.step + 1, STEPS.length - 1); save(); render(); }, 160);
        break;
      }
      case 'toggle': {
        const k = b.dataset.key; const v = b.dataset.val; const list = p[k];
        if (list.includes(v)) p[k] = list.filter(x => x !== v);
        else if (k === 'focus' && list.length >= 3) { toast('Pick up to 3'); return; }
        else p[k] = [...list, v];
        save(); render(); break;
      }
      case 'preset': p.equipment = [...D.EQUIP_PRESETS.find(x => x.id === b.dataset.id).items]; save(); render(); break;
      case 'next': state.step = Math.min(state.step + 1, STEPS.length - 1); save(); render(); break;
      case 'back': state.step = Math.max(0, state.step - 1); save(); render(); break;
      case 'goto': state.step = Number(b.dataset.step); save(); render(); break;
      case 'generate':
        state.plan = generatePlan(p); state.view = 'plan'; save(); render(); window.scrollTo(0, 0); toast('Plan ready'); break;
      case 'regenerate':
        state.plan = { ...generatePlan(state.plan.prefs), name: state.plan.name }; save(); render(); toast('New exercises picked'); break;
      case 'editprefs': state.prefs = JSON.parse(JSON.stringify(state.plan.prefs)); state.step = STEPS.length - 1; state.view = 'build'; save(); render(); break;
      case 'saveplan':
        state.saved.unshift({ ...JSON.parse(JSON.stringify(state.plan)), id: uid(), savedAt: Date.now() }); save(); render(); toast('Plan saved'); break;
      case 'loadplan': state.plan = JSON.parse(JSON.stringify(state.saved.find(s => s.id === b.dataset.id))); state.view = 'plan'; save(); render(); toast('Plan loaded'); break;
      case 'delplan': if (!confirmTap(b)) return; state.saved = state.saved.filter(s => s.id !== b.dataset.id); save(); render(); break;
      case 'print': window.print(); break;
      case 'swap': swapExercise(Number(b.dataset.day), b.dataset.uid); break;
      case 'remove': {
        const d = state.plan.days[Number(b.dataset.day)];
        if (d.exercises.length <= 1) { toast('Keep at least one exercise'); return; }
        d.exercises = d.exercises.filter(x => x.uid !== b.dataset.uid); save(); render(); break;
      }
      case 'start':
        if (state.session && !confirmTap(b)) { toast('This replaces the workout in progress'); return; }
        startSession(Number(b.dataset.day)); break;
      case 'view': state.view = b.dataset.view; save(); render(); break;
      case 'units': state.units = b.dataset.val; save(); render(); break;
      case 'done': { const st = state.session.exercises[b.dataset.ex].sets[b.dataset.set]; st.done = !st.done; save(); render(); break; }
      case 'addset': { const sets = state.session.exercises[b.dataset.ex].sets; const l = sets[sets.length - 1] || {}; sets.push({ w: l.w || '', r: '', done: false }); save(); render(); break; }
      case 'delset': state.session.exercises[b.dataset.ex].sets.pop(); save(); render(); break;
      case 'discard': if (!confirmTap(b)) return; state.session = null; save(); render(); break;
      case 'finish':
        state.history.unshift({ ...state.session, finished: Date.now(), units: state.units });
        state.session = null; state.view = 'history'; save(); render(); window.scrollTo(0, 0); toast('Workout saved'); break;
      case 'delhist': if (!confirmTap(b)) return; state.history = state.history.filter(h => h.id !== b.dataset.id); save(); render(); break;
      case 'export': {
        const blob = new Blob([JSON.stringify({ saved: state.saved, plan: state.plan, history: state.history, units: state.units }, null, 2)], { type: 'application/json' });
        const link = document.createElement('a'); link.href = URL.createObjectURL(blob);
        link.download = `workout-data-${new Date().toISOString().slice(0, 10)}.json`; link.click();
        setTimeout(() => URL.revokeObjectURL(link.href), 1000); break;
      }
    }
  });

  app.addEventListener('input', e => {
    const t = e.target; const a = t.dataset.action;
    if (a === 'setval') { state.session.exercises[t.dataset.ex].sets[t.dataset.set][t.dataset.f] = t.value; save(); }
    else if (a === 'notes') { state.session.notes = t.value; save(); }
    else if (a === 'rename') { state.plan.name = t.value; save(); }
  });

  app.addEventListener('change', e => {
    const t = e.target;
    if (t.dataset.action !== 'import' || !t.files[0]) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const d = JSON.parse(r.result);
        if (Array.isArray(d.history)) state.history = d.history;
        if (Array.isArray(d.saved)) state.saved = d.saved;
        if (d.plan) state.plan = d.plan;
        if (d.units) state.units = d.units;
        save(); render(); toast('Data imported');
      } catch (err) { toast('That file could not be read'); }
    };
    r.readAsText(t.files[0]);
  });

  window.WorkoutGenerator = { generatePlan }; // handy for testing in the console

  window.addEventListener('beforeprint', () => document.querySelectorAll('details.block').forEach(d => { d.open = true; }));

  render();
})();
