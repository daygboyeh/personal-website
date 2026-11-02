import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Stage } from './kit/stage'
import { Window, Bar } from './kit/window'
import { Badge } from './kit/controls/Badge'
import { Count } from './kit/motion/Count'
import { Spinner } from './kit/parts/Spinner'
import { Toast } from './kit/parts/Toast'
import type { Act } from './kit/act'
import './cutover.css'

// The migration case study's dashboard, after the gold `dark-hero`. What the system
// does, so no cursor: ten environments move from on-premises to cloud in five waves over
// a Friday-to-Monday clock, the counts roll, and the cutover ends Live with "No issues
// on day one". Illustrative: the waves and times are invented; 10 environments, 19 core
// + 24 microservices and the clean day one are from the CV.
//
// Real strings: the title, the phase, the clock, the environment count, the services
// line and the payoff. Tile names and the sidebar are placeholder.
//
// Rehearsal fixes: the count is always two digits ("02/10"), so Count never has to pop
// a new column in; the phase and the clock crossfade words stacked in one cell (the
// dark-hero technique) instead of swapping boxes.

export type CutoverState = { wave: number; syncing: boolean; done: boolean }

export const START: CutoverState = { wave: 0, syncing: false, done: false }
export const FINISHED: CutoverState = { wave: 6, syncing: false, done: true }

const CLOCK = ['Fri 18:00', 'Fri 21:00', 'Sat 09:00', 'Sat 16:00', 'Sat 23:00', 'Sun 11:00', 'Mon 09:00']
const PHASES = ['Change freeze', 'Migrating', 'Live']
const TILE_NAMES = [34, 40, 28, 38, 32, 42, 30, 36, 40, 26]

const moved = (s: CutoverState) => Math.min(10, Math.min(s.wave, 5) * 2 - (s.syncing ? 2 : 0))
const phase = (s: CutoverState) => (s.done ? 'live' : s.wave === 0 ? 'freeze' : 'migrating')

export default function Cutover({ playing, onPayoff, finished = false }: { playing: boolean; onPayoff: () => void; finished?: boolean }) {
  const payoff = useRef(onPayoff)
  payoff.current = onPayoff
  const script = useMemo(() => (playing ? async (a: Act<CutoverState>) => {
    await a.wait(700)
    for (let wave = 1; wave <= 5; wave++) {
      a.mark(`wave-${wave}`)
      a.put({ wave, syncing: true })
      await a.wait(950)
      a.put({ syncing: false })
      await a.wait(500)
    }
    a.mark('live')
    a.put({ wave: 6, done: true })
    payoff.current()
    await a.wait(2400)
  } : undefined), [playing])

  return (
    <Stage<CutoverState>
      width={760}
      height={430}
      compact={{ below: 600, width: 358, height: 340 }}
      theme="dark"
      fill
      initial={finished ? FINISHED : START}
      poster={playing || finished ? FINISHED : START}
      script={script}
      play="once"
      tokens={{ '--ss-font': "'Inter Tight', system-ui, -apple-system, sans-serif", '--ss-accent': '#2fc78a' }}
      className="cutover"
    >
      {(s, _rect, layout) => (
        <Window className="co-win" sidebarWidth={156} sidebar={layout === 'compact' ? undefined : <Side />}>
          <div className="co-body">
            <div className="co-head">
              <div className="co-title">Cutover</div>
              <Badge tone={phase(s) === 'live' ? 'success' : phase(s) === 'migrating' ? 'warning' : 'neutral'} className="co-phase" icon={<PhaseMark phase={phase(s)} />}>
                <Label words={PHASES} on={phase(s) === 'live' ? 2 : phase(s) === 'migrating' ? 1 : 0} />
              </Badge>
              <span className="co-clock"><span className="co-stack">{CLOCK.map((time, index) => <span key={time} data-on={index === Math.min(s.wave, 6) || undefined}>{time}</span>)}</span></span>
            </div>
            <div className="co-stats">
              <div className="co-stat co-stat--lead">
                <span className="co-big"><Count value={moved(s)} format={n => String(Math.round(n)).padStart(2, '0')} /><span className="co-of">/10</span></span>
                <span className="co-label">environments on cloud</span>
              </div>
              <div className="co-stat">
                <span className="co-mid">19 core · 24 micro</span>
                <span className="co-label">services in scope</span>
              </div>
            </div>
            <div className="co-grid">
              {TILE_NAMES.map((w, index) => {
                const wave = Math.floor(index / 2) + 1
                const state = s.wave > wave || (s.wave === wave && !s.syncing) ? 'cloud' : s.wave === wave ? 'syncing' : 'onprem'
                return (
                  <div key={index} className="co-tile" data-state={state}>
                    <TileMark state={state} />
                    <span className="co-tile__lines">
                      <Bar w={w} h={7} r={3.5} tone={state === 'cloud' ? 4 : 2} />
                      <Bar w={28} h={6} r={3} tone={1} />
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="co-toast-slot">
              <Toast show={s.done} icon={<span className="co-tick" aria-hidden="true" />}>Monday 09:00 · No issues on day one</Toast>
            </div>
          </div>
        </Window>
      )}
    </Stage>
  )
}

// The phase word, after dark-hero's Label: the pill keeps its left edge and only its
// right edge moves, the cell easing to the width of the word that is showing. Getting
// shorter, the old word fades before the edge reaches it, so no letter is ever cut.
function Label({ words, on }: { words: string[]; on: number }) {
  const spans = useRef<HTMLSpanElement[]>([])
  const [widths, setWidths] = useState<number[]>([])
  const last = useRef(on)
  // Measure again once the web font is in: fallback glyphs are wider, and a stale width
  // leaves the pill lopsided.
  useLayoutEffect(() => {
    const measure = () => setWidths(spans.current.map(span => span.offsetWidth))
    measure()
    document.fonts?.ready.then(measure)
  }, [])
  const shrink = widths.length > 0 && widths[on]! < widths[last.current]!
  last.current = on
  return (
    <span className="co-label-cell" data-shrink={shrink || undefined} style={widths.length ? { width: widths[on] } : undefined}>
      {words.map((word, index) => (
        <span key={word} ref={span => { if (span) spans.current[index] = span }} className="co-word" data-on={index === on || undefined}>{word}</span>
      ))}
    </span>
  )
}

// Spinner and dot share one cell and crossfade, so nothing beside them moves.
function PhaseMark({ phase }: { phase: string }) {
  return (
    <span className="co-mark" data-phase={phase}>
      <Spinner size={8} />
      <i className="co-dot" />
    </span>
  )
}

function TileMark({ state }: { state: string }) {
  return (
    <span className="co-tile__mark" data-state={state}>
      <Spinner size={10} />
      <i className="co-dot" />
    </span>
  )
}

function Side() {
  return (
    <nav className="co-side">
      {[60, 84, 50, 72, 58].map((w, index) => (
        <span key={index} className="co-nav" data-active={index === 2 || undefined}>
          <Bar w={12} h={12} r={3} tone={index === 2 ? 4 : 2} />
          <Bar w={w} h={6} tone={index === 2 ? 4 : 2} />
        </span>
      ))}
    </nav>
  )
}
