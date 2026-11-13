// SAMPLE CONTENT for the member portal. Nothing here is connected to a real
// source yet. Replace these lists (or load them from the events API and a
// database) when the chapter has real events, opportunities, and resources.
// Pages show a "sample content" note while these are in use.
// (Announcements are real: officers post them in the portal.)

export const DISCOVER_EAST_URL =
  "https://psuharrisburg.campuslabs.com/engage/organization/national-society-of-black-engineers";

export interface EventItem {
  id: string;
  title: string;
  category: string;
  date: string; // ISO date, YYYY-MM-DD
  time: string;
  location: string;
  summary: string;
}

export interface Opportunity {
  id: string;
  kind: "Internship" | "Scholarship" | "Conference";
  title: string;
  deadline: string;
  url: string;
}

export interface Resource {
  id: string;
  title: string;
  summary: string;
  url: string;
}

export interface PortalContent {
  events: EventItem[];
  opportunities: Opportunity[];
  resources: Resource[];
}

export const NEXT_MEETING = {
  title: "Weekly GBM",
  when: "Wednesdays, Common Hour, 11:30 AM to 12:15 PM",
  where: "Olmsted E243",
};

// Members need this many Torch Tokens to qualify for conferences.
export const CONFERENCE_TOKEN_GOAL = 10;

export const portalContent: PortalContent = {
  events: [
    {
      id: "gbm-weekly",
      title: "Weekly GBM",
      category: "General body meeting",
      date: "2026-11-18",
      time: "11:30 AM to 12:15 PM",
      location: "Olmsted E243",
      summary: "Connect with chapter members, hear organization updates, and learn about upcoming programs.",
    },
    {
      id: "study-session",
      title: "Engineering Study Session",
      category: "Academic",
      date: "2026-11-23",
      time: "6:00 PM to 8:00 PM",
      location: "Olmsted Library",
      summary: "A focused peer study session for engineering courses, project work, and exam preparation.",
    },
    {
      id: "volunteer",
      title: "Volunteer Event",
      category: "Community service",
      date: "2026-12-03",
      time: "9:00 AM to 12:00 PM",
      location: "Harrisburg Community Center",
      summary: "Serve alongside fellow members and support a local community partner.",
    },
    {
      id: "career-prep",
      title: "Career Prep Workshop",
      category: "Professional development",
      date: "2026-12-08",
      time: "5:30 PM to 7:00 PM",
      location: "Olmsted W107",
      summary: "Build stronger resumes, practice introductions, and prepare for engineering opportunities.",
    },
  ],
  opportunities: [
    { id: "o1", kind: "Internship", title: "Engineering Co-op Program", deadline: "Deadline April 30", url: DISCOVER_EAST_URL },
    { id: "o2", kind: "Scholarship", title: "NSBE Academic Excellence Award", deadline: "Deadline May 12", url: DISCOVER_EAST_URL },
    { id: "o3", kind: "Conference", title: "Regional / National Convention", deadline: "Registration closes May 20", url: DISCOVER_EAST_URL },
  ],
  resources: [
    { id: "r1", title: "Resume templates", summary: "Start from a clean engineering resume and tailor it to each role.", url: DISCOVER_EAST_URL },
    { id: "r2", title: "Interview preparation", summary: "Practice questions and tips for technical and behavioral interviews.", url: DISCOVER_EAST_URL },
    { id: "r3", title: "Study group schedule", summary: "Find a peer study session for your engineering courses.", url: DISCOVER_EAST_URL },
  ],
};

// Chapter social media. Put the real addresses here. Leave `url` as null
// until the chapter has one and the page shows "link coming soon".
export const SOCIAL_LINKS: { name: string; url: string | null }[] = [
  { name: "LinkedIn", url: null },
  { name: "Instagram", url: null },
];

// SAMPLE: replace with the real e-board meeting schedule.
export const EBOARD_MEETING = {
  title: "E-Board meeting",
  when: "Day and time to be set by the president",
  where: "Location to be set",
};
