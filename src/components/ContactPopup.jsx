import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { CloseIcon } from "./Icons.jsx";
import LiquidGlass from "./LiquidGlass.jsx";
import { CONTACT_ENDPOINT, identity } from "../data/site.js";

/**
 * Contact dialog — the "send me a message" popup.
 *
 * Triggered by any element carrying `data-open-contact`: the rail's
 * message icon (this island's document-level listener) and the footer's
 * (static HTML that must stay unhydrated — one delegated listener serves
 * both, so the footer costs no JavaScript at all).
 *
 * The panel is LiquidGlass with the `.glass-dialog` opt-in from
 * global.css, which is what lets the material show at *every* width —
 * the mobile gate owns the pills and taskbar, this shell owns itself.
 *
 * While open, `body` overflow is frozen — exactly the contract
 * PreviewOverlay keeps: the page behind cannot move, and the desktop
 * pager's wheel/touch/key handlers all bail out on `frozen()`, so the
 * glide never fires under a dialog.
 *
 * Delivery: Apps Script's redirect chain carries no CORS headers, so a
 * readable response can't be asked for — the POST runs `no-cors` and
 * stays a *simple* request (URL-encoded body, no preflight to fail).
 * What can still reject is the network itself never taking it, which is
 * the only failure worth showing the visitor. Until CONTACT_ENDPOINT is
 * configured the dialog says so instead of pretending to send.
 */
