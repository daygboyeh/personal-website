import { createRoot } from 'react-dom/client'
import Cutover from './Cutover'

// The site's handle on the demo. It is a plain function so the vanilla page can mount it
// and drive it from the cutover mission: show the start, play once, or jump to the end.
export function mountCutover(element: HTMLElement, { onPayoff }: { onPayoff: () => void }) {
  const root = createRoot(element)
  let run = 0
  let playing = false
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches
  const render = () => root.render(<Cutover key={run} playing={playing} onPayoff={onPayoff} />)
  render()
  return {
    // A keyed remount is the replay: the click on the mission button explains the reset.
    play() {
      run++; playing = true; render()
      // Under reduced motion the stage shows its finished poster and runs no script.
      if (reduced()) queueMicrotask(onPayoff)
    },
    // The finished state at once, for the site's own motion toggle.
    finish() { run++; playing = true; root.render(<Cutover key={run} playing={false} onPayoff={onPayoff} finished />); onPayoff() },
    unmount() { root.unmount() }
  }
}
