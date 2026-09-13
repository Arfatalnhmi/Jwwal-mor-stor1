# تشغيل متجر جوال وأكثر محلياً عبر Termux

هذا المشروع مبني باستخدام **React + TypeScript + Express + tRPC + Drizzle + MySQL/TiDB**، وليس Django. لذلك يتم تثبيت الاعتماديات من `package.json` باستخدام pnpm، بينما ملف `requirements.txt` موجود للتوضيح فقط ولا يحتاج إلى تثبيت حزم Python.

## 1. تثبيت الأدوات في Termux

```bash
pkg update -y && pkg upgrade -y
pkg install nodejs git unzip nano -y
corepack enable
corepack prepare pnpm@10.4.1 --activate
node --version
pnpm --version
```

إذا لم يعمل `corepack` استخدم:

```bash
npm install --global pnpm@10.4.1
```

## 2. فك الضغط والدخول للمشروع

```bash
unzip jawwal-more-store-source.zip
cd jawwal-more-store
```

## 3. تثبيت الاعتماديات

```bash
pnpm install
```

لا تنسخ مجلد `node_modules` من جهاز آخر؛ دع pnpm ينشئه محلياً.

## 4. إعداد متغيرات البيئة

أنشئ ملف `.env` في جذر المشروع. لا تضعه داخل الملفات العامة أو ترفعه إلى Git. يحتاج التشغيل المحلي إلى قاعدة بيانات MySQL أو TiDB ومتغيرات Manus OAuth/Storage إذا أردت تسجيل الدخول ورفع الصور.

مثال عام:

```env
DATABASE_URL=mysql://USER:PASSWORD@HOST:3306/DATABASE
JWT_SECRET=ضع_قيمة_عشوائية_طويلة_هنا
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im
OWNER_OPEN_ID=your_owner_open_id
OWNER_NAME=Store Owner
BUILT_IN_FORGE_API_URL=your_server_api_url
BUILT_IN_FORGE_API_KEY=your_server_api_key
VITE_FRONTEND_FORGE_API_URL=your_frontend_api_url
VITE_FRONTEND_FORGE_API_KEY=your_frontend_api_key
```

القيم الحقيقية الموجودة في بيئة Manus لا يتم تضمينها في ملف ZIP لأسباب أمنية. يجب الحصول عليها من إعدادات المشروع أو استبدال OAuth/Storage بتكامل محلي عند الحاجة.

## 5. تجهيز قاعدة البيانات

بعد ضبط `DATABASE_URL` شغّل:

```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

ملفات الهجرات الحالية موجودة داخل مجلد `drizzle/`. إذا كانت قاعدة البيانات جديدة، راجع ملفات SQL ثم طبّقها بالطريقة المناسبة لمزود MySQL/TiDB.

## 6. الفحص والاختبارات

```bash
pnpm check
pnpm test
pnpm build
```

## 7. تشغيل المتجر محلياً

```bash
pnpm dev
```

افتح العنوان الذي يظهر في الطرفية، وغالباً:

```text
http://127.0.0.1:3000
```

للوصول إلى لوحة الإدارة:

```text
http://127.0.0.1:3000/admin
```

لوحة الإدارة محمية وتتطلب تسجيل الدخول بحساب Manus له دور `admin` في قاعدة البيانات.

## 8. تشغيل نسخة الإنتاج محلياً

```bash
pnpm build
pnpm start
```

## أوامر مفيدة

```bash
pnpm format       # تنسيق الملفات
pnpm check        # فحص TypeScript
pnpm test         # تشغيل الاختبارات
pnpm build        # بناء نسخة الإنتاج
```

## ملاحظات مهمة

يحتوي المشروع على خادم واحد يخدم الواجهة وواجهات tRPC. لا تحذف مجلد `drizzle` أو ملفات الهجرات. لا تخزن الصور داخل `client/public`؛ استخدم Manus Storage أو خدمة تخزين محلية/سحابية بديلة. لا تضع مفاتيح API أو كلمات المرور داخل Git أو ملفات عامة.
