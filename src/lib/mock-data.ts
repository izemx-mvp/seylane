export type Platform = "linkedin" | "instagram" | "website";
export type PostFormat = "image" | "video";
export type Brand = "Executive" | "Staffing" | "Advisory";

export type MediaItem = {
  id: string;
  type: "image" | "video";
  url: string;
  description: string;
  reference: string;
  durationSec?: number;
};

export type Idea = {
  id: string;
  title: string;
  caption: string;
  hashtags: string[];
  format: PostFormat;
  platforms: Platform[];
  suggestedAt: string;
  score: number;
  media: string;
  mediaItems?: MediaItem[];
  status: "draft" | "scheduled" | "published";
  scheduledFor?: string;
};

export type Prospect = {
  id: string;
  firstName: string;
  lastName: string;
  company?: string;
  role?: string;
  email: string;
  phone: string;
  message: string;
  source: "Site web" | "Instagram" | "LinkedIn";
  receivedAt: string;
  brand: Brand | "Non défini";
  sector: string;
  type: "Entreprise" | "Candidat";
  score: number;
  status: "Nouveau" | "Qualifié IA" | "Contacté" | "RDV Planifié" | "En négociation" | "Client" | "Perdu";
  notes: { at: string; text: string }[];
};

export type ScoringCriterion = { id: string; label: string; weight: number };

export type SourcingSearch = {
  id: string;
  title: string;
  client: string;
  poste: string;
  jobDescription: string;
  brand: "Executive" | "Staffing";
  sector: string;
  seniority: string;
  location: string;
  countries: string[];
  cities: string[];
  skills: string[];
  languages: string[];
  contract: string;
  salary: string;
  scoring: ScoringCriterion[];
  sources: { linkedin: boolean; web: boolean; network: boolean };
  createdAt: string;
  status: "En cours" | "Short-list" | "Placé" | "Clôturée";
  candidates: Candidate[];
};

export type CandidateExperience = { company: string; role: string; period: string; description: string };

export type Candidate = {
  id: string;
  name: string;
  currentRole: string;
  currentCompany: string;
  location: string;
  country: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  matchScore: number;
  breakdown: { label: string; value: number; weight: number }[];
  availability: "En poste - non en recherche" | "Ouvert aux opportunités" | "En recherche active";
  noticePeriod: string;
  currentSalary: string;
  expectedSalary: string;
  education: string[];
  certifications: string[];
  timeline: CandidateExperience[];
  source: "LinkedIn" | "Web";
  avatar: string;
  poolStatus: "Nouveau" | "Approché" | "En échange" | "Vivier qualifié" | "Non pertinent";
  skills: string[];
  languages: string[];
  experience: string;
  summary: string;
  yearsExperience: number;
};

export type Campaign = {
  id: string;
  name: string;
  target: string;
  channels: ("Email" | "LinkedIn" | "WhatsApp")[];
  message: string;
  status: "Active" | "En pause" | "Terminée";
  maxRelances: number;
  window: string;
  createdAt: string;
  origin: "auto" | "manual";
  linkedPoste?: string;
  linkedClient?: string;
  contacts: CampaignContact[];
};

export type CampaignContact = {
  id: string;
  name: string;
  channel: "Email" | "LinkedIn" | "WhatsApp";
  sendStatus: "Envoyé" | "Relancé x1" | "Relancé x2" | "Répondu" | "Sans réponse";
  classification: "Intéressé" | "Refusé" | "Ambigu" | "En attente";
  lastAt: string;
  rawReply?: string;
  assignedHumanId?: string;
  humanMessages?: { at: string; from: "human" | "client"; text: string }[];
};

export type Faq = { id: string; q: string; a: string; category: "Entreprises" | "Candidats" | "Général"; status: "Actif" | "Brouillon" };
export type DocFile = { id: string; name: string; category: string; date: string; size: string; dataUrl?: string };
export type Contact = { id: string; department: string; name: string; role: string; phone: string; email: string; whatsapp: string };
export type ServiceFiche = { id: string; brand: string; tag: string; description: string; benefits: string[] };

export type RelanceDay = { day: string; enabled: boolean; from: string; to: string };
export type HuntConfig = {
  maxRelances: number;
  delayDays: number;
  waitDaysAfterOffer: number;
  channels: ("Email" | "LinkedIn" | "WhatsApp")[];
  days: RelanceDay[];
};

