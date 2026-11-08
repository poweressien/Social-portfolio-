// Everything about you lives here. Edit this file, nothing else, to change the profile block.

export const profile = {
  name: 'Power Essien',
  brand: 'iNWEKOBONG',
  handle: '@INWEKOBONG',
  github: 'poweressien',
  headline: 'Independent full-stack developer',
  location: 'Nigeria',
  timezone: 'Africa/Lagos',
  whatsapp: '2349037086084',
  email: 'essiengodspower447@gmail.com',

  // Typed one after another in the profile header.
  bio: [
    'Open for connections.',
    'Building web, Android and game products for real users in Nigeria.',
    'Brainstorming ideas that change the world.',
  ],

  // Order here is the order of the buttons.
  socials: [
    { id: 'whatsapp', label: 'WhatsApp', url: 'https://wa.me/2349037086084', icon: 'whatsapp' },
    { id: 'x', label: 'X', url: 'https://x.com/INWEKOBONG', icon: 'x' },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      url: 'https://www.linkedin.com/in/power-essien%E2%98%85%F0%9F%87%B3%F0%9F%87%AC-03a337289',
      icon: 'linkedin',
    },
    { id: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/poweressiien', icon: 'instagram' },
    { id: 'github', label: 'GitHub', url: 'https://github.com/poweressien', icon: 'github' },
    { id: 'telegram', label: 'Telegram', url: 'https://t.me/Inwekobong', icon: 'telegram' },
    { id: 'pinterest', label: 'Pinterest', url: 'https://pin.it/vzupxamLX', icon: 'pinterest' },
    { id: 'email', label: 'Email', url: 'mailto:essiengodspower447@gmail.com', icon: 'mail' },
  ],
};

// Repos you do not want to appear as posts (exact repo names).
export const hiddenRepos = [];

export const waLink = (text) =>
  `https://wa.me/${profile.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