export default function ContactPopup() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error | unconfigured
  const openerRef = useRef(null);
  const panelRef = useRef(null);

  const close = useCallback(() => setOpen(false), []);

  // One listener, every trigger. The opener is remembered so focus can
  // be handed back on close — a keyboard visitor lands where they were.
  useEffect(() => {
    const onTrigger = (event) => {
      const trigger = event.target.closest?.("[data-open-contact]");
      if (!trigger) return;
      event.preventDefault();
      openerRef.current = trigger;
      setStatus("idle");
      setOpen(true);
    };
    document.addEventListener("click", onTrigger);
    return () => document.removeEventListener("click", onTrigger);
  }, []);

  // The dialog's own lifecycle: freeze the page, take focus, and give
  // both back on close. Escape closes; Tab cycles inside the panel
  // instead of wandering into the frozen page behind it.
  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      panelRef.current?.querySelector("input")?.focus();
    }, 60);

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = panelRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), input:not([type="hidden"]), textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      openerRef.current?.focus?.();
    };
  }, [open, close]);

  const onSubmit = async (event) => {
    event.preventDefault();
    if (status === "sending") return;

    const form = event.currentTarget;
    const data = new FormData(form);

    // Honeypot: no human ever sees this field. Filled → fake success,
    // nothing leaves the browser, and the bot believes it won.
    if (String(data.get("company") || "").trim() !== "") {
      setStatus("sent");
      form.reset();
      return;
    }

    if (!CONTACT_ENDPOINT) {
      setStatus("unconfigured");
      return;
    }
    data.delete("company");

    setStatus("sending");
    try {
      await fetch(CONTACT_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        body: new URLSearchParams(data),
        signal: AbortSignal.timeout
          ? AbortSignal.timeout(15000)
          : undefined,
      });
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  };

  if (!open) return null;

  const feedback = {
    error: "Couldn't send — check your connection and try again.",
    unconfigured: "This form isn't connected yet — reach me on LinkedIn or X.",
  }[status];

  return createPortal(
    <div
      className="animate-overlay fixed inset-0 z-50 flex items-center justify-center bg-[#0f0d0a]/55 p-4 backdrop-blur-[3px] sm:p-6"
      onMouseDown={(event) => {
        // Only a press that *starts* on the backdrop dismisses — a
        // drag out of the form never closes the dialog by accident.
        if (event.target === event.currentTarget) close();
      }}
    >
      <LiquidGlass
        as="div"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-title"
        className="glass-dialog animate-dialog w-full max-w-[27rem] rounded-3xl p-6 sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="type-eyebrow text-amber">Contact</p>
            <h2
              id="contact-title"
              className="mt-1.5 text-[1.375rem] font-bold leading-tight tracking-tight text-ink"
            >
              Send me a message
            </h2>
            <p className="mt-1 text-[13px] leading-snug text-muted">
              Straight to {identity.name}.
            </p>
          </div>

          <button
            type="button"
            onClick={close}
            aria-label="Close"
            title="Close"
            className="-mr-1.5 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-soft transition-colors duration-200 hover:bg-ink hover:text-paper"
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Scroll only if a short viewport needs it — the glass layers
            live on the shell, so scrolling this inner wrapper leaves
            the refraction nailed to the panel. */}
        <div className="mt-5 max-h-[70dvh] overflow-y-auto overscroll-contain">
          {status === "sent" ? (
            <div
              role="status"
              className="rounded-2xl border border-amber/50 bg-amber/15 px-5 py-6 text-center"
            >
              <p className="text-[15px] font-bold text-ink">Message sent</p>
              <p className="mt-1.5 text-[13.5px] leading-snug text-muted">
                Thanks — I'll read it and get back to you.
              </p>
              <div className="mt-4 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="rounded-full border border-ink/15 px-4 py-2 text-[13.5px] font-bold text-ink transition-colors duration-200 hover:bg-ink hover:text-paper"
                >
                  Send another
                </button>
                <button
                  type="button"
                  onClick={close}
                  className="rounded-full bg-amber px-4 py-2 text-[13.5px] font-bold text-amber-ink transition duration-200 hover:brightness-105"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <Field
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                maxLength={160}
              />
              <Field
                label="Subject"
                name="subject"
                placeholder="What's this about?"
                maxLength={200}
              />
              <Field
                label="Description"
                name="description"
                placeholder="One line summarising your message"
                maxLength={200}
              />
              <Field
                label="Message"
                name="message"
                textarea
                rows={5}
                placeholder="Tell me everything…"
                maxLength={5000}
              />

              {/* Honeypot — off-screen, unfocusable, never labelled for
                  a screen reader. Humans produce an empty value. */}
              <label className="hidden" aria-hidden="true">
                Company
                <input
                  type="text"
                  name="company"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </label>

              <div className="flex items-center justify-between gap-3 pt-1">
                <p
                  aria-live="polite"
                  className={`min-w-0 text-[12.5px] leading-snug ${
                    feedback
                      ? "text-red-600 dark:text-red-400"
                      : "text-muted"
                  }`}
                >
                  {feedback || "\u00a0"}
                </p>

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="shrink-0 rounded-full bg-amber px-5 py-2.5 text-[14px] font-bold text-amber-ink transition duration-200 hover:brightness-105 active:brightness-95 disabled:opacity-60"
                >
                  {status === "sending" ? "Sending…" : "Send message"}
                </button>
              </div>
            </form>
          )}
        </div>
      </LiquidGlass>
    </div>,
    document.body,
  );
}

/**
 * One label + control pair. The label wraps the field (implicit
 * association — no `htmlFor`/`id` bookkeeping), and the input takes the
 * theme's own tokens: `paper`/`ink` swap under `.dark`, so the same
 * class string reads correctly in both palettes with no dark: twin.
 */
function Field({
  label,
  name,
  type = "text",
  placeholder,
  autoComplete,
  maxLength,
  required = true,
  textarea = false,
  rows = 5,
}) {
  const shared =
    "mt-1.5 w-full rounded-xl border border-ink/12 bg-paper/75 px-3.5 py-2.5 text-[15px] leading-snug text-ink outline-none transition-colors duration-200 placeholder:text-muted/70 focus:border-amber focus:ring-2 focus:ring-amber/30";

  return (
    <label className="block">
      <span className="type-eyebrow text-muted">{label}</span>
      {textarea ? (
        <textarea
          name={name}
          required={required}
          rows={rows}
          maxLength={maxLength}
          placeholder={placeholder}
          className={`${shared} min-h-[7rem] resize-y`}
        />
      ) : (
        <input
          name={name}
          type={type}
          required={required}
          maxLength={maxLength}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={shared}
        />
      )}
    </label>
  );
}
