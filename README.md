AI Golden — Static site

What's included
- `index.html` — main site (Persian / RTL)
- `css/style.css` — theme, responsive layout, utilities
- `js/script.js` — interactivity: theme toggle, navigation, modals, search, filtering
- `robots.txt` — allows indexing and points to `sitemap.xml`

SEO & Accessibility changes made
- Added meta robots, keywords, OpenGraph, Twitter Card tags
- Added JSON-LD for Organization and WebSite
- Added hreflang entries
- Added canonical link
- Added an accessible category filter and deep-linking via `?category=` URL param
- Added lazy-loading for images (via `loading="lazy"` in JS), improved focus styles and keyboard support

How to test locally
1. Serve the folder (simple):

```bash
python3 -m http.server 8000
```

2. Open http://localhost:8000 in your browser and verify:
- Theme toggle works and is persisted
- Category filter shows/hides tools and updates URL
- Search (Ctrl/Cmd+K) opens overlay and finds tools
- Modals open for tool cards (click "مشاهده ابزار")

Next recommended steps (optional)
- Replace placeholder `href` values with real absolute URLs when deploying.
- Add more pages (category landing pages) and update `sitemap.xml` with full URLs.
- Add server-side compression and caching headers on your hosting platform.
- Integrate Google Search Console and submit sitemap.
- Consider creating separate pages per tool (best for SEO) with unique titles/descriptions and internal linking.

If you want, I can:
- generate individual detail pages for each tool (SEO-friendly URLs + meta tags)
- create an expanded sitemap.xml with full URLs
- add Schema.org/Product or Service markup for each service page

Tell me which of the optional tasks you'd like next.

Google Search Console / Re-indexing (recommended steps)
- If این سایت را قبلاً در Google Search Console داشته‌ای، بعد از اینکه تغییرات را منتشر کردی، این کارها را انجام بده:
	1) به حساب Google Search Console وارد شو؛ اگر مالکیت سایت را قبلاً تایید کرده‌ای که عالی است.
	2) در بخش "Sitemaps" آدرس `https://aigolden.pages.dev/sitemap.xml` را ثبت یا دوباره Submit کن.
	3) در بخش URL Inspection یک یا چند URL مهم را بررسی کن و روی "Request Indexing" کلیک کن تا گوگل سریع‌تر صفحات جدید را بخواند.
	4) در صورت تغییر دامنه (مثلاً اگر دامنه اصلی متفاوت است) تنظیمات Preferred domain و Verified property را بررسی کن و sitemap را با دامنه جدید ارسال کن.

اگر دوست داشته باشی من می‌تونم این مراحل (تولید sitemap با صفحات کامل و آماده‌سازی فایل برای ارسال) رو کامل انجام بدم؛ فقط بگو آیا می‌خوای از دامنه `https://aigolden.pages.dev/` استفاده کنم یا دامنه خودت (اگه دامنه‌ت رو بدی من canonical و sitemap را با آن بروز می‌کنم).

```
ai-tools-persian-pro/
├── index.html              # صفحه اصلی
├── css/
│   └── style.css          # استایل‌های CSS پیشرفته
├── js/
│   └── script.js          # عملکردهای JavaScript
├── images/
│   └── mylogo.png         # لوگوی AI Golden
└── README.md              # این فایل
```
