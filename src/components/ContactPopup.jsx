import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { CloseIcon } from "./Icons.jsx";
import LiquidGlass from "./LiquidGlass.jsx";
import { CONTACT_ENDPOINT } from "../data/site.js";

/**
 * Contact card — the "send me a message" popup, as three short steps.
 *
 * Triggered by any element carrying `data-open-contact`: the rail's
 * message icon (this island's document-level listener) and the footer's
 * (static HTML that must stay unhydrated — one delegated listener serves
 * both, so the footer costs no JavaScript at all).
 *
 * The flow is deliberately piecemeal — one small question per screen so
 * the card itself stays small and minimal rather than a wall of form:
 *   step 1  Email (required)                      → Next
 *   step 2  Subject + one-line Description (both required) → Next
 *   step 3  Message — the long one, *optional*    → Send message
 * The first three fields are the contract (they are what makes a reply
 * possible); the message can be sent blank. Values live in React state,
 * so Back re-finds everything typed so far, and a mis-close reopens on
 * step 1 with the draft intact.
 *
 * The card is LiquidGlass with the `.glass-dialog` opt-in from
 * global.css, which is what lets the material show at *every* width —
 * the mobile gate owns the pills and taskbar, this shell owns itself.
 *
 * It docks in the bottom-right corner over a frosted veil: the backdrop
 * carries only a `backdrop-filter` blur (no tint), so what the glass
 * refracts is the live page itself — softened, not darkened — while the
 * veil still catches outside clicks, freezes the page and keeps the
 * pager disarmed while the card is open.
 *
 * Delivery: Apps Script's redirect chain carries no CORS headers, so a
 * readable response can't be asked for — the POST runs `no-cors` and
 * stays a *simple* request (URL-encoded body, no preflight to fail).
 * What can still reject is the network itself never taking it, which is
 * the only failure worth showing the visitor. Until CONTACT_ENDPOINT is
 * configured the card says so instead of pretending to send.
 */

const EMPTY = { email: "", subject: "", description: "", message: "" };

