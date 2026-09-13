# سكربتات تشغيل متجر جوال وأكثر

هذه السكربتات منفصلة عن كود التطبيق:

- `install.sh`: تثبيت الاعتماديات.
- `dev.sh`: تشغيل نسخة التطوير محليًا.
- `check-test-build.sh`: فحص TypeScript ثم الاختبارات ثم بناء الإنتاج.
- `db-migrate.sh`: إنشاء/تطبيق ترحيلات قاعدة البيانات.

## المتغيرات المطلوبة

انسخ `.env.example` إلى `.env` أو أضف المتغيرات إلى منصة الاستضافة. لا تضع الأسرار داخل GitHub:

- `DATABASE_URL`
- `JWT_SECRET`
- `VITE_APP_ID`
- `OAUTH_SERVER_URL`
- `OWNER_OPEN_ID`
- `BUILT_IN_FORGE_API_URL`
- `BUILT_IN_FORGE_API_KEY`
- `ADMIN_USERNAME` (القيمة الحالية: `admin`)
- `ADMIN_PASSWORD` (ضعها سرًا في بيئة التشغيل، ولا تحفظها في المستودع)
