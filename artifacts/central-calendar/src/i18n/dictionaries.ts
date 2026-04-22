export type Lang = "en" | "ru";

export const DICTIONARIES: Record<string, { en: string; ru: string }> = {
  // Header / nav
  "nav.home": { en: "Home", ru: "Главная" },
  "nav.countries": { en: "Countries", ru: "Страны" },
  "nav.calendar": { en: "Calendar", ru: "Календарь" },
  "nav.online": { en: "Online", ru: "Онлайн" },
  "nav.articles": { en: "Articles", ru: "Статьи" },
  "nav.submit": { en: "Submit Event", ru: "Подать событие" },
  "nav.about": { en: "About", ru: "О нас" },
  "nav.uzbekistan": { en: "Uzbekistan", ru: "Узбекистан" },
  "nav.kazakhstan": { en: "Kazakhstan", ru: "Казахстан" },
  "nav.kyrgyzstan": { en: "Kyrgyzstan", ru: "Кыргызстан" },
  "nav.turkmenistan": { en: "Turkmenistan", ru: "Туркменистан" },
  "nav.caucasus": { en: "Caucasus", ru: "Кавказ" },
  "nav.crossBorder": { en: "Cross-Border", ru: "Трансграничные" },
  "nav.search": { en: "Search events...", ru: "Поиск событий..." },

  // Footer
  "footer.tagline": {
    en: "Strategic coordination intelligence for Central Asia and the Caucasus.",
    ru: "Стратегическая координационная аналитика для Центральной Азии и Кавказа.",
  },
  "footer.explore": { en: "Explore", ru: "Разделы" },
  "footer.region": { en: "Region", ru: "Регион" },
  "footer.contact": { en: "Contact", ru: "Контакты" },
  "footer.copyright": {
    en: "© Central Calendar. Plan the region.",
    ru: "© Central Calendar. Планируйте регион.",
  },

  // Hero / Home
  "hero.eyebrow": { en: "Central Asia · Caucasus", ru: "Центральная Азия · Кавказ" },
  "hero.tagline": { en: "Plan the region.", ru: "Планируйте регион." },
  "hero.subtitle": {
    en: "The strategic coordination intelligence platform for high-level government, corporate, and institutional events across the region.",
    ru: "Платформа стратегической координации для высокоуровневых государственных, корпоративных и институциональных событий региона.",
  },
  "hero.browse": { en: "Browse Calendar", ru: "Открыть календарь" },
  "hero.submit": { en: "Submit Event", ru: "Подать событие" },

  // Filters
  "filter.title": { en: "Filters", ru: "Фильтры" },
  "filter.country": { en: "Country", ru: "Страна" },
  "filter.tag": { en: "Sector", ru: "Сектор" },
  "filter.format": { en: "Format", ru: "Формат" },
  "filter.format.all": { en: "All formats", ru: "Все форматы" },
  "filter.format.offline": { en: "In-person", ru: "Очно" },
  "filter.format.online": { en: "Online", ru: "Онлайн" },
  "filter.format.hybrid": { en: "Hybrid", ru: "Гибрид" },
  "filter.clear": { en: "Clear filters", ru: "Сбросить" },
  "filter.all": { en: "All", ru: "Все" },

  // Listings
  "events.upcoming": { en: "Upcoming events", ru: "Ближайшие события" },
  "events.featured": { en: "Featured", ru: "Избранное" },
  "events.none": { en: "No events match your filters.", ru: "Нет событий по выбранным фильтрам." },
  "events.viewDetails": { en: "View details", ru: "Подробнее" },
  "events.register": { en: "Register", ru: "Регистрация" },

  // Common
  "common.loading": { en: "Loading...", ru: "Загрузка..." },
  "common.error": { en: "Something went wrong.", ru: "Что-то пошло не так." },
  "common.language": { en: "Language", ru: "Язык" },
  "common.en": { en: "English", ru: "Английский" },
  "common.ru": { en: "Russian", ru: "Русский" },
};
