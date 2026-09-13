# حزمة تسليم مشروع جوال وأكثر

تحتوي هذه الحزمة على مجلدين مستقلين:

- `jawwal-more-store-code`: كود التطبيق كاملًا، بدون node_modules وdist وملفات الأسرار.
- `jawwal-more-store-scripts`: سكربتات التثبيت والتشغيل والفحص والبناء وترحيل قاعدة البيانات.

## تشغيل سريع

1. ادخل إلى مجلد الكود.
2. انسخ `.env.example` إلى `.env` وأضف القيم السرية.
3. شغّل `../jawwal-more-store-scripts/install.sh`.
4. شغّل `../jawwal-more-store-scripts/check-test-build.sh` للتحقق.
5. شغّل `../jawwal-more-store-scripts/dev.sh` للمعاينة المحلية.

بيانات دخول لوحة التحكم لا تُحفظ داخل الملفات: اسم المستخدم `admin`، وكلمة المرور يجب إدارتها كمتغير سري باسم `ADMIN_PASSWORD`.
