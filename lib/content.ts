// Single source of truth for site copy — sourced from RitamMukherjee_ResumeSeptember.pdf.
// Edit here; components just render this.

export const profile = {
  name: "Ritam Mukherjee",
  role: "Mechatronics Engineer",
  tagline: "Mechatronics engineer working across hardware and software.",
  subline:
    "I split my time between machine learning — fine-tuning and deploying language models in production — and robotics, building physical systems at the University of Waterloo. I like working on projects that sit at that intersection.",
  seeking: "Seeking Winter '27 Co-op",
  location: "Waterloo, Ontario",
  email: "mukherjee.ritam@outlook.com",
  phone: "226-792-4096",
  links: {
    github: "https://github.com/ritam-m-code",
    linkedin: "https://linkedin.com/in/ritammukherjee-uw",
    site: "https://www.ritammukherjee.ca",
  },
  education: {
    school: "University of Waterloo",
    program: "B.A.Sc. Mechatronics Engineering",
    gpa: "3.8 / 4.0",
    expected: "Expected May 2030",
  },
};

export type FeaturedWork = {
  index: string;
  title: string;
  org: string;
  period: string;
  problem: string;
  decision: string;
  outcome: string;
  stack: string[];
};

export const featuredWork: FeaturedWork = {
  index: "01",
  title: "Fine-tuning production LLMs for financial news classification",
  org: "SuraNeoAge Systems Transformations",
  period: "May 2026 — Aug 2026",
  problem:
    "An early-stage fintech startup needed to extract entities, topics, and relevance signal from 2,700+ scraped financial news articles per cycle — a task previously done by manual editorial curation, which didn't scale and couldn't be queried in real time.",
  decision:
    "Built the ingestion-to-training pipeline (PostgreSQL, FastAPI, Docker) and fine-tuned two models for two different jobs rather than one model for everything: Phi-4 Mini (14B) via QLoRA for entity/topic extraction using GPT-4o-generated ground truth enriched with NSE sector data, and a separately fine-tuned FinBERT (110M) for company NER, where a smaller, cheaper model was the right tool. Replaced manual relevance curation with an on-demand scoring endpoint, persisting the latest verdict per article in Redis with automatic cache invalidation on reclassification — decoupling read latency from LLM inference time instead of blocking requests on the model.",
  outcome:
    "The fine-tuned Phi-4 Mini outperformed both the base model and GPT-4o mini in a 100-article blind ABC comparison judged by the team's business analyst. FinBERT reached 0.76 token F1 / 0.88 recall on company NER. The relevance endpoint removed manual curation from the editorial workflow entirely.",
  stack: [
    "Phi-4 Mini",
    "QLoRA",
    "FinBERT",
    "FastAPI",
    "PostgreSQL",
    "Redis",
    "Docker",
  ],
};

export type ExperienceEntry = {
  role: string;
  org: string;
  period: string;
  location: string;
  description: string;
  tags: string[];
  logo?: string;
  linkToFeatured?: boolean;
  repoLink?: string;
};

export const experience: ExperienceEntry[] = [
  {
    role: "Undergraduate Student Researcher",
    org: "University of Waterloo — Dr. Eugene Li (Biomechanics)",
    period: "Aug 2026 — Present",
    location: "Waterloo, Ontario",
    description:
      "Building a pose-estimation and biomechanical simulation pipeline for analyzing judo throws, starting with osoto gari. Modeled body-segment inertial parameters (BSIP) from anthropometric data and a deterministic kinematic model — center of mass, ground reaction forces, 3D joint trajectories for thrower and opponent — validated against YOLOv8 pose estimation run on reference footage. Currently extending the pipeline to fuse two synchronized camera streams through YOLOv8 and a transformer model, for more robust technique reconstruction than a single viewpoint allows.",
    tags: ["YOLOv8", "Computer Vision", "Biomechanics", "Python"],
    logo: "/logos/uw.png",
  },
  {
    role: "Software Engineering Intern",
    org: "SuraNeoAge Systems Transformations",
    period: "May 2026 — Aug 2026",
    location: "Remote",
    description:
      "Fine-tuned and deployed LLMs for financial entity/topic extraction and built the production data pipeline behind them. Full case study above.",
    tags: ["QLoRA", "FastAPI", "PostgreSQL", "Redis", "Docker"],
    linkToFeatured: true,
  },
  {
    role: "Undergraduate Student Researcher",
    org: "University of Waterloo — Dr. Shirley Tang",
    period: "Sep 2025 — May 2026",
    location: "Waterloo, Ontario",
    description:
      "Early-stage development of a 7-axis 3D printer built on a Gen3 robot arm. Implemented ROS 2 Cartesian motion control — feedback-based trajectory tracking and homing — on the physical arm, while researching non-planar slicing and g-code conversion.",
    tags: ["ROS 2", "C++", "Robotics"],
    logo: "/logos/uw.png",
  },
  {
    role: "Volunteer Student Researcher",
    org: "University of Waterloo — Dr. Eugene Li (WATiMAKE Lab)",
    period: "Aug 2024 — Jun 2025",
    location: "Waterloo, Ontario",
    description:
      "Industrial CNC tool remaining-useful-life project. Built a sensor-to-model data pipeline, prototyped a PyTorch Transformer, and trained an NCA+KNN classifier reaching 79.6% test accuracy on 1.5M+ accelerometer samples.",
    tags: ["PyTorch", "Transformers", "Signal Processing"],
    logo: "/logos/uw.png",
    repoLink: "https://github.com/ritam-m-code/RUL-Transfomer",
  },
  {
    role: "President",
    org: "KW Sandbox",
    period: "Jul 2023 — Jun 2025",
    location: "Waterloo, Ontario",
    description:
      "Led a 12-person team delivering free STEM workshops — AI, biotech, web design — to 160+ local high school students. Coordinated venues, sponsors, and guest speakers.",
    tags: ["Leadership", "STEM Outreach"],
    logo: "/logos/sandbox.png",
  },
  {
    role: "Team Member",
    org: "2702 Rebels",
    period: "Jul 2023 — Nov 2025",
    location: "Waterloo, Ontario",
    description:
      "Finalist, 2024 ONT District Georgian Event. Designed the disk-launching mechanism (SolidWorks, Fusion 360) and built the robot's computer vision module.",
    tags: ["SolidWorks", "OpenCV", "TensorFlow"],
    logo: "/logos/rebels.png",
  },
];

