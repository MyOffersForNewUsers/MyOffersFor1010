/**
 * On-screen keyboard handling for full-screen layouts (app, dialogs, sign-in).
 *
 * Android Chrome shrinks the layout when the keyboard opens (interactive-widget in the
 * viewport meta tag), so 100dvh already fits. iOS Safari does not: it only shrinks the
 * *visual* viewport and pans the page, which pushes the conversation header off screen
 * and can leave the message box under the keyboard. While that is the case this module
 * publishes the visible height and offset as CSS variables and sets `kb-open` on <html>;
 * responsive.css then pins the full-screen layers to the visible area.
 *
 * Layout only: it reads nothing from the page and stores nothing.
 */
const root = document.documentElement;
const vv = window.visualViewport;
// Smaller differences are browser toolbars appearing/disappearing, not a keyboard.
const KEYBOARD_MIN_PX = 120;

const isEditable = (el) => !!el && (el.tagName === 'TEXTAREA'
  || (el.tagName === 'INPUT' && !['checkbox', 'radio', 'button', 'submit'].includes(el.type))
  || el.isContentEditable);

let frame = 0;

function update() {
  frame = 0;
  const open = isEditable(document.activeElement) && window.innerHeight - vv.height > KEYBOARD_MIN_PX;
  if (open) {
    root.style.setProperty('--vv-height', `${Math.round(vv.height)}px`);
    root.style.setProperty('--vv-top', `${Math.round(vv.offsetTop)}px`);
  }
  root.classList.toggle('kb-open', open);
}

const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };

export function initViewport() {
  if (!vv) return;
  vv.addEventListener('resize', schedule);
  vv.addEventListener('scroll', schedule);
  document.addEventListener('focusin', schedule);
  document.addEventListener('focusout', () => setTimeout(schedule, 50));
  schedule();
}
