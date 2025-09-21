
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

### محتوای وب‌سایت

#### منوی ناوبری
- **ابزارهای هوش مصنوعی**:
  - ابزار تولید و ادیت عکس
  - ابزار ساخت ویدیو با veo3
  - ابزار تغییر صدا و ساخت مدل RVC
  - ابزار ساخت آهنگ و موزیک
  - ابزار متن به صدا
  - ابزار استخراج
  - ابزار ساخت پرامپت
  - ابزار دوبله ویدیو

- **خدمات**:
  - سفارش مدل صدای RVC
  - سفارش دوبله ویدیو

- **شبکه‌های اجتماعی**:
  - کانال یوتیوب: @aigolden
  - کانال تلگرام: ai_golden

- **تماس با ما**:
  - ربات پشتیبانی: aigolden_qbot

### ویژگی‌های تعاملی

#### جستجوی پیشرفته
- فعال‌سازی با کلید میانبر `Ctrl+K` یا `Cmd+K`
- جستجو در نام، توضیحات و تگ‌های ابزارها
- نمایش نتایج به صورت زنده

#### انیمیشن‌ها و تعاملات
- انیمیشن‌های ورود عناصر هنگام اسکرول
- افکت‌های hover پیشرفته با تبدیل 3D
- افکت ripple هنگام کلیک
- انیمیشن‌های parallax برای پس‌زمینه

#### ناوبری موبایل
- منوی همبرگری واکنش‌گرا
- منوهای dropdown برای موبایل
- بستن خودکار منو هنگام کلیک

### نحوه استفاده

#### مشاهده محلی
```bash
# فایل index.html را در مرورگر باز کنید
open index.html
```

#### آپلود به سرور
1. تمام فایل‌ها را به سرور وب آپلود کنید
2. اطمینان حاصل کنید که `index.html` در root directory قرار دارد
3. وب‌سایت آماده استفاده است

### پلتفرم‌های پشتیبانی‌شده

- **Netlify**: آپلود مستقیم پوشه یا اتصال به Git
- **Vercel**: پشتیبانی کامل از فایل‌های استاتیک
- **GitHub Pages**: قابل استفاده با repository
- **سرورهای معمولی**: Apache, Nginx, IIS
- **CDN**: CloudFlare, AWS CloudFront

### تنظیمات اضافی

#### فونت فارسی
وب‌سایت از فونت Vazirmatn از Google Fonts استفاده می‌کند:
```css
@import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700&display=swap');
```

#### بهینه‌سازی عملکرد
- Lazy loading برای تصاویر
- Preload برای منابع حیاتی
- Minification CSS و JavaScript
- Compression فایل‌ها

### سفارشی‌سازی

#### تغییر رنگ‌ها
رنگ‌های اصلی در فایل CSS تعریف شده‌اند:
```css
/* رنگ‌های اصلی */
:root {
  --primary-blue: #3b82f6;
  --primary-purple: #8b5cf6;
  --background-dark: #0a0a0f;
  --text-light: #e2e8f0;
  --accent-cyan: #06b6d4;
}
```

#### اضافه کردن ابزار جدید
1. کپی کردن ساختار یک کارت موجود در HTML
2. تغییر محتوای کارت (نام، توضیحات، تگ‌ها، لینک)
3. اضافه کردن لوگوی ابزار در پوشه images
4. تست عملکرد جستجو

#### تغییر لینک‌های شبکه‌های اجتماعی
در فایل HTML، بخش social media را ویرایش کنید:
```html
<a href="https://www.youtube.com/@YOUR_CHANNEL" target="_blank">
<a href="https://t.me/YOUR_CHANNEL" target="_blank">
```

### پشتیبانی مرورگرها

- Chrome 70+
- Firefox 65+
- Safari 13+
- Edge 79+
- Opera 60+

### عملکرد و بهینه‌سازی

#### سرعت بارگذاری
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1

#### SEO
- Meta tags بهینه‌شده
- Structured data
- Semantic HTML
- Alt texts برای تصاویر

### امنیت

- HTTPS اجباری
- Content Security Policy
- XSS Protection
- محافظت از CSRF

### پشتیبانی و نگهداری

#### به‌روزرسانی محتوا
- اضافه کردن ابزارهای جدید
- به‌روزرسانی لینک‌ها
- بهبود عملکرد

#### مانیتورینگ
- Google Analytics
- Performance monitoring
- Error tracking

### مجوز

این پروژه تحت مجوز MIT منتشر شده است.

### تماس و پشتیبانی

- **کانال یوتیوب**: [@aigolden](https://www.youtube.com/@aigolden)
- **کانال تلگرام**: [ai_golden](https://t.me/ai_golden)
- **ربات پشتیبانی**: [aigolden_qbot](https://t.me/aigolden_qbot)

---

**نکته مهم**: این وب‌سایت کاملاً استاتیک و خودکفا است و نیازی به سرور backend یا پایگاه داده ندارد. تمام عملکردها با HTML، CSS و JavaScript خالص پیاده‌سازی شده‌اند.
