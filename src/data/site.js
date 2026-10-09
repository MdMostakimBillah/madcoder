/**
 * Site identity, navigation and social links.
 * Content is carried over verbatim from the original site.
 */
export const identity = {
  name: "Mostakim Billah",
  fullName: "Md Mostakim Billah",
  role: "Student of BSc in CSE",
  blurb:
    "Aspiring front-end developer, passionate about clean code, continuous learning, and building impactful digital experiences.",
};

/**
 * One-sentence site description — single source for both the `<meta
 * name="description">` tag and the PWA manifest, so the two can never
 * drift apart.
 */
export const siteDescription =
  "Portfolio of Md Mostakim Billah, an aspiring front-end developer and BSc CSE student. Selected projects, experience, and contact.";

export const navItems = [
  { id: "about", index: "01", label: "About" },
  { id: "project", index: "02", label: "Projects" },
  { id: "experience", index: "03", label: "Experience" },
  { id: "education", index: "04", label: "Education" },
  { id: "skills", index: "05", label: "Skills" },
];

export const socials = [
  {
    label: "X (Twitter)",
    href: "https://x.com/SearchMadCoder",
    icon: "x",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/mostakimbillahn609?utm_source=share_via&utm_content=profile&utm_medium=member_android",
    icon: "linkedin",
  },
];

/**
 * Endpoint behind the "send me a message" popup (ContactPopup.jsx): the
 * deployed Google Apps Script web app, ending in `/exec`. It appends
 * each message as a row on the "Messages" sheet — script and deployment
 * steps in CONTACT_SETUP.md.
 */
export const CONTACT_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbyK-kP5sLUFfiZNd9c7K8MddXoqOU64Izj4UA0wKxG929dVQ4ZiM4y2_KPfh5evIKah/exec";

/**
 * Resume targeted by the download icon in the rail and the mobile pill.
 * Live at `public/CV/Com Oper CV.pdf` — served straight from the site
 * root with no build step, so replacing that file and redeploying is
 * all it takes to publish a new CV. `asset()` percent-encodes the path,
 * so names with spaces are safe.
 */
export const CV_FILE = "CV/Com Oper CV.pdf";
