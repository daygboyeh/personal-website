// The on-call game: one framework every interaction plugs into. It owns the mission
// registry, shift state, an event bus and the single live region. Missions never touch
// each other; they register here, listen here, and report completion here.
const STORAGE_KEY = 'ade-shift-v1';
const BUDGET_PER_RESTART = 0.5; // percentage points of error budget per crashed pod

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { return {}; } // storage blocked or corrupt: start a fresh shift
}

export function createEngine() {
  const bus = new EventTarget();
  const missions = new Map();
  const saved = load();
  const state = { completed: new Set(saved.completed || []), restarts: saved.restarts || 0 };
  const status = document.getElementById('game-status');

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ completed: [...state.completed], restarts: state.restarts })); }
    catch { /* keep this shift in memory only */ }
  }
  function emit(type, detail) { bus.dispatchEvent(new CustomEvent(type, { detail })); }

  const engine = {
    // Set once the 3D scene is running; missions treat it as an optional mirror.
    scene: null,
    on(type, listener) { bus.addEventListener(type, event => listener(event.detail)); },
    emit,
    announce(message) { status.textContent = ''; requestAnimationFrame(() => { status.textContent = message; }); },
    register(mission) { missions.set(mission.id, mission); emit('missions', engine.list()); },
    list() { return [...missions.values()].map(mission => ({ ...mission, done: state.completed.has(mission.id) })); },
    isComplete(id) { return state.completed.has(id); },
    complete(id) {
      if (!missions.has(id) || state.completed.has(id)) return;
      state.completed.add(id);
      save();
      const done = engine.list().filter(mission => mission.done).length;
      engine.announce(`Mission complete: ${missions.get(id).title}. ${done} of ${missions.size} done.`);
      emit('complete', { id, done, total: missions.size });
      emit('missions', engine.list());
    },
    recordRestart() { state.restarts++; save(); emit('stats', engine.stats()); },
    stats() {
      const list = engine.list();
      return {
        done: list.filter(mission => mission.done).length,
        total: list.length,
        restarts: state.restarts,
        budget: Math.max(0, 100 - state.restarts * BUDGET_PER_RESTART)
      };
    },
    reset() {
      state.completed.clear(); state.restarts = 0;
      save();
      engine.announce('Shift reset. Every mission is open again.');
      emit('reset');
      emit('missions', engine.list());
      emit('stats', engine.stats());
    }
  };
  return engine;
}
