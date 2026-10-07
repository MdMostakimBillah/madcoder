import { socialIcons } from "./Icons.jsx";
import { identity, socials } from "../data/site.js";

/**
 * Page footer. Static HTML at build time — the year is refreshed by the
 * tiny inline script in the layout, so this needs no hydration.
 *
 * `pb-36` keeps the last line clear of the floating glass tab bar on
 * small screens; `lg:pb-24` is a plain page-bottom margin on desktop.
 */
export default function Footer() {
  return (
    <footer className="mt-16 flex scroll-mt-24 flex-wrap items-center justify-between gap-4 border-t border-rule pb-36 pt-6 lg:mt-24 lg:pb-24">
      <p className="text-[13px] text-muted">
        © <span data-year>{new Date().getFullYear()}</span>{" "}
        {identity.fullName}
      </p>

      <ul className="flex items-center gap-1 lg:hidden">
        {socials.map((social) => {
          const Icon = socialIcons[social.icon];
          const isExternal = social.href.startsWith("http");
          return (
            <li key={social.label}>
              <a
                href={social.href}
                {...(isExternal
                  ? { target: "_blank", rel: "noreferrer" }
                  : {})}
                aria-label={social.label}
                className="icon-lift flex h-9 w-9 items-center justify-center text-ink-soft transition-colors duration-200 hover:bg-ink hover:text-paper"
              >
                <Icon />
              </a>
            </li>
          );
        })}
      </ul>

      <a
        href="#about"
        className="type-eyebrow text-muted transition-colors duration-200 hover:text-ink"
      >
        Back to top
      </a>
    </footer>
  );
}
