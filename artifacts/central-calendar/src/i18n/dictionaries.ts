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
  "common.regional": { en: "Regional", ru: "Регион" },

  // Calendar page
  "calendar.title": { en: "Events on {date}", ru: "События {date}" },
  "calendar.subtitle": {
    en: "Strategic events across Central Asia and the Caucasus",
    ru: "Стратегические события в Центральной Азии и на Кавказе",
  },
  "calendar.allRegions": { en: "All Regions", ru: "Все страны" },
  "calendar.allTopics": { en: "All Topics", ru: "Все темы" },
  "calendar.empty.title": { en: "No events on this date", ru: "Нет событий на эту дату" },
  "calendar.empty.body": {
    en: "Try selecting another day or clearing your filters.",
    ru: "Выберите другой день или сбросьте фильтры.",
  },
  "calendar.featured": { en: "Featured", ru: "Избранное" },

  // Articles
  "articles.title": { en: "Articles & Analysis", ru: "Статьи и аналитика" },
  "articles.subtitle": {
    en: "Editorial coverage, analysis, and briefings on the region.",
    ru: "Редакционные материалы, аналитика и обзоры по региону.",
  },
  "articles.empty": { en: "No articles published yet.", ru: "Пока нет опубликованных статей." },
  "articles.back": { en: "Back to Articles", ru: "Назад к статьям" },
  "articles.notFound": { en: "Article not found", ru: "Статья не найдена" },
  "articles.by": { en: "By {author}", ru: "Автор: {author}" },

  // Online events
  "online.title": { en: "Online Events", ru: "Онлайн-мероприятия" },
  "online.subtitle": {
    en: "Webinars, virtual summits, and hybrid sessions you can join from anywhere in the region.",
    ru: "Вебинары, виртуальные саммиты и гибридные сессии, доступные из любой точки региона.",
  },
  "online.empty": {
    en: "No online events scheduled at the moment.",
    ru: "Пока нет запланированных онлайн-мероприятий.",
  },

  // Submit event
  "submit.title": { en: "Submit an Event", ru: "Подать событие" },
  "submit.subtitle": {
    en: "Help shape the regional calendar. Submissions are reviewed by our editors before publication.",
    ru: "Помогите формировать региональный календарь. Заявки проходят редакторскую проверку перед публикацией.",
  },
  "submit.received.title": { en: "Submission received", ru: "Заявка получена" },
  "submit.received.body": {
    en: "Thank you. Your event is queued for editorial review. We'll publish it on Central Calendar once verified.",
    ru: "Спасибо. Ваше событие поставлено в очередь на редакторскую проверку. Мы опубликуем его после верификации.",
  },
  "submit.another": { en: "Submit another event", ru: "Подать ещё одно событие" },
  "submit.field.title": { en: "Event title *", ru: "Название события *" },
  "submit.field.description": { en: "Description *", ru: "Описание *" },
  "submit.field.country": { en: "Country *", ru: "Страна *" },
  "submit.field.format": { en: "Format *", ru: "Формат *" },
  "submit.field.location": { en: "Location *", ru: "Место проведения *" },
  "submit.field.startDate": { en: "Start date *", ru: "Дата начала *" },
  "submit.field.endDate": { en: "End date (optional)", ru: "Дата окончания (необязательно)" },
  "submit.field.contactEmail": { en: "Contact email *", ru: "Контактный email *" },
  "submit.field.contactEmail.help": {
    en: "Used by editors to verify and follow up. Not published.",
    ru: "Используется редакторами для проверки. Не публикуется.",
  },
  "submit.field.organizerLink": { en: "Official website", ru: "Официальный сайт" },
  "submit.field.coverImage": { en: "Cover image URL", ru: "Ссылка на обложку" },
  "submit.field.tags": { en: "Topics (tags)", ru: "Темы (теги)" },
  "submit.field.country.placeholder": { en: "Select country", ru: "Выберите страну" },
  "submit.field.location.placeholder": { en: "City, venue (or 'Online')", ru: "Город, площадка (или «Онлайн»)" },
  "submit.button": { en: "Submit for review", ru: "Отправить на проверку" },
  "submit.failed": { en: "Submission failed", ru: "Не удалось отправить" },
  "submit.failed.body": { en: "Please try again.", ru: "Пожалуйста, попробуйте ещё раз." },
  "submit.placeholder.title": {
    en: "e.g. Tashkent Energy Forum 2026",
    ru: "напр. Ташкентский энергетический форум 2026",
  },
  "submit.placeholder.description": {
    en: "What is the event about? Who is it for?",
    ru: "О чём событие? Для кого оно?",
  },
  "submit.placeholder.email": { en: "you@organization.com", ru: "you@organization.com" },
  "submit.placeholder.url": { en: "https://...", ru: "https://..." },
  "submit.validation.title": { en: "Title required", ru: "Введите название" },
  "submit.validation.description": {
    en: "Please provide at least a short description",
    ru: "Добавьте хотя бы короткое описание",
  },
  "submit.validation.country": { en: "Country required", ru: "Выберите страну" },
  "submit.validation.startDate": { en: "Start date required", ru: "Укажите дату начала" },
  "submit.validation.location": { en: "Location required", ru: "Укажите место проведения" },
  "submit.validation.url": { en: "Must be a valid URL", ru: "Введите корректный URL" },
  "submit.validation.email": { en: "Valid email required", ru: "Введите корректный email" },

  // About
  "about.tagline": { en: "PLAN THE REGION.", ru: "ПЛАНИРУЙТЕ РЕГИОН." },
  "about.lead": {
    en: "Central Calendar is the definitive strategic coordination platform for Central Asia and the Caucasus.",
    ru: "Central Calendar — главная платформа стратегической координации для Центральной Азии и Кавказа.",
  },
  "about.body1": {
    en: "As the geopolitical center of gravity shifts, Central Asia has emerged as a vital node for global energy, logistics, and investment. However, visibility into high-level strategic events across the region has historically been fragmented.",
    ru: "По мере смещения геополитического центра тяжести Центральная Азия становится ключевым узлом мировой энергетики, логистики и инвестиций. Однако обзорность ключевых стратегических событий региона исторически оставалась фрагментированной.",
  },
  "about.body2": {
    en: "solves this coordination failure. By aggregating major economic forums, bilateral summits, investment conferences, and regional initiatives into a single, authoritative view, we provide the intelligence necessary for governments, corporations, and international institutions to navigate the region effectively.",
    ru: "решает эту проблему координации. Объединяя ключевые экономические форумы, двусторонние саммиты, инвестиционные конференции и региональные инициативы в единое авторитетное представление, мы обеспечиваем аналитику, необходимую правительствам, корпорациям и международным институтам для эффективной работы в регионе.",
  },
  "about.pillar.authoritative.title": { en: "Authoritative", ru: "Авторитетность" },
  "about.pillar.authoritative.body": {
    en: "Verified high-level events curated for institutional and corporate stakeholders.",
    ru: "Проверенные события высокого уровня, отобранные для институциональных и корпоративных участников.",
  },
  "about.pillar.regional.title": { en: "Regional Scope", ru: "Региональный охват" },
  "about.pillar.regional.body": {
    en: "Comprehensive coverage across Uzbekistan, Kazakhstan, Kyrgyzstan, Turkmenistan, and the Caucasus.",
    ru: "Полное покрытие по Узбекистану, Казахстану, Кыргызстану, Туркменистану и Кавказу.",
  },
  "about.pillar.strategic.title": { en: "Strategic Focus", ru: "Стратегический фокус" },
  "about.pillar.strategic.body": {
    en: "Prioritizing events that shape policy, drive investment, and build infrastructure.",
    ru: "Приоритет событиям, формирующим политику, привлекающим инвестиции и развивающим инфраструктуру.",
  },

  // Country page
  "country.subtitle": {
    en: "Strategic events, summits, and forums in {name}.",
    ru: "Стратегические события, саммиты и форумы — {name}.",
  },
  "country.upcoming": { en: "Upcoming & Recent Events", ru: "Ближайшие и недавние события" },
  "country.records": { en: "RECORDS", ru: "ЗАПИСЕЙ" },
  "country.empty": {
    en: "No events currently listed for {name}.",
    ru: "Пока нет событий по стране {name}.",
  },
  "country.others": { en: "Other Nations", ru: "Другие страны" },

  // Cross-border
  "crossBorder.title": { en: "Cross-Border Summits", ru: "Трансграничные саммиты" },
  "crossBorder.subtitle": {
    en: "Multilateral forums, regional coordination meetings, and trans-national initiatives connecting Central Asia and the Caucasus.",
    ru: "Многосторонние форумы, региональные координационные встречи и трансграничные инициативы, объединяющие Центральную Азию и Кавказ.",
  },
  "crossBorder.heading": { en: "Multilateral Initiatives", ru: "Многосторонние инициативы" },
  "crossBorder.empty": {
    en: "No cross-border events currently listed.",
    ru: "Сейчас нет трансграничных событий.",
  },
  "crossBorder.members": { en: "Member Nations", ru: "Страны-участники" },

  // Event detail
  "event.notFound": { en: "Event Not Found", ru: "Событие не найдено" },
  "event.notFound.body": {
    en: "The event you are looking for does not exist or has been removed.",
    ru: "Запрашиваемое событие не существует или было удалено.",
  },
  "event.return": { en: "Return to Calendar", ru: "Вернуться в календарь" },
  "event.back": { en: "Back to Overview", ru: "К общему списку" },
  "event.featuredSummit": { en: "Featured Summit", ru: "Главный саммит" },
  "event.concluded": { en: "Concluded", ru: "Завершено" },
  "event.date": { en: "Date", ru: "Дата" },
  "event.location": { en: "Location", ru: "Место" },
  "event.dateTo": { en: "to {date}", ru: "по {date}" },
  "event.about": { en: "About the Event", ru: "О событии" },
  "event.participation": { en: "Participation", ru: "Участие" },
  "event.officialSite": { en: "Official Website", ru: "Официальный сайт" },
  "event.registrationClosed": { en: "Registration Closed", ru: "Регистрация закрыта" },
  "event.officialNote": {
    en: "Links lead to the official organizer's platform. Central Calendar is not responsible for registration.",
    ru: "Ссылки ведут на официальную платформу организатора. Central Calendar не несёт ответственности за регистрацию.",
  },
  "event.sectors": { en: "Sectors", ru: "Сектора" },
  "event.related": { en: "Related Summits", ru: "Похожие события" },
  "event.until": { en: "Until {date}", ru: "До {date}" },
};
