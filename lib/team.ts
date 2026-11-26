// About page team. PLACEHOLDERS: replace each name, role and bio with the real details.
// For a photo, add a portrait (about 4:5, e.g. 800x1000) to public/assets/team/ and set `image`
// to its path, e.g. '/assets/team/jane-smith.jpg'. Without an image the card shows a placeholder.

export type TeamMember = {
  name: string;
  role: string;
  bio: string;
  image?: string;
  /** Placeholder colour (any of the site's pastels). */
  accent: string;
};

export type TeamGroup = { id: string; title: string; intro: string; members: TeamMember[] };

export const teamGroups: TeamGroup[] = [
  {
    id: 'core',
    title: 'Core team',
    intro: 'Sets the direction, shapes each project and stays your main point of contact.',
    members: [
      { name: 'Team member', role: 'Founder & director', bio: 'Sets the direction and makes sure every project fits the bigger picture.', accent: '#b3a8ff' },
      { name: 'Team member', role: 'Head of design', bio: 'Leads brand, interface and experience design from first sketch to launch.', accent: '#ffb38a' },
      { name: 'Team member', role: 'Client partner', bio: 'Keeps projects on track and makes sure you always know what happens next.', accent: '#9fe6b8' },
    ],
  },
  {
    id: 'development',
    title: 'Development team',
    intro: 'Builds, tests and looks after the websites, apps and systems we deliver.',
    members: [
      { name: 'Team member', role: 'Lead developer', bio: 'Plans the architecture and keeps the code sound, secure and easy to grow.', accent: '#8fd3e8' },
      { name: 'Team member', role: 'Full-stack developer', bio: 'Builds features end to end, from the database to the screen.', accent: '#f5a8d4' },
      { name: 'Team member', role: 'Front-end developer', bio: 'Turns designs into fast, accessible pages that work on every device.', accent: '#86b4ff' },
    ],
  },
];
