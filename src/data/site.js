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
    // TODO: replace "#" with your real LinkedIn profile URL.
    label: "LinkedIn",
    href: "#",
    icon: "linkedin",
  },
  {
    label: "Discord",
    href: "https://discord.com/channels/1139892246863425596/1139892247542906911",
    icon: "discord",
  },
];

/**
 * Resume targeted by the download icon in the rail and the mobile pill.
 * Live at `public/CV/Com Oper CV.pdf` — served straight from the site
 * root with no build step, so replacing that file and redeploying is
 * all it takes to publish a new CV. `asset()` percent-encodes the path,
 * so names with spaces are safe.
 */
export const CV_FILE = "CV/Com Oper CV.pdf";
