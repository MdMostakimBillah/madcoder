/**
 * Body copy, carried over verbatim from the original `index.html`.
 * `**text**` renders as bold, matching the original `<b>` tags.
 */
export const aboutParagraphs = [
  "My name is **Mohammad Mostakim Billah,** and I am currently pursuing a Bachelor of Science (B.Sc.) degree in Computer Science and Engineering (CSE). I am highly passionate about technology and always eager to learn something new every day.",
  "Programming is one of my core interests, and I actively seek to improve my skills and knowledge in this field. I adapt quickly to new environments and enjoy collaborating with different people.",
  "I am highly focused when it comes to productivity, and I tend to stay mentally engaged with a task until it is fully completed.",
  "Reading books is one of my favorite habits, as it enriches my knowledge and inspires me to grow continuously.",
];

export const projectsIntro =
  "Here are some of the projects I have worked on as part of my learning and professional journey. Each project reflects my skills, creativity, and dedication to solving real-world problems using modern web technologies. I’m continuously learning and improving, and these works represent my growth as a developer.";

/**
 * Education entries: `year` anchors the left column (like `period` in
 * the experience list), `facts` are the label/value lines. Transcribed
 * from the original site's education card — institution names kept
 * verbatim. The list renders in array order with no numbering of its
 * own, so it reads newest-first: present study on top, SSC last.
 */
export const education = [
  {
    year: "Present",
    title: "B.Sc (Honours.) in CSE",
    facts: [
      ["Institution", "Delta Computer Science Collage"],
      ["Subject", "Computer Science & Engineering"],
      ["Pass Year", "Present (5th Semester)"],
    ],
  },
  {
    year: "2021",
    title: "Higher Secondary Certificate",
    facts: [
      ["Institution", "Pirgacha Govt. Collage"],
      ["Section", "Science (Higher Mathematics)"],
      ["Pass Year", "2021"],
      ["GPA", "4.25"],
    ],
  },
  {
    year: "2019",
    title: "Secondary School Certificate",
    facts: [
      ["Institution", "Chandipur Model High School"],
      ["Section", "Science (Higher Mathematics)"],
      ["Pass Year", "2019"],
      ["GPA", "4.56"],
    ],
  },
];

/**
 * Experience entries: `period` is the label shown in the left column,
 * `body` is the original paragraph. The list renders in array order with
 * no numbering of its own, so this sequence is deliberate: current roles,
 * the recent training, then the earlier stints.
 */
export const experience = [
  {
    period: "Current",
    role: "Accountant & Computer Operator",
    body: "Manage **accounting, fee collection, student records**, and daily computer operations. Administer the **School Management System**, reports, data entry, and digital records while supporting overall school administration and system management.",
  },
  {
    period: "Current",
    role: "Mathematics & Science Teacher",
    body: "I am currently working as a Mathematics and Science teacher at a religious (Deeni) educational institution, backed by **2 years of private coaching** and student teaching experience across many institutions, where I am able to combine my passion for teaching with my commitment to community development and moral values.",
  },
  {
    period: "2 days",
    role: "AI Skills Training — BRAC",
    body: "Earned a **Certificate of Completion** for BRAC's **AI Skills Training** programme, a 2-day course run as a joint initiative of the BRAC Education Programme **(BEP)**, BRAC Learning Division **(BLD)** and Social Innovation Lab **(SIL)**. The training is part of the **AI Opportunity Fund: Asia-Pacific** in collaboration with **AVPN**, with support from **Google.org** and the **ADB**.",
  },
  {
    period: "Freelance",
    role: "Web Developer — Fiverr & Upwork",
    body: "I have practical experience working as a freelance web developer on platforms like Fiverr and Upwork, where I successfully completed several client projects. My primary focus is **front-end development** using React.js and modern web technologies.",
  },
  {
    period: "9 months",
    role: "Textile Factory — Dhaka EPZ (BEPZA)",
    body: "In addition to my technical background, I worked for 9 months at a textile factory in Dhaka EPZ **(BEPZA)**, which helped me understand teamwork, discipline, and industrial workflow in a real-world environment.",
  },
  {
    period: "7 days",
    role: "Winter Camp — Bangladesh Army (BNCC)",
    body: "Completed a 7-day winter camp with the Bangladesh Army in my collage life **BNCC**, gaining valuable experience in discipline, teamwork, leadership, and resilience in physically and mentally challenging conditions.",
  },
  {
    period: "3 months",
    role: "Security Personnel",
    body: "I also served as a **security** personnel for 3 months, a responsibility that greatly enhanced my personal discipline, work ethics, and sense of accountability.",
  },
  {
    period: "Skills",
    role: "Office & Computing",
    body: "Moreover, I have strong **skills** in basic computing, including Microsoft Word, Excel, PowerPoint, internet browsing, data entry, and fast typing. I’m a quick learner, adaptable to new environments, and always eager to grow through challenges and learning opportunities.",
  },
  {
    period: "6 months",
    role: "Computer Training",
    body: "Completed a **6-month computer training** where I learned every **basic and official computer work** — Microsoft **Word, Excel, PowerPoint**, internet and email, **data entry**, fast typing, printing, and everyday office tasks.",
  },
];

/**
 * Skills groups for the Skills section — each item's `level` (0–100)
 * drives its progress-bar width, so the bars are data-driven like
 * everything else. Levels are visual estimates; tweak freely.
 */
export const skills = [
  {
    category: "Office Application",
    items: [
      { name: "MS Word", level: 78 },
      { name: "MS Excel", level: 78 },
      { name: "MS Power Point", level: 50 },
    ],
  },
  {
    category: "Design Tools",
    items: [
      { name: "Adobe Photoshop", level: 50 },
      { name: "Figma", level: 88 },
    ],
  },
  {
    category: "Programming Related",
    items: [
      { name: "C", level: 40 },
      { name: "C++", level: 58 },
      { name: "JavaScript", level: 68 },
      { name: "React", level: 60 },
      { name: "Node JS", level: 50 },
      { name: "NextJS", level: 55 },
      { name: "jQuery", level: 38 },
      { name: "PHP", level: 62 },
      { name: "WordPress", level: 72 },
      { name: "MySQL", level: 78 },
    ],
  },
];
