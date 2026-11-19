// Live profile data from GitHub, so the README follows whatever is on the
// profile: name, bio, website, social links, pinned repos and languages.

export async function fetchProfile(login, token) {
  const query = `query($login:String!){user(login:$login){
    name login bio websiteUrl
    socialAccounts(first:10){nodes{provider displayName url}}
    pinnedItems(first:6,types:REPOSITORY){nodes{... on Repository{
      name nameWithOwner description url stargazerCount isFork primaryLanguage{name color}}}}
    repositories(first:100,ownerAffiliations:OWNER,privacy:PUBLIC,orderBy:{field:PUSHED_AT,direction:DESC}){nodes{
      name nameWithOwner description url stargazerCount isFork pushedAt primaryLanguage{name color}}}
  }}`;
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'pixel-farm' },
    body: JSON.stringify({ query, variables: { login } }),
  });
  const json = await res.json();
  if (!res.ok || json.errors) throw new Error(`GitHub API error: ${JSON.stringify(json.errors || json)}`);
  const u = json.data.user;
  const repo = (r) => ({
    name: r.name, full: r.nameWithOwner, description: r.description || '', url: r.url, stars: r.stargazerCount,
    fork: r.isFork, language: r.primaryLanguage?.name || null, color: r.primaryLanguage?.color || '#8a8a8a',
  });
  return {
    name: u.name || u.login, login: u.login, bio: u.bio || '', website: u.websiteUrl || '',
    socials: u.socialAccounts.nodes.map((s) => ({ provider: s.provider, name: s.displayName, url: s.url })),
    pinned: u.pinnedItems.nodes.filter(Boolean).map(repo),
    repos: u.repositories.nodes.map(repo),
  };
}

/** Offline stand-in with the same shape (used for local previews). */
export function sampleProfile(login = 'Feliciety02') {
  const r = (name, language, color, description = '', fork = false) => ({
    name, full: `${login}/${name}`, description, url: `https://github.com/${login}/${name}`, stars: 0, fork, language, color,
  });
  const repos = [
    r('cs24-lab1', 'Python', '#3572A5'), r('UMunity-Organization-Management-System-V.2', 'TypeScript', '#3178c6'),
    r('ThesisTracker', 'HTML', '#e34c26'), r('Banana-Leaf-Disease-Scanner', 'Python', '#3572A5', 'AI-powered banana leaf disease scanner using MobileNetV3, self-supervised learning, knowledge distillation, and Coordinate Attention for mobile-based disease classification.'),
    r('AIVERA-pro', 'TypeScript', '#3178c6'), r('AIVERA-lite', 'TypeScript', '#3178c6'), r('START-Davao-Chapter', 'JavaScript', '#f1e05a'),
    r('UMERCH3.0', 'JavaScript', '#f1e05a'), r('Educational-Tour-Solicitation', 'TypeScript', '#3178c6'), r('Pietyl-LPG-Management-System', 'Vue', '#41b883'),
    r('Facebook-FriendList-Rehab', 'JavaScript', '#f1e05a', 'A privacy-first Chrome extension for reviewing inactive Facebook friends using visible activity, mutual friends, and safety-based filtering.'),
    r('UM-GWA-Calculator-Extension', 'JavaScript', '#f1e05a', 'Automatic UM SPR GWA calculation based on your final grades and units.'),
    r('Malasarte-Portfolio', 'TypeScript', '#3178c6'), r('Jupyter-Notebook-Compilation', 'Jupyter Notebook', '#DA5B0B'),
    r('Rice-Yield-Simulator', 'Python', '#3572A5'), r('Jeopardy-Game', 'TypeScript', '#3178c6'), r('Parking-Lot-System-CS15-Dart', 'Dart', '#00B4AB'),
    r('Malasarte_Feanne_LabExam', 'PHP', '#4F5D95'), r('Automated-Parking-Lot-System', 'Python', '#3572A5'),
    r('Handyman-Tools-and-Services', 'Java', '#b07219', '', true), r('Sakuragi-Tailoring-Sales-and-Inventory-Management', 'PHP', '#4F5D95', '', true),
  ];
  return {
    name: 'Fe Anne', login,
    bio: 'BS Computer Science Student @ University of Mindanao 💻 UI/UX Designer • Web Developer • Creative Volunteer Building digital experiences & community-drive',
    website: '',
    socials: [
      { provider: 'FACEBOOK', name: 'feanneLM', url: 'https://www.facebook.com/feanneLM' },
      { provider: 'LINKEDIN', name: 'in/fe-anne-malasarte-2a492a322', url: 'https://www.linkedin.com/in/fe-anne-malasarte-2a492a322/' },
      { provider: 'INSTAGRAM', name: 'feli_ciety', url: 'https://www.instagram.com/feli_ciety/' },
    ],
    pinned: ['Banana-Leaf-Disease-Scanner', 'AIVERA-lite', 'Facebook-FriendList-Rehab', 'UM-GWA-Calculator-Extension', 'Jeopardy-Game', 'Automated-Parking-Lot-System'].map((n) => repos.find((r) => r.name === n)),
    repos,
  };
}

/** Language tally over the user's own (non-fork) repos, most used first. */
export function languages(profile) {
  const tally = new Map();
  profile.repos.filter((r) => !r.fork && r.language).forEach((r) => {
    const t = tally.get(r.language) || { name: r.language, color: r.color, count: 0 };
    t.count++;
    tally.set(r.language, t);
  });
  return [...tally.values()].sort((a, b) => b.count - a.count);
}
