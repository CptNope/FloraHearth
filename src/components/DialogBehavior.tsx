import React, { useEffect, useRef } from 'react';

/**
 * Accessible modal behaviour for an existing overlay element.
 *
 * Render it as the first child of a modal's full-screen overlay:
 *
 *   <div className="fixed inset-0 ...">
 *     <DialogBehavior onClose={close} />
 *     ...dialog content...
 *   </div>
 *
 * It gives the overlay role="dialog" + aria-modal and names it from its first
 * heading, moves focus inside on open, keeps Tab / Shift+Tab inside, closes on
 * Escape, stops the page behind from scrolling, and returns focus to whatever
 * opened the dialog when it closes (WCAG 2.1.2, 2.4.3, 4.1.2).
 */

const FOCUSABLE =
  'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), iframe, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

// Nested dialogs: only the most recently opened one responds to keys.
const openStack: HTMLElement[] = [];
let scrollLocks = 0;
let headingSeq = 0;

function focusables(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(el => {
    if (el.hasAttribute('inert') || el.closest('[inert]')) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 || r.height > 0 || el === document.activeElement;
  });
}

export const DialogBehavior: React.FC<{ onClose: () => void; label?: string }> = ({ onClose, label }) => {
  const marker = useRef<HTMLSpanElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const dialog = marker.current?.parentElement;
    if (!dialog) return;
    const opener = document.activeElement as HTMLElement | null;

    // Semantics
    if (!dialog.getAttribute('role')) dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    if (label) {
      dialog.setAttribute('aria-label', label);
    } else if (!dialog.getAttribute('aria-labelledby') && !dialog.getAttribute('aria-label')) {
      const heading = dialog.querySelector<HTMLElement>('h1, h2, h3, h4');
      if (heading) {
        if (!heading.id) heading.id = `dialog-title-${++headingSeq}`;
        dialog.setAttribute('aria-labelledby', heading.id);
      }
    }
    if (!dialog.hasAttribute('tabindex')) dialog.setAttribute('tabindex', '-1');

    // Initial focus: the first form field, else the first control, else the dialog
    const items = focusables(dialog);
    const firstField = items.find(el => /^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName));
    (firstField || items[0] || dialog).focus({ preventScroll: true });

    openStack.push(dialog);
    if (scrollLocks++ === 0) document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (openStack[openStack.length - 1] !== dialog) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        closeRef.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const list = focusables(dialog);
      if (list.length === 0) {
        e.preventDefault();
        dialog.focus();
        return;
      }
      const first = list[0];
      const last = list[list.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (!active || !dialog.contains(active)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      } else if (e.shiftKey && (active === first || active === dialog)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    // Capture phase so this runs before the components' own window Escape handlers
    document.addEventListener('keydown', onKey, true);

    return () => {
      document.removeEventListener('keydown', onKey, true);
      const i = openStack.lastIndexOf(dialog);
      if (i !== -1) openStack.splice(i, 1);
      if (--scrollLocks === 0) document.body.style.overflow = '';
      if (opener && opener.isConnected && typeof opener.focus === 'function') {
        // after React finishes removing the dialog
        requestAnimationFrame(() => opener.focus({ preventScroll: true }));
      }
    };
  }, [label]);

  return <span ref={marker} hidden />;
};
