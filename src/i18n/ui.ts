export const languages = {
  ar: 'En',
  en: 'ع',
} as const;

export const defaultLang = 'ar' as const;

export const ui = {
  ar: {
    'nav.home': 'الرئيسية',
    'nav.blog': 'المقالات',
    'nav.about': 'عني',
    'nav.projects': 'المشاريع',
    'nav.support': 'ادعمني',
    'blog.recent': 'أحدث المقالات',
    'blog.all': 'جميع المقالات',
    'blog.noPosts': 'لا توجد مقالات حتى الآن.',
    'blog.filter.all': 'الكل',
    'blog.back': '← المقالات',
    'footer.rights': 'جميع الحقوق محفوظة',
    'footer.built': 'مبني بـ Astro + Tailwind',
    'support.bmc': 'اشترِ لي قهوة',
    'support.heading': 'ادعم العمل',
    'support.body': 'إذا أفادتك هذه المقالات أو المشاريع، يسعدني دعمك.',
    'projects.heading': 'المشاريع',
    'projects.stars': 'نجمة',
    'projects.viewAll': 'عرض جميع المشاريع على GitHub',
    'about.title': 'حول',
    'hero.label': '// مهندس برمجيات',
    'hero.title': 'QA Engineering → AI Product',
    'hero.tagline': 'أبني أنظمة جودة مدعومة بالذكاء الاصطناعي، وأطوّر منتجات رقمية تعمل بالفعل.',
    'hero.cta.articles': 'اقرأ المقالات',
    'hero.cta.projects': 'المشاريع',
    'hero.snippet.before': '# قبل: اختبار Selenium يدوي',
    'hero.snippet.after': '# بعد: وكيل اختبار بالذكاء الاصطناعي',
  },
  en: {
    'nav.home': 'Home',
    'nav.blog': 'Articles',
    'nav.about': 'About',
    'nav.projects': 'Projects',
    'nav.support': 'Support',
    'blog.recent': 'Recent articles',
    'blog.all': 'All articles',
    'blog.noPosts': 'No posts yet.',
    'blog.filter.all': 'All',
    'blog.back': '← Articles',
    'footer.rights': 'All rights reserved',
    'footer.built': 'Built with Astro + Tailwind',
    'support.bmc': 'Buy me a coffee',
    'support.heading': 'Support the work',
    'support.body': 'If my articles or projects helped you, I appreciate your support.',
    'projects.heading': 'Projects',
    'projects.stars': 'stars',
    'projects.viewAll': 'View all projects on GitHub',
    'about.title': 'About',
    'hero.label': '// software engineer',
    'hero.title': 'QA Engineering → AI Product',
    'hero.tagline': 'I build AI-augmented quality systems and ship digital products that actually work.',
    'hero.cta.articles': 'Read articles',
    'hero.cta.projects': 'Projects',
    'hero.snippet.before': '# before: manual selenium test',
    'hero.snippet.after': '# after: AI-powered test agent',
  },
} as const;

export type Language = keyof typeof ui;
export type UIKey = keyof typeof ui[typeof defaultLang];

export function useTranslations(lang: Language) {
  return function t(key: UIKey): string {
    return (ui[lang] as Record<string, string>)[key]
      ?? (ui[defaultLang] as Record<string, string>)[key]
      ?? key;
  };
}

export function getLangFromUrl(url: URL): Language {
  const [, first] = url.pathname.split('/');
  if (first === 'en') return 'en';
  return 'ar';
}

export function localePrefix(lang: Language): string {
  return lang === 'ar' ? '' : '/en';
}