export type Project = {
  index: string;
  title: string;
  period?: string;
  link: string;
  problem: string;
  decision: string;
  outcome: string;
  stack: string[];
};

export const projects: Project[] = [
  {
    index: "01",
    title: "Axiom",
    link: "https://github.com/forkiron/axiom",
    problem:
      "Canadian high school grades aren't comparable across schools — an A at one school can mean a different bar than an A at another, and there was no standardized way to see that.",
    decision:
      "Built a full-stack platform that standardizes grades via test-difficulty analysis, backed by a 3D interactive school map and a natural-language school agent. Used crowd-sourced data with a persisted adjustment model so the standardization improves as more data comes in, instead of relying on a single static formula.",
    outcome:
      "Shipped full-stack on Next.js, Gemini AI, Mapbox, and Supabase — the most complete end-to-end system among my side projects, from data ingestion through an interactive UI.",
    stack: ["Next.js", "Gemini AI", "Mapbox", "Supabase", "TypeScript"],
  },
  {
    index: "02",
    title: "1000 Elo Chessbot",
    link: "https://github.com/j3rry1iu/ChessHacks-Training",
    problem:
      "Generating a legal, reasonable chess move fast enough to be playable means the model can't just be accurate — it has to fit inside a hard latency budget.",
    decision:
      "Built a ResNet-style CNN with policy and value heads, paired with a depth-3 search rather than relying on the network alone — trading a small amount of raw model capacity for a search step that's cheap enough to keep total move generation under 250ms.",
    outcome:
      "Trained on Modal cloud compute and shipped the weights to HuggingFace — a working engine that generates moves within its latency budget, not just a model that scores well offline.",
    stack: ["Python", "CNN", "NumPy", "Modal", "HuggingFace"],
  },
  {
    index: "03",
    title: "Motion-Activated Door Monitoring System",
    link: "https://github.com/ryanli222/smartdoorbell",
    problem:
      "A doorbell camera needs to go from motion detected to a useful alert — display, video, audio, two-way talk — on hardware with real constraints (a Raspberry Pi, no cloud compute budget).",
    decision:
      "Ran OpenCV motion detection directly on the Pi against a live webcam feed. On detection, chained together a display trigger, video streaming, alert audio, two-way communication, and an image upload to a FastAPI backend tunnelled through Ngrok — treating detection-to-alert as one pipeline instead of separate features bolted together.",
    outcome:
      "A complete edge-to-backend loop running on real hardware: detection, alerting, and remote access all working end to end on a Raspberry Pi.",
    stack: ["Raspberry Pi", "OpenCV", "Docker", "FastAPI", "Ngrok"],
  },
];

export type MoreProject = {
  title: string;
  description: string;
  link: string;
  stack: string[];
};

export const moreProjects: MoreProject[] = [
  {
    title: "Parcel",
    description:
      "Live collaborative code editor scaffold — CRDT-based sync via Yjs/y-websocket, per-room WebSocket collaboration.",
    link: "https://github.com/ritam-m-code/parcel",
    stack: ["React", "CodeMirror 6", "Yjs", "WebSockets"],
  },
  {
    title: "Recursive Maze Solver",
    description:
      "Recursive maze generation with live pathfinding visualization — DFS, BFS, and Dijkstra compared side by side.",
    link: "https://github.com/ritam-m-code/Maze-Solver",
    stack: ["Processing", "Algorithms"],
  },
  {
    title: "canstandard",
    description:
      "A tool for checking standardized Canadian testing data.",
    link: "https://github.com/ritam-m-code/canstandard",
    stack: ["TypeScript"],
  },
];

export const skills: { group: string; items: string[] }[] = [
  { group: "Languages", items: ["Python", "C++", "C#", "TypeScript", "JavaScript", "SQL"] },
  {
    group: "ML / Data",
    items: ["PyTorch", "HuggingFace", "QLoRA", "scikit-learn", "NumPy", "OpenCV", "TensorFlow"],
  },
  { group: "Robotics", items: ["ROS 2", "SolidWorks", "AutoCAD", "Fusion 360"] },
  {
    group: "Web / Infra",
    items: ["FastAPI", "Next.js", "React", "PostgreSQL", "Redis", "Supabase", "Docker", "Vercel"],
  },
];

export const nav = [
  { label: "Work", href: "#featured-work" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Log", href: "#build-log" },
  { label: "Contact", href: "#contact" },
];
