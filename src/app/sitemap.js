import { createClient } from '@supabase/supabase-js';
import { SITE_URL } from '@/lib/seo';
import { getProjectPath } from '@/lib/project-utils';

export default async function sitemap() {
  const baseUrl = SITE_URL;

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date().toISOString(),
      priority: 1,
      changeFrequency: 'weekly',
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date().toISOString(),
      priority: 0.9,
      changeFrequency: 'weekly',
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date().toISOString(),
      priority: 0.85,
      changeFrequency: 'monthly',
    },
    {
      url: `${baseUrl}/certificates`,
      lastModified: new Date().toISOString(),
      priority: 0.7,
      changeFrequency: 'monthly',
    },
  ];

  // Dynamically fetch all public projects from Supabase
  let projectPages = [];
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (url && key) {
      const supabase = createClient(url, key);
      const { data: projects, error } = await supabase
        .from('projects')
        .select('id, title, slug, updated_at, created_at')
        .neq('status', 'private')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Sitemap: Supabase query error:', error.message);
      } else if (projects) {
        projectPages = projects.map((p) => ({
          url: `${baseUrl}${getProjectPath(p)}`,
          lastModified: p.updated_at || p.created_at || new Date().toISOString(),
          priority: 0.8,
          changeFrequency: 'monthly',
        }));
      }
    }
  } catch (error) {
    // Graceful fallback — static pages still work if DB is unavailable
    console.error('Sitemap: failed to fetch projects', error);
  }

  return [...staticPages, ...projectPages];
}