export type InterfaceKey = "community-manager" | "users" | "prospection" | "sourcing" | "hunttool" | "knowledge";
export type Permission = { read: boolean; add: boolean; update: boolean; delete: boolean };
export type UserAccount = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "collab";
  permissions: Record<InterfaceKey, Permission>;
  createdAt: string;
};

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  at: string;
  read: boolean;
  kind: "post" | "prospect" | "sourcing" | "hunttool";
};

export type AppState = {
  cmConfig: {
    logo: string;
    objectives: string[];
    platformSettings: {
      linkedin: { enabled: boolean; tone: string; frequency: string };
      instagram: { enabled: boolean; tone: string; frequency: string };
      website: { enabled: boolean; tone: string; frequency: string };
    };
  };
  huntConfig: HuntConfig;
  notifications: AppNotification[];
  ideas: Idea[];
  prospects: Prospect[];
  searches: SourcingSearch[];
  campaigns: Campaign[];
  faqs: Faq[];
  documents: DocFile[];
  contacts: Contact[];
};

const img = (seed: string) => `https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=800&q=80`;
const avatars = [
  "https://i.pravatar.cc/150?img=12",
  "https://i.pravatar.cc/150?img=32",
  "https://i.pravatar.cc/150?img=47",
  "https://i.pravatar.cc/150?img=25",
  "https://i.pravatar.cc/150?img=68",
  "https://i.pravatar.cc/150?img=15",
  "https://i.pravatar.cc/150?img=53",
  "https://i.pravatar.cc/150?img=8",
  "https://i.pravatar.cc/150?img=44",
  "https://i.pravatar.cc/150?img=60",
  "https://i.pravatar.cc/150?img=22",
  "https://i.pravatar.cc/150?img=36",
];

const ideaImgs = [
  "1521737604893-d14cc237f11d",
  "1600880292203-757bb62b4baf",
  "1521791136064-7986c2920216",
  "1573496359142-b8d87734a5a2",
  "1552664730-d307ca884978",
  "1556761175-5973dc0f32e7",
  "1497215728101-856f4ea42174",
  "1542744173-8e7e53415bb0",
  "1560250097-0b93528c311a",
  "1522071820081-009f0129c71c",
  "1519389950473-47ba0277781c",
  "1454165804606-c3d57bc86b40",
  "1531058020387-3be344556be6",
  "1552581234-26160f608093",
  "1517245386807-bb43f82c33c4",
];

