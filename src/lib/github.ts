export interface Repo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
}

const LANG_COLORS: Record<string, string> = {
  Python: '#3572a5',
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Go: '#00add8',
  Rust: '#dea584',
  Vue: '#41b883',
  Astro: '#ff5d01',
};

export function langColor(lang: string | null): string {
  return lang ? (LANG_COLORS[lang] ?? '#8b5cf6') : '#8b5cf6';
}

export async function fetchRepos(username: string, limit = 6): Promise<Repo[]> {
  try {
    const res = await fetch(
      `https://api.github.com/users/${username}/repos?sort=stars&per_page=${limit}&type=public`,
      { headers: { Accept: 'application/vnd.github.v3+json' } }
    );
    if (!res.ok) return [];
    const repos: Repo[] = await res.json();
    return repos.filter(r => !r.name.startsWith('.') && r.name !== username);
  } catch {
    return [];
  }
}