export default function ContactPopup() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error | unconfigured
  const [step, setStep] = useState(1); // 1 email · 2 subject+description · 3 message
  const [values, setValues] = useState(EMPTY);

  const openerRef = useRef(null);
  const panelRef = useRef(null);
  const formRef = useRef(null);
  const emailRef = useRef(null);
  const subjectRef = useRef(null);
  const descriptionRef = useRef(null);

  const close = useCallback(() => setOpen(false), []);

  // One listener, every trigger. The opener is remembered so focus can
  // be handed back on close — a keyboard visitor lands where they were.
  // Each open restarts the wizard at step 1 (the draft survives).
  useEffect(() => {
    const onTrigger = (event) => {
      const trigger = event.target.closest?.("[data-open-contact]");
      if (!trigger) return;
      event.preventDefault();
      openerRef.current = trigger;
      setStatus("idle");
      setStep(1);
      setOpen(true);
    };
    document.addEventListener("click", onTrigger);
    return () => document.removeEventListener("click", onTrigger);
  }, []);

  // The card's own lifecycle: freeze the page, take focus, and give
  // both back on close. Escape closes; Tab cycles inside the panel
  // instead of wandering into the frozen page behind it.
  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

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
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      openerRef.current?.focus?.();
    };
  }, [open, close]);

  // Whichever screen is showing takes focus: the step's first field
  // (or, once sent, the success block's first button). Skipped while
  // sending so a click on "Send message" isn't yanked back mid-flight.
  useEffect(() => {
    if (!open || status === "sending") return undefined;
    const t = window.setTimeout(() => {
      panelRef.current
        ?.querySelector(
          "[data-active-step] input, [data-active-step] textarea, [role='status'] button",
        )
        ?.focus();
    }, 60);
    return () => window.clearTimeout(t);
  }, [open, step, status]);

  const setField = (name) => (event) =>
    setValues((v) => ({ ...v, [name]: event.target.value }));

  // The browser only validates what is currently rendered, so each Next
  // checks its own screen's required fields explicitly — first invalid
  // field gets the native bubble, and the step doesn't advance.
  const validate = (refs) => {
    for (const ref of refs) {
      const el = ref.current;
      if (el && !el.checkValidity()) {
        el.reportValidity();
        return false;
      }
    }
    return true;
  };

  const next = () => {
    if (step === 1) {
      if (validate([emailRef])) setStep(2);
    } else if (step === 2) {
      if (validate([subjectRef, descriptionRef])) setStep(3);
    }
  };

  const back = () => setStep((s) => Math.max(1, s - 1));

  const onSubmit = async (event) => {
    event.preventDefault();
    if (status === "sending") return;

    // Belt and braces: the three short fields are required even though
    // only the current step's inputs exist for the browser to check.
    if (!values.email.trim()) {
      setStep(1);
      return;
    }
    if (!values.subject.trim() || !values.description.trim()) {
      setStep(2);
      return;
    }

    const form = event.currentTarget;
    // Honeypot: no human ever sees this field. Filled → fake success,
    // nothing leaves the browser, and the bot believes it won.
    const company = String(
      new FormData(form).get("company") || "",
    ).trim();
    if (company) {
      setStatus("sent");
      setValues(EMPTY);
      setStep(1);
      return;
    }

    if (!CONTACT_ENDPOINT) {
      setStatus("unconfigured");
      return;
    }

    setStatus("sending");
    try {
      await fetch(CONTACT_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        body: new URLSearchParams({
          email: values.email.trim(),
          subject: values.subject.trim(),
          description: values.description.trim(),
          message: values.message.trim(), // optional — may be empty
        }),
        signal: AbortSignal.timeout
          ? AbortSignal.timeout(15000)
          : undefined,
      });
      setStatus("sent");
      setValues(EMPTY);
      setStep(1);
    } catch {
      setStatus("error");
    }
  };

  // Enter means "go next" in the one-line fields; inside the textarea
  // (step 3) it keeps its usual newline meaning.
  const onKeyDown = (event) => {
    if (event.key !== "Enter" || event.target.tagName !== "INPUT") return;
    event.preventDefault();
    if (step === 3) formRef.current?.requestSubmit();
    else next();
  };

  if (!open) return null;

  const feedback = {
    error: "Couldn't send — check your connection and try again.",
    unconfigured: "This form isn't connected yet — reach me on LinkedIn or X.",
  }[status];

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:p-6 backdrop-blur-[8px] animate-veil"
      onMouseDown={(event) => {
        // Only a press that *starts* on the backdrop dismisses — a
        // drag out of the form never closes the card by accident.
        if (event.target === event.currentTarget) close();
      }}
    >
      <LiquidGlass
        as="div"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-title"
        className="glass-dialog animate-dialog w-full max-w-[24rem] rounded-3xl p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="type-eyebrow text-amber-deep">Contact</p>
            <h2
              id="contact-title"
              className="mt-1.5 text-[1.375rem] font-bold leading-tight tracking-tight text-ink"
            >
              Send me a message
            </h2>
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

        {/* Three dots: one per short screen — which step am I on? */}
        <div
          className="mt-3 flex items-center gap-1.5"
          role="group"
          aria-label={`Step ${step} of 3`}
        >
          {[1, 2, 3].map((i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full ${
                i <= step
                  ? "bg-amber"
                  : "bg-ink/20 dark:bg-white/25"
              }`}
            />
          ))}
        </div>

        {/* Scroll only if a short viewport needs it — the glass layers
            live on the shell, so scrolling this inner wrapper leaves
            the refraction nailed to the card. The budget (viewport minus
            the card's own height overhead) keeps a docked card inside the
            screen at any window height; the shell itself never scrolls. */}
        <div className="mt-4 max-h-[calc(100dvh-14rem)] overflow-y-auto overscroll-contain">
          {status === "sent" ? (
            <div
              role="status"
              className="rounded-2xl border border-amber/50 bg-amber/15 px-4 py-5 text-center"
            >
              <p className="text-[15px] font-bold text-ink">
                Message sent
              </p>
              <p className="mt-1 text-[13.5px] leading-snug text-muted">
                Thanks — I'll read it and get back to you.
              </p>
              <div className="mt-3 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setValues(EMPTY);
                    setStep(1);
                    setStatus("idle");
                  }}
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
            <form
              ref={formRef}
              onSubmit={onSubmit}
              onKeyDown={onKeyDown}
              className="space-y-4"
            >
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

              {step === 1 && (
                <div data-active-step className="space-y-4">
                  <Field
                    label="Email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    maxLength={160}
                    inputRef={emailRef}
                    value={values.email}
                    onChange={setField("email")}
                  />
                </div>
              )}

              {step === 2 && (
                <div data-active-step className="space-y-4">
                  <Field
                    label="Subject"
                    name="subject"
                    placeholder="What's this about?"
                    maxLength={200}
                    inputRef={subjectRef}
                    value={values.subject}
                    onChange={setField("subject")}
                  />
                  <Field
                    label="Description"
                    name="description"
                    placeholder="In a few words…"
                    maxLength={200}
                    inputRef={descriptionRef}
                    value={values.description}
                    onChange={setField("description")}
                  />
                </div>
              )}

              {step === 3 && (
                <div data-active-step>
                  <Field
                    label="Message"
                    name="message"
                    textarea
                    rows={4}
                    required={false}
                    placeholder="Anything else? (optional)"
                    maxLength={5000}
                    value={values.message}
                    onChange={setField("message")}
                  />
                </div>
              )}

              <div className="space-y-2 pt-1">
                <p
                  aria-live="polite"
                  className={`min-h-[1.1em] text-[12.5px] leading-snug ${
                    feedback
                      ? "text-red-600 dark:text-red-400"
                      : "text-muted"
                  }`}
                >
                  {feedback || "\u00a0"}
                </p>

                <div className="flex items-center justify-between gap-2">
                  <div>
                    {step > 1 && (
                      <button
                        type="button"
                        onClick={back}
                        className="rounded-full border border-ink/15 px-4 py-2 text-[13.5px] font-bold text-ink transition-colors duration-200 hover:bg-ink hover:text-paper"
                      >
                        Back
                      </button>
                    )}
                  </div>

                  {step < 3 ? (
                    /* Distinct keys: without them React would PATCH the
                       clicked node into the step-3 submit button while
                       the click is still dispatching, and the browser's
                       activation behavior — evaluated after listeners —
                       would see type="submit" and send the message
                       prematurely. Keys force a fresh node instead. */
                    <button
                      key="advance"
                      type="button"
                      onClick={next}
                      className="rounded-full bg-amber px-5 py-2 text-[13.5px] font-bold text-amber-ink transition duration-200 hover:brightness-105 active:brightness-95"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      key="send"
                      type="submit"
                      disabled={status === "sending"}
                      className="rounded-full bg-amber px-5 py-2 text-[13.5px] font-bold text-amber-ink transition duration-200 hover:brightness-105 active:brightness-95 disabled:opacity-60"
                    >
                      {status === "sending"
                        ? "Sending…"
                        : "Send message"}
                    </button>
                  )}
                </div>
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
 * Controlled (`value`/`onChange`) so stepping back and forth never
 * loses a keystroke.
 */
function Field({
  label,
  name,
  value,
  onChange,
  inputRef,
  type = "text",
  placeholder,
  autoComplete,
  maxLength,
  required = true,
  textarea = false,
  rows = 4,
}) {
  const shared =
    "mt-1.5 w-full rounded-xl border border-ink/12 bg-paper/75 px-3.5 py-2.5 text-[15px] leading-snug text-ink outline-none transition-colors duration-200 placeholder:text-muted/70 focus:border-amber focus:ring-2 focus:ring-amber/30";

  return (
    <label className="block">
      <span className="type-eyebrow text-muted">{label}</span>
      {textarea ? (
        <textarea
          ref={inputRef}
          name={name}
          required={required}
          rows={rows}
          maxLength={maxLength}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`${shared} min-h-[6rem] resize-y`}
        />
      ) : (
        <input
          ref={inputRef}
          name={name}
          type={type}
          required={required}
          maxLength={maxLength}
          placeholder={placeholder}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          className={shared}
        />
      )}
    </label>
  );
}