export function seedData(): AppState {
  const ideaTitles = [
    { t: "Pourquoi la chasse de tête change la donne pour vos postes clés", f: "image" as const, plats: ["linkedin", "website"] as Platform[] },
    { t: "Portrait vidéo : parcours d'un Directeur Industriel placé par Seylane Executive", f: "video" as const, plats: ["instagram", "linkedin"] as Platform[] },
    { t: "3 signaux qu'il est temps de recruter un manager de transition", f: "image" as const, plats: ["linkedin"] as Platform[] },
    { t: "Les métiers en tension dans l'industrie au Maroc en 2026", f: "video" as const, plats: ["linkedin", "website"] as Platform[] },
    { t: "Comment Seylane Staffing gère une campagne de recrutement volumique", f: "image" as const, plats: ["linkedin", "website"] as Platform[] },
    { t: "Bilan de compétences : à qui s'adresse-t-il ?", f: "image" as const, plats: ["instagram", "linkedin"] as Platform[] },
    { t: "Talents Diaspora : notre approche unique", f: "video" as const, plats: ["linkedin", "instagram"] as Platform[] },
    { t: "QSE et recrutement : les compétences recherchées en 2026", f: "image" as const, plats: ["linkedin"] as Platform[] },
    { t: "Marque employeur : 5 leviers pour attirer les meilleurs talents", f: "image" as const, plats: ["linkedin", "website"] as Platform[] },
    { t: "Interview vidéo : notre partner Executive Search sur la chasse en aéronautique", f: "video" as const, plats: ["instagram", "linkedin"] as Platform[] },
    { t: "Salary Benchmarking 2026 : les tendances Maroc & Afrique", f: "image" as const, plats: ["linkedin", "website"] as Platform[] },
    { t: "Outplacement : accompagner la transition avec humanité", f: "image" as const, plats: ["linkedin"] as Platform[] },
    { t: "Vidéo : coulisses d'une short-list Executive à Casablanca", f: "video" as const, plats: ["instagram"] as Platform[] },
    { t: "Diversité & inclusion : notre engagement RSE", f: "image" as const, plats: ["linkedin", "instagram", "website"] as Platform[] },
    { t: "Comment structurer un plan de formation impactant", f: "image" as const, plats: ["linkedin", "website"] as Platform[] },
  ];

  const ideas: Idea[] = ideaTitles.map((x, i) => {
    const day = i - 3;
    const statuses: Idea["status"][] = ["draft", "scheduled", "published"];
    const status = statuses[i % 3];
    const d = new Date();
    d.setDate(d.getDate() + day);
    d.setHours(9 + (i % 8), 0, 0, 0);
    return {
      id: `idea-${i + 1}`,
      title: x.t,
      caption: `${x.t}. Chez Seylane, nous accompagnons dirigeants et entreprises dans leurs enjeux People Management, au Maroc et en Afrique.`,
      hashtags: ["#Seylane", "#PeopleManagement", x.f === "video" ? "#SeylaneVideo" : "#Recrutement", "#Maroc", "#Afrique"],
      format: x.f,
      platforms: x.plats,
      suggestedAt: d.toISOString(),
      score: 72 + ((i * 7) % 25),
      media: img(ideaImgs[i % ideaImgs.length]),
      status,
      scheduledFor: status !== "draft" ? d.toISOString() : undefined,
    };
  });

  const sectors = ["Industries", "Energies", "NTIC", "Transport & Logistique", "Retail", "Santé", "Construction", "Aéronautique", "Automobile", "Conseil"];
  const prospectSeed: Array<Partial<Prospect> & Pick<Prospect, "firstName" | "lastName" | "message" | "type">> = [
    { firstName: "Karim", lastName: "Benali", company: "Atlas Industries", role: "DRH Groupe", type: "Entreprise", message: "Nous cherchons un Directeur Industriel pour notre site de Kénitra. Urgent." },
    { firstName: "Salma", lastName: "El Idrissi", type: "Candidat", message: "Cadre confirmé en supply chain, ouverte à opportunités internationales." },
    { firstName: "Yassine", lastName: "Amrani", company: "OCP Solutions", role: "VP Talent", type: "Entreprise", message: "Mission de management de transition sur 8 mois côté RH." },
    { firstName: "Nadia", lastName: "Chraibi", type: "Candidat", message: "Bilan de compétences suite à 12 ans en industrie automobile." },
    { firstName: "Reda", lastName: "Bennis", company: "Renault Tanger Med", role: "Plant Manager", type: "Entreprise", message: "Campagne volumique 80 techniciens qualifiés à recruter." },
    { firstName: "Amine", lastName: "Tazi", type: "Candidat", message: "Directeur Financier, intéressé par des postes C-level au Maroc." },
    { firstName: "Meryem", lastName: "Ouazzani", company: "Managem", role: "HR Business Partner", type: "Entreprise", message: "Formation leadership pour 30 managers." },
    { firstName: "Hicham", lastName: "Berrada", company: "Maroc Telecom", role: "Directeur RH", type: "Entreprise", message: "Salary benchmarking secteur télécoms." },
    { firstName: "Sara", lastName: "Fassi", type: "Candidat", message: "Diaspora France, retour Maroc envisagé, profil finance corporate." },
    { firstName: "Omar", lastName: "Alaoui", company: "TGCC", role: "Directeur Général", type: "Entreprise", message: "Recherche d'un Directeur Technique BTP confirmé." },
    { firstName: "Fatima", lastName: "Zahra", company: "Marjane Holding", role: "Talent Acquisition Lead", type: "Entreprise", message: "Recrutement 40 responsables magasins." },
    { firstName: "Youssef", lastName: "Kabbaj", type: "Candidat", message: "Ingénieur Automatisme, disponibilité 2 mois." },
    { firstName: "Ilham", lastName: "Sefrioui", company: "CIH Bank", role: "DRH", type: "Entreprise", message: "Outplacement pour 12 cadres suite réorganisation." },
    { firstName: "Anas", lastName: "Cherkaoui", company: "Boeing Casablanca", role: "HR Manager", type: "Entreprise", message: "Chasse d'un Head of Quality aéronautique." },
    { firstName: "Leila", lastName: "Bouzid", type: "Candidat", message: "Responsable QSE, 8 ans expérience Tanger Free Zone." },
    { firstName: "Mehdi", lastName: "Sekkat", company: "Nareva Energy", role: "Talent Manager", type: "Entreprise", message: "Executive Search Directeur Développement Africain." },
    { firstName: "Aicha", lastName: "Naciri", type: "Candidat", message: "Consultante indépendante en transformation RH." },
    { firstName: "Rachid", lastName: "El Hamdaoui", company: "ONEE", role: "Chef Département RH", type: "Entreprise", message: "Étude sur process RH internes." },
    { firstName: "Zineb", lastName: "Rahmouni", type: "Candidat", message: "Diplômée HEC, cherche premier poste Consultant." },
    { firstName: "Khalid", lastName: "Ait Youssef", company: "STMicroelectronics", role: "Site HR Head", type: "Entreprise", message: "Recrutement d'ingénieurs microélectronique." },
    { firstName: "Houda", lastName: "El Malki", type: "Candidat", message: "Cheffe de projet SI, disponibilité immédiate." },
    { firstName: "Adil", lastName: "Bakkali", company: "Label'Vie", role: "DRH", type: "Entreprise", message: "Team Building 200 collaborateurs." },
    { firstName: "Samira", lastName: "Lahlou", type: "Candidat", message: "Directrice Marketing, ouverte au management de transition." },
    { firstName: "Tarik", lastName: "Fikri", company: "CGI Maroc", role: "Delivery Director", type: "Entreprise", message: "20 développeurs seniors, projet 12 mois." },
    { firstName: "Loubna", lastName: "Sqalli", company: "AttijariWafa Bank", role: "Head of Talent", type: "Entreprise", message: "Insight RH & mesure de performance." },
  ];

  const statuses: Prospect["status"][] = ["Nouveau", "Qualifié IA", "Contacté", "RDV Planifié", "En négociation", "Client", "Perdu"];
  const sources: Prospect["source"][] = ["Site web", "Instagram", "LinkedIn"];
  const brands: (Brand | "Non défini")[] = ["Executive", "Staffing", "Advisory", "Non défini"];

  const prospects: Prospect[] = prospectSeed.map((p, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (i % 28));
    return {
      id: `p-${i + 1}`,
      firstName: p.firstName,
      lastName: p.lastName,
      company: p.company,
      role: p.role,
      email: `${p.firstName.toLowerCase()}.${p.lastName.toLowerCase().replace(/\s/g, "")}@${p.company ? p.company.toLowerCase().replace(/[^a-z]/g, "") + ".ma" : "gmail.com"}`,
      phone: `+212 6 ${String(10000000 + i * 12345).slice(0, 8)}`,
      message: p.message,
      source: sources[i % 3],
      receivedAt: d.toISOString(),
      brand: brands[i % 4],
      sector: sectors[i % sectors.length],
      type: p.type,
      score: 15 + ((i * 13 + 7) % 82),
      status: statuses[i % statuses.length],
      notes: i % 4 === 0 ? [{ at: d.toISOString(), text: "Premier contact effectué par mail." }] : [],
    };
  });

  const defaultScoring: ScoringCriterion[] = [
    { id: "sk", label: "Adéquation compétences", weight: 35 },
    { id: "sen", label: "Séniorité / expérience", weight: 25 },
    { id: "sec", label: "Expérience secteur", weight: 20 },
    { id: "loc", label: "Localisation / mobilité", weight: 10 },
    { id: "dispo", label: "Disponibilité", weight: 10 },
  ];

  const makeCandidates = (n: number, seed: number, scoring: ScoringCriterion[] = defaultScoring): Candidate[] =>
    Array.from({ length: n }, (_, i) => {
      const names = [
        "Younes El Amrani", "Sophia Bennani", "Mehdi Kettani", "Rania El Khattabi", "Adil Benjelloun",
        "Nawal Squalli", "Karim Filali", "Imane Alaoui", "Simo Berrada", "Yasmine Chami", "Reda Mansouri", "Ghita El Fassi",
      ];
      const roles = [
        "Directeur Industriel", "Responsable Production", "Head of Operations", "Directeur Usine",
        "Responsable QSE", "Manager Maintenance", "Directeur Logistique", "Ingénieur Automatisme Sr",
      ];
      const companies = ["Renault Group", "Managem", "OCP", "Boeing Casablanca", "Aptiv", "STMicroelectronics", "Cosumar", "Lesieur"];
      const locs = ["Casablanca", "Tanger", "Kénitra", "Rabat", "Marrakech"];
      const countries = ["Maroc", "France", "Émirats Arabes Unis", "Canada"];
      const avails: Candidate["availability"][] = ["En poste - non en recherche", "Ouvert aux opportunités", "En recherche active"];
      const notices = ["Immédiate", "1 mois", "2 mois", "3 mois"];
      const schools = ["EMI Rabat", "EHTP Casablanca", "Centrale Paris", "ENSAM Meknès", "ESCA Casablanca", "HEC Paris"];
      const certs = ["Lean Six Sigma Black Belt", "PMP", "ISO 9001 Lead Auditor", "SAP S/4HANA", "ITIL v4"];
      const idx = (seed * 7 + i * 3) % names.length;
      const yrs = 8 + ((seed * 3 + i * 5) % 20);

      const perc = scoring.map((_, k) => 45 + ((seed * 7 + i * 13 + k * 29) % 56));
      const breakdown = scoring.map((cr, k) => ({ label: cr.label, weight: cr.weight, value: Math.round((perc[k] * cr.weight) / 100) }));
      const matchScore = breakdown.reduce((a, b) => a + b.value, 0);

      const role = roles[(idx + seed) % roles.length];
      const company = companies[(idx + i) % companies.length];
      const first = names[idx].split(" ")[0].toLowerCase();
      const last = names[idx].split(" ").slice(1).join("").toLowerCase();

      const timeline: CandidateExperience[] = [
        { company, role, period: `2021 – aujourd'hui`, description: `Pilotage des opérations, amélioration continue et management d'équipes pluridisciplinaires.` },
        { company: companies[(idx + i + 3) % companies.length], role: roles[(idx + i + 2) % roles.length], period: "2016 – 2021", description: "Déploiement de projets industriels et optimisation des KPIs de production." },
        { company: companies[(idx + i + 5) % companies.length], role: roles[(idx + i + 4) % roles.length], period: "2012 – 2016", description: "Premières responsabilités opérationnelles et gestion de la performance." },
      ];

      return {
        id: `c-${seed}-${i}`,
        name: names[idx],
        currentRole: role,
        currentCompany: company,
        location: locs[i % locs.length],
        country: countries[i % countries.length],
        email: `${first}.${last}@mail.com`,
        phone: `+212 6 ${String(20000000 + (seed * 131 + i * 977) % 79999999).slice(0, 8)}`,
        linkedinUrl: `linkedin.com/in/${first}-${last}`,
        matchScore,
        breakdown,
        availability: avails[(i + seed) % 3],
        noticePeriod: notices[(i + seed) % notices.length],
        currentSalary: `${60 + ((i * 7) % 40)} 000 MAD/mois`,
        expectedSalary: `${75 + ((i * 9) % 55)} 000 MAD/mois`,
        education: [schools[(idx + i) % schools.length], schools[(idx + i + 2) % schools.length]],
        certifications: certs.slice(0, 1 + (i % 3)),
        timeline,
        source: i % 3 === 0 ? "Web" : "LinkedIn",
        avatar: avatars[(idx + i) % avatars.length],
        poolStatus: "Nouveau",
        skills: ["Lean Management", "Six Sigma", "SAP", "Leadership", "Gestion de P&L", "Anglais courant"].slice(0, 4 + (i % 3)),
        languages: ["Français", "Anglais", i % 2 === 0 ? "Arabe" : "Espagnol"],
        experience: `${yrs} ans d'expérience dans l'industrie, dernier poste ${role} chez ${company}.`,
        summary: `${role} confirmé(e) avec ${yrs} ans d'expérience, reconnu(e) pour le pilotage de la performance industrielle et le management d'équipes. Profil ${avails[(i + seed) % 3].toLowerCase()}.`,
        yearsExperience: yrs,
      };
    });

  const scoringExec: ScoringCriterion[] = [
    { id: "sk", label: "Adéquation compétences", weight: 40 },
    { id: "sen", label: "Séniorité / leadership", weight: 30 },
    { id: "sec", label: "Expérience secteur", weight: 15 },
    { id: "loc", label: "Localisation / mobilité", weight: 10 },
    { id: "dispo", label: "Disponibilité", weight: 5 },
  ];
  const scoringStaff: ScoringCriterion[] = [
    { id: "sk", label: "Compétences techniques", weight: 45 },
    { id: "sen", label: "Années d'expérience", weight: 20 },
    { id: "sec", label: "Expérience secteur", weight: 15 },
    { id: "loc", label: "Localisation", weight: 10 },
    { id: "dispo", label: "Disponibilité", weight: 10 },
  ];

  const searches: SourcingSearch[] = [
    {
      id: "s-1", title: "Directeur Industriel — Casablanca",
      client: "Atlas Industries", poste: "Directeur Industriel Site Kénitra",
      jobDescription: "Pilotage d'un site industriel de 450 collaborateurs, transformation lean, P&L complet, reporting direct au DG Groupe.",
      brand: "Executive", sector: "Industries", seniority: "Cadre dirigeant",
      location: "Casablanca", countries: ["Maroc", "France"], cities: ["Casablanca", "Kénitra", "Rabat"],
      skills: ["Lean", "Leadership", "P&L"], languages: ["Français", "Anglais"], contract: "CDI",
      salary: "1 200 000 – 1 800 000 MAD/an", scoring: scoringExec, sources: { linkedin: true, web: true, network: true },
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(), status: "Short-list", candidates: makeCandidates(10, 1, scoringExec),
    },
    {
      id: "s-2", title: "Responsable QSE — Tanger",
      client: "Boeing Casablanca", poste: "Head of Quality Aéronautique",
      jobDescription: "Déploiement du système qualité EN 9100 sur la ligne d'assemblage, audits fournisseurs, encadrement de 12 auditeurs.",
      brand: "Executive", sector: "Aéronautique", seniority: "Confirmé",
      location: "Tanger", countries: ["Maroc"], cities: ["Tanger", "Casablanca"],
      skills: ["ISO 9001", "EN 9100", "Audits"], languages: ["Français", "Anglais"], contract: "CDI",
      salary: "450 000 – 650 000 MAD/an", scoring: scoringExec, sources: { linkedin: true, web: true, network: false },
      createdAt: new Date(Date.now() - 6 * 86400000).toISOString(), status: "En cours", candidates: makeCandidates(9, 2, scoringExec),
    },
    {
      id: "s-3", title: "Ingénieur Automatisme — Kénitra",
      client: "Renault Tanger Med", poste: "Ingénieur Automatisme Sr",
      jobDescription: "Programmation Siemens TIA Portal, mise en service robotique Fanuc, projet greenfield ligne de peinture.",
      brand: "Staffing", sector: "Automobile", seniority: "Confirmé",
      location: "Kénitra", countries: ["Maroc"], cities: ["Kénitra", "Tanger"],
      skills: ["Siemens TIA", "Robotique", "PLC"], languages: ["Français"], contract: "CDI",
      salary: "300 000 – 480 000 MAD/an", scoring: scoringStaff, sources: { linkedin: true, web: false, network: true },
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(), status: "En cours", candidates: makeCandidates(12, 3, scoringStaff),
    },
  ];

  const makeContacts = (n: number, base: string): CampaignContact[] => {
    const cls: CampaignContact["classification"][] = ["Intéressé", "Refusé", "Ambigu", "En attente"];
    const sst: CampaignContact["sendStatus"][] = ["Envoyé", "Relancé x1", "Relancé x2", "Répondu", "Sans réponse"];
    const replies = [
      "Oui, très intéressé, planifions un échange la semaine prochaine.",
      "Merci mais je ne suis pas disponible actuellement.",
      "Pouvez-vous m'envoyer plus de détails sur le poste et la rémunération ?",
      undefined,
    ];
    return Array.from({ length: n }, (_, i) => {
      const c = cls[i % 4];
      return {
        id: `${base}-${i}`,
        name: ["Aymane R.", "Salma T.", "Hicham B.", "Nadia K.", "Reda M.", "Ilham S.", "Karim A.", "Sofia L.", "Mehdi O.", "Youssef E."][i % 10],
        channel: (["Email", "LinkedIn", "WhatsApp"] as const)[i % 3],
        sendStatus: c === "En attente" ? sst[i % 3] : "Répondu",
        classification: c,
        lastAt: new Date(Date.now() - i * 3600000).toISOString(),
        rawReply: replies[i % 4],
      };
    });
  };

  const campaigns: Campaign[] = [
    {
      id: "camp-1", name: "Executive — Directeurs Industriels Casablanca", target: "Vivier — Directeur Industriel",
      channels: ["LinkedIn", "Email"], message: "Bonjour {prenom}, chez Seylane Executive nous accompagnons un leader industriel dans une recherche confidentielle...",
      status: "Active", maxRelances: 3, window: "9h-18h · Lun–Ven",
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(), origin: "auto", linkedPoste: "Directeur Industriel Site Kénitra", linkedClient: "Atlas Industries", contacts: makeContacts(14, "cc1"),
    },
    {
      id: "camp-2", name: "Staffing — Ingénieurs Automatisme Kénitra", target: "Vivier — Auto/Aéro Kénitra",
      channels: ["Email", "WhatsApp"], message: "Bonjour {prenom}, une opportunité CDI vient de s'ouvrir chez un équipementier de premier rang...",
      status: "Active", maxRelances: 2, window: "10h-19h · Lun–Sam",
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString(), origin: "auto", linkedPoste: "Ingénieur Automatisme Sr", linkedClient: "Renault Tanger Med", contacts: makeContacts(11, "cc2"),
    },
  ];

  const faqs: Faq[] = [
    ["Comment fonctionne la chasse de tête chez Seylane Executive ?", "Nous cartographions le marché, approchons directement les profils cibles, présentons une short-list et accompagnons jusqu'à l'intégration.", "Entreprises"],
    ["Proposez-vous du management de transition ?", "Oui, Seylane Executive propose des consultants expérimentés pour des missions de 3 à 18 mois.", "Entreprises"],
    ["Comment déposer ma candidature ?", "Vous pouvez postuler via le formulaire du site ou nous adresser votre CV à candidats@seylane.com.", "Candidats"],
    ["Quels secteurs couvrez-vous ?", "Conseil, Transport & Logistique, Énergies, Industries, NTIC, Construction, Retail, Tourisme et Santé.", "Général"],
    ["Intervenez-vous en Afrique ?", "Oui, nous accompagnons nos clients sur des recherches multi-pays en Afrique de l'Ouest, du Nord et centrale.", "Général"],
    ["Qu'est-ce que Seylane Staffing ?", "Seylane Staffing est notre pôle dédié aux recrutements opérationnels et campagnes volumiques.", "Entreprises"],
    ["Qu'inclut l'offre Seylane Advisory ?", "Talent Management, Outplacement, Formation, Insight RH, Salary Benchmarking, Team Building et Bilan de compétences.", "Entreprises"],
    ["Quels sont les délais moyens d'une chasse Executive ?", "Entre 8 et 14 semaines selon la rareté du profil et le périmètre géographique.", "Entreprises"],
    ["Proposez-vous un accompagnement pour les Talents Diaspora ?", "Oui, un programme dédié pour les cadres marocains à l'international souhaitant revenir au pays.", "Candidats"],
    ["Le bilan de compétences est-il confidentiel ?", "Absolument. Le processus est strictement confidentiel et personnalisé.", "Candidats"],
    ["Comment se déroule un Salary Benchmarking ?", "Nous collectons des données marché sur votre secteur puis produisons un rapport comparatif détaillé.", "Entreprises"],
    ["Où êtes-vous situés ?", "Notre siège est à Casablanca, avec des consultants mobiles au Maroc et en Afrique.", "Général"],
    ["Faites-vous du recrutement volumique ?", "Oui, Seylane Staffing gère des campagnes de 20 à 200+ recrutements.", "Entreprises"],
    ["Puis-je faire une candidature spontanée ?", "Bien sûr, envoyez-nous votre CV et un mot sur votre projet.", "Candidats"],
    ["Comment fonctionne l'outplacement ?", "Un accompagnement individuel pour repositionner rapidement un collaborateur sur le marché.", "Entreprises"],
    ["Combien coûte une prestation Executive ?", "Nos honoraires sont indexés sur la rémunération cible et convenus au brief.", "Entreprises"],
    ["Proposez-vous des formations sur-mesure ?", "Oui, notre catalogue Advisory couvre leadership, management, RH, soft skills et transformation.", "Entreprises"],
    ["Quels sont vos engagements RSE ?", "Diversité, inclusion, éthique du recrutement et confidentialité des candidats.", "Général"],
    ["Comment se passe un Team Building Seylane ?", "Nous co-construisons le format selon vos objectifs : cohésion, transformation, séminaires stratégiques.", "Entreprises"],
    ["Puis-je consulter les offres en cours ?", "Nos missions confidentielles ne sont pas publiées ; contactez-nous pour un échange.", "Candidats"],
  ].map(([q, a, category], i) => ({ id: `faq-${i}`, q: q as string, a: a as string, category: category as Faq["category"], status: "Actif" as const }));

  const documents: DocFile[] = [
    { id: "d-1", name: "Présentation Cabinet Seylane.pdf", category: "Institutionnel", date: "2026-05-14", size: "3.2 MB" },
    { id: "d-2", name: "Guide Recrutement Exécutif.pdf", category: "Executive", date: "2026-06-02", size: "1.8 MB" },
    { id: "d-3", name: "Catalogue Solutions Advisory.pdf", category: "Advisory", date: "2026-04-20", size: "4.1 MB" },
    { id: "d-4", name: "Grille Salary Benchmarking.xlsx", category: "Advisory", date: "2026-06-18", size: "780 KB" },
    { id: "d-5", name: "Charte Diversité & Inclusion.pdf", category: "RSE", date: "2026-01-10", size: "620 KB" },
    { id: "d-6", name: "Process Recrutement Staffing.docx", category: "Staffing", date: "2026-03-05", size: "1.1 MB" },
  ];

  const contacts: Contact[] = [
    { id: "ct-1", department: "Commercial", name: "Nabila Zerouali", role: "Directrice Commerciale", phone: "+212 5 20 29 07 49", email: "commercial@seylane.com", whatsapp: "+212 6 61 23 45 67" },
    { id: "ct-2", department: "Executive Search", name: "Rachid El Amrani", role: "Head of Executive Search", phone: "+212 5 20 29 07 50", email: "executive@seylane.com", whatsapp: "+212 6 61 34 56 78" },
    { id: "ct-3", department: "Staffing", name: "Sanaa Berrada", role: "Head of Staffing", phone: "+212 5 20 29 07 51", email: "staffing@seylane.com", whatsapp: "+212 6 61 45 67 89" },
    { id: "ct-4", department: "Advisory", name: "Younes Chraibi", role: "Managing Partner Advisory", phone: "+212 5 20 29 07 52", email: "advisory@seylane.com", whatsapp: "+212 6 61 56 78 90" },
    { id: "ct-5", department: "Support Candidats", name: "Meryem Alaoui", role: "Candidate Care Lead", phone: "+212 5 20 29 07 53", email: "candidats@seylane.com", whatsapp: "+212 6 61 67 89 01" },
    { id: "ct-6", department: "Administratif", name: "Hind Sefrioui", role: "Office Manager", phone: "+212 5 20 29 07 49", email: "contact@seylane.com", whatsapp: "+212 6 61 78 90 12" },
  ];

  const huntConfig: HuntConfig = {
    maxRelances: 3,
    delayDays: 3,
    channels: ["LinkedIn", "Email", "WhatsApp"],
    days: [
      { day: "Lundi", enabled: true, from: "09:00", to: "18:00" },
      { day: "Mardi", enabled: true, from: "09:00", to: "18:00" },
      { day: "Mercredi", enabled: true, from: "09:00", to: "18:00" },
      { day: "Jeudi", enabled: true, from: "09:00", to: "18:00" },
      { day: "Vendredi", enabled: true, from: "09:00", to: "16:00" },
      { day: "Samedi", enabled: false, from: "10:00", to: "13:00" },
      { day: "Dimanche", enabled: false, from: "10:00", to: "13:00" },
    ],
  };

  const notifications: AppNotification[] = [
    { id: "n-1", kind: "hunttool", title: "Nouvelle réponse — Intéressé", body: "Younes El Amrani a répondu positivement à la campagne Directeur Industriel.", at: new Date(Date.now() - 12 * 60000).toISOString(), read: false },
    { id: "n-2", kind: "post", title: "Post publié sur LinkedIn", body: "« Les métiers en tension dans l'industrie » a été publié avec succès.", at: new Date(Date.now() - 2 * 3600000).toISOString(), read: false },
    { id: "n-3", kind: "prospect", title: "Nouveau prospect qualifié IA", body: "Karim Benali (Atlas Industries) a été qualifié automatiquement — score 82%.", at: new Date(Date.now() - 5 * 3600000).toISOString(), read: false },
    { id: "n-4", kind: "sourcing", title: "Sourcing terminé", body: "10 candidats identifiés pour Directeur Industriel — Casablanca.", at: new Date(Date.now() - 26 * 3600000).toISOString(), read: true },
  ];

  return {
    cmConfig: {
      logo: "https://www.seylane.com/_next/image?url=%2FLOGO%2520SEYLANE%2520-%2520BLANC_.png&w=384&q=75",
      objectives: ["Renforcer la notoriété de marque", "Générer des leads B2B qualifiés", "Attirer les meilleurs talents"],
      platformSettings: {
        linkedin:  { enabled: true, tone: "Expert & institutionnel", frequency: "3x semaine" },
        instagram: { enabled: true, tone: "Humain & inspirant",      frequency: "2x semaine" },
        website:   { enabled: true, tone: "Éditorial approfondi",     frequency: "Hebdomadaire" },
      },
    },
    huntConfig,
    notifications,
    ideas,
    prospects,
    searches,
    campaigns,
    faqs,
    documents,
    contacts,
  };
}
