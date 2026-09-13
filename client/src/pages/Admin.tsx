import { useState } from "react";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { ArrowRight, CheckCircle2, GripVertical, ImageOff, ImagePlus, Images, LockKeyhole, PackagePlus, Plus, RefreshCw, ShieldAlert, Trash2, UserRound, X } from "lucide-react";

const fallbackImage = "/manus-storage/iphone_5cd46860.jpg";

async function compressImage(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const maxSize = 1600;
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) return file;
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const watermark = "جوال وأكثر | JAWAL & MORE";
  const padding = Math.max(14, Math.round(canvas.width * 0.018));
  const fontSize = Math.max(14, Math.round(canvas.width * 0.022));
  context.font = `700 ${fontSize}px Arial`;
  const watermarkWidth = context.measureText(watermark).width;
  context.fillStyle = "rgba(10, 22, 58, 0.72)";
  context.fillRect(canvas.width - watermarkWidth - padding * 2, canvas.height - fontSize - padding * 1.8, watermarkWidth + padding * 2, fontSize + padding);
  context.fillStyle = "rgba(255, 212, 90, 0.96)";
  context.fillText(watermark, canvas.width - watermarkWidth - padding, canvas.height - padding);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82));
  if (!blob) return file;
  return new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg", lastModified: Date.now() });
}

function parseGallery(value: string | null | undefined): string[] {
  if (!value) return [];
  try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : []; } catch { return []; }
}

function GalleryEditor({ productId, gallery, onReorder, onDelete }: { productId: number; gallery: string[]; onReorder: (gallery: string[]) => void; onDelete: (index: number) => void }) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  return <tr className="bg-[#fbfaf8]"><td colSpan={6} className="p-4"><div className="mb-3 flex items-center justify-between"><p className="text-xs font-black text-[#14214a]">معرض الصور · اسحب الصور لترتيبها</p><span className="text-[10px] text-[#858a96]">{gallery.length}/8 صور</span></div>{gallery.length ? <div className="flex flex-wrap gap-3">{gallery.map((image, index) => <div key={image} draggable onDragStart={() => setDraggedIndex(index)} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (draggedIndex !== null) { const reordered = [...gallery]; const [moved] = reordered.splice(draggedIndex, 1); reordered.splice(index, 0, moved); onReorder(reordered); setDraggedIndex(null); } }} className="group relative cursor-grab rounded-xl border border-[#e4e1db] bg-white p-1 active:cursor-grabbing"><GripVertical className="absolute right-1 top-1 z-10 h-4 w-4 rounded bg-white/90 p-0.5 text-[#14214a]" /><img src={image} alt={`صورة ${index + 1}`} className="h-20 w-20 rounded-lg object-cover" /><button onClick={() => onDelete(index)} className="absolute bottom-1 left-1 rounded-md bg-white/90 p-1 text-[#c43d4b] opacity-0 transition group-hover:opacity-100" title="حذف صورة المعرض"><ImageOff className="h-3.5 w-3.5" /></button><span className="absolute bottom-1 right-1 rounded bg-[#14214a]/80 px-1 text-[9px] font-bold text-white">{index + 1}</span></div>)}</div> : <p className="rounded-xl border border-dashed border-[#dcd8d0] p-4 text-center text-[11px] text-[#858a96]">لم تتم إضافة صور إضافية بعد. استخدم أيقونة المعرض لإضافة صور.</p>}</td></tr>;
}

export default function AdminConsole() {
  const { user, loading, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const brandsQuery = trpc.catalog.brands.useQuery();
  const categoriesQuery = trpc.catalog.categories.useQuery();
  const canManage = Boolean(user?.role === "admin");
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const localLogin = trpc.auth.localLogin.useMutation({
    onSuccess: () => window.location.reload(),
    onError: (error) => setLoginError(error.message),
  });
  const productsQuery = trpc.catalog.adminProducts.useQuery(undefined, { enabled: canManage });
  const [notice, setNotice] = useState("");
  const [brandName, setBrandName] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [form, setForm] = useState({ sku: "", slug: "", name: "", brandId: "", categoryId: "", condition: "new" as "new" | "used", price: "", stock: "", specs: "", imageUrl: fallbackImage });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState(fallbackImage);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [replacingProductId, setReplacingProductId] = useState<number | null>(null);
  const [expandedGalleryId, setExpandedGalleryId] = useState<number | null>(null);
  const [draggedGalleryIndex, setDraggedGalleryIndex] = useState<number | null>(null);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  };

  const createBrand = trpc.catalog.createBrand.useMutation({
    onSuccess: async () => { setBrandName(""); await utils.catalog.brands.invalidate(); showNotice("تمت إضافة الماركة"); },
    onError: (error) => showNotice(error.message),
  });
  const createCategory = trpc.catalog.createCategory.useMutation({
    onSuccess: async () => { setCategoryName(""); await utils.catalog.categories.invalidate(); showNotice("تمت إضافة التصنيف"); },
    onError: (error) => showNotice(error.message),
  });
  const updateBrand = trpc.catalog.updateBrand.useMutation({ onSuccess: async () => { await utils.catalog.brands.invalidate(); showNotice("تم تحديث الماركة"); }, onError: (error) => showNotice(error.message) });
  const updateCategory = trpc.catalog.updateCategory.useMutation({ onSuccess: async () => { await utils.catalog.categories.invalidate(); showNotice("تم تحديث التصنيف"); }, onError: (error) => showNotice(error.message) });
  const deleteBrand = trpc.catalog.deleteBrand.useMutation({ onSuccess: async () => { await utils.catalog.brands.invalidate(); showNotice("تم حذف الماركة"); }, onError: (error) => showNotice(error.message) });
  const deleteCategory = trpc.catalog.deleteCategory.useMutation({ onSuccess: async () => { await utils.catalog.categories.invalidate(); showNotice("تم حذف التصنيف"); }, onError: (error) => showNotice(error.message) });
  const createProduct = trpc.catalog.createProduct.useMutation({
    onSuccess: async () => { await utils.catalog.adminProducts.invalidate(); setForm({ sku: "", slug: "", name: "", brandId: "", categoryId: "", condition: "new", price: "", stock: "", specs: "", imageUrl: fallbackImage }); setSelectedImage(null); setSelectedImages([]); setImagePreview(fallbackImage); showNotice("تمت إضافة المنتج إلى المخزون"); },
    onError: (error) => showNotice(error.message),
  });
  const updateStock = trpc.catalog.updateStock.useMutation({ onSuccess: async () => { await utils.catalog.adminProducts.invalidate(); showNotice("تم تحديث المخزون"); } });
  const updateProduct = trpc.catalog.updateProduct.useMutation({ onSuccess: async () => { await utils.catalog.adminProducts.invalidate(); setEditingProductId(null); showNotice("تم تحديث المنتج"); }, onError: (error) => showNotice(error.message) });
  const updateProductImage = trpc.catalog.updateProductImage.useMutation({ onSuccess: async (_data, variables) => { await utils.catalog.adminProducts.invalidate(); setReplacingProductId(null); showNotice(variables.imageUrl ? "تم استبدال صورة المنتج" : "تم حذف صورة المنتج"); }, onError: (error) => { setReplacingProductId(null); showNotice(error.message); } });
  const updateProductGallery = trpc.catalog.updateProductGallery.useMutation({ onSuccess: async () => { await utils.catalog.adminProducts.invalidate(); setReplacingProductId(null); showNotice("تم تحديث معرض الصور"); }, onError: (error) => { setReplacingProductId(null); showNotice(error.message); } });
  const deleteProduct = trpc.catalog.deleteProduct.useMutation({ onSuccess: async () => { await utils.catalog.adminProducts.invalidate(); showNotice("تم حذف المنتج"); } });

  const chooseImage = (file: File | undefined) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { showNotice("اختر صورة JPG أو PNG أو WebP"); return; }
    if (file.size > 10 * 1024 * 1024) { showNotice("حجم الصورة يجب ألا يتجاوز 10MB"); return; }
    setSelectedImage(file);
    setSelectedImages([file]);
    setImagePreview(URL.createObjectURL(file));
  };
  const chooseImages = (files: FileList | null) => {
    const picked = Array.from(files ?? []).slice(0, 8);
    const valid = picked.filter((file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type) && file.size <= 10 * 1024 * 1024);
    if (valid.length !== picked.length) showNotice("تم تجاهل الصور غير المدعومة أو الأكبر من 10MB");
    if (!valid.length) return;
    setSelectedImages(valid);
    setSelectedImage(valid[0]);
    setImagePreview(URL.createObjectURL(valid[0]));
  };
  const uploadImage = async () => {
    if (!selectedImage) return form.imageUrl;
    setUploadingImage(true);
    try {
      const compressedImage = await compressImage(selectedImage);
      const response = await fetch("/api/admin/upload-image", { method: "POST", credentials: "include", headers: { "Content-Type": compressedImage.type, "X-File-Name": compressedImage.name }, body: compressedImage });
      const payload = await response.json() as { url?: string; error?: string };
      if (!response.ok || !payload.url) throw new Error(payload.error || "تعذر رفع الصورة");
      setForm((current) => ({ ...current, imageUrl: payload.url! }));
      setSelectedImage(null);
      showNotice("تم رفع الصورة بنجاح");
      return payload.url;
    } catch (error) { showNotice(error instanceof Error ? error.message : "تعذر رفع الصورة"); return null; }
    finally { setUploadingImage(false); }
  };
  const uploadAdditionalImages = async (files: File[]) => {
    const urls: string[] = [];
    for (const file of files.slice(1, 8)) {
      const compressedImage = await compressImage(file);
      const response = await fetch("/api/admin/upload-image", { method: "POST", credentials: "include", headers: { "Content-Type": compressedImage.type, "X-File-Name": compressedImage.name }, body: compressedImage });
      const payload = await response.json() as { url?: string; error?: string };
      if (!response.ok || !payload.url) throw new Error(payload.error || "تعذر رفع إحدى صور المعرض");
      urls.push(payload.url);
    }
    return urls;
  };
  const replaceProductImage = async (productId: number, file: File | undefined) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { showNotice("اختر صورة JPG أو PNG أو WebP"); return; }
    if (file.size > 10 * 1024 * 1024) { showNotice("حجم الصورة يجب ألا يتجاوز 10MB"); return; }
    setReplacingProductId(productId);
    try {
      const compressedImage = await compressImage(file);
      const response = await fetch("/api/admin/upload-image", { method: "POST", credentials: "include", headers: { "Content-Type": compressedImage.type, "X-File-Name": compressedImage.name }, body: compressedImage });
      const payload = await response.json() as { url?: string; error?: string };
      if (!response.ok || !payload.url) throw new Error(payload.error || "تعذر رفع الصورة");
      updateProductImage.mutate({ id: productId, imageUrl: payload.url });
    } catch (error) { setReplacingProductId(null); showNotice(error instanceof Error ? error.message : "تعذر رفع الصورة"); }
  };
  const clearProductImage = (productId: number) => {
    if (window.confirm("هل تريد حذف صورة هذا المنتج؟ سيبقى المنتج موجوداً ويمكنك رفع صورة جديدة لاحقاً.")) updateProductImage.mutate({ id: productId, imageUrl: null });
  };
  const uploadGalleryImages = async (productId: number, files: FileList | null, currentGallery: string[]) => {
    if (!files?.length) return;
    const remaining = Math.max(0, 8 - currentGallery.length);
    if (!remaining) { showNotice("يمكن إضافة 8 صور كحد أقصى"); return; }
    setReplacingProductId(productId);
    try {
      const uploadedUrls: string[] = [];
      for (const file of Array.from(files).slice(0, remaining)) {
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) continue;
        const compressedImage = await compressImage(file);
        const response = await fetch("/api/admin/upload-image", { method: "POST", credentials: "include", headers: { "Content-Type": compressedImage.type, "X-File-Name": compressedImage.name }, body: compressedImage });
        const payload = await response.json() as { url?: string; error?: string };
        if (!response.ok || !payload.url) throw new Error(payload.error || "تعذر رفع إحدى الصور");
        uploadedUrls.push(payload.url);
      }
      if (!uploadedUrls.length) throw new Error("لم يتم اختيار صور مدعومة");
      updateProductGallery.mutate({ id: productId, galleryUrls: [...currentGallery, ...uploadedUrls].slice(0, 8) });
    } catch (error) { setReplacingProductId(null); showNotice(error instanceof Error ? error.message : "تعذر رفع المعرض"); }
  };
  const reorderGallery = (productId: number, gallery: string[], from: number, to: number) => {
    if (from === to) return;
    const reordered = [...gallery];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    updateProductGallery.mutate({ id: productId, galleryUrls: reordered });
    setDraggedGalleryIndex(null);
  };
  const deleteGalleryImage = (productId: number, gallery: string[], index: number) => {
    if (!window.confirm("هل تريد حذف هذه الصورة من المعرض؟")) return;
    updateProductGallery.mutate({ id: productId, galleryUrls: gallery.filter((_, itemIndex) => itemIndex !== index) });
  };

  if (loading) return <AdminShell><div className="flex items-center justify-center py-24 text-sm font-bold text-[#858a96]"><RefreshCw className="ml-2 h-4 w-4 animate-spin" />جاري التحقق من صلاحيات الدخول...</div></AdminShell>;
  if (!isAuthenticated) return <AdminShell><LocalLoginCard username={loginUsername} password={loginPassword} error={loginError} pending={localLogin.isPending} onUsername={setLoginUsername} onPassword={setLoginPassword} onSubmit={() => { setLoginError(""); localLogin.mutate({ username: loginUsername, password: loginPassword }); }} onManusLogin={() => startLogin()} /></AdminShell>;
  if (!canManage) return <AdminShell><LocalLoginCard username={loginUsername} password={loginPassword} error={loginError || "الحساب الحالي ليس مديراً. استخدم بيانات دخول admin الخاصة بالمتجر."} pending={localLogin.isPending} onUsername={setLoginUsername} onPassword={setLoginPassword} onSubmit={() => { setLoginError(""); localLogin.mutate({ username: loginUsername, password: loginPassword }); }} onManusLogin={() => startLogin()} /></AdminShell>;

  const brands = brandsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const catalogProducts = productsQuery.data ?? [];
  const submitProduct = () => {
    if (!form.sku || !form.slug || !form.name || !form.brandId || !form.categoryId || !form.price || form.stock === "") {
      showNotice("أكمل الحقول الأساسية للمنتج أولاً");
      return;
    }
    void uploadImage().then((uploadedImage) => {
      if (uploadedImage === null) return;
      uploadAdditionalImages(selectedImages).then((galleryUrls) => createProduct.mutate({ sku: form.sku, slug: form.slug, name: form.name, brandId: Number(form.brandId), categoryId: Number(form.categoryId), condition: form.condition, price: Number(form.price), stock: Number(form.stock), specs: form.specs.trim() || undefined, imageUrl: uploadedImage || form.imageUrl || fallbackImage, galleryUrls, warrantyMonths: 12 })).catch((error) => showNotice(error instanceof Error ? error.message : "تعذر رفع المعرض"));
    });
  };

  return <AdminShell>
    <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="mb-2 text-xs font-black tracking-[0.2em] text-[#c9921a]">منطقة محمية</p><h1 className="text-3xl font-black text-[#14214a]">إدارة الكتالوج والمخزون</h1><p className="mt-2 text-sm text-[#858a96]">مرحباً {user?.name || user?.email || "بك"} · صلاحية مدير مفعّلة</p></div><span className="flex items-center gap-2 rounded-full bg-[#e8f4ee] px-3 py-2 text-xs font-black text-[#26734a]"><CheckCircle2 className="h-4 w-4" />حساب موثوق</span></div>
    <div className="grid gap-4 md:grid-cols-3"><StatCard label="منتجات قاعدة البيانات" value={String(catalogProducts.length)} icon={<PackagePlus />} /><StatCard label="الماركات" value={String(brands.length)} icon={<UserRound />} /><StatCard label="التصنيفات" value={String(categories.length)} icon={<RefreshCw />} /></div>
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.25fr]"><div className="space-y-6"><Panel title="إضافة ماركة"><div className="flex gap-2"><input value={brandName} onChange={(event) => setBrandName(event.target.value)} placeholder="مثال: Apple" className="h-11 min-w-0 flex-1 rounded-xl border border-[#e4e1db] px-3 text-sm outline-none focus:border-[#14214a]" /><button onClick={() => brandName && createBrand.mutate({ name: brandName, slug: brandName.toLowerCase().replace(/\s+/g, "-") })} className="rounded-xl bg-[#14214a] px-4 text-xs font-black text-white"><Plus className="h-4 w-4" /></button></div></Panel><EntityManager title="الماركات" items={brands} onUpdate={(input) => updateBrand.mutate(input)} onDelete={(id) => deleteBrand.mutate({ id })} /><Panel title="إضافة تصنيف"><div className="flex gap-2"><input value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder="مثال: هواتف جديدة" className="h-11 min-w-0 flex-1 rounded-xl border border-[#e4e1db] px-3 text-sm outline-none focus:border-[#14214a]" /><button onClick={() => categoryName && createCategory.mutate({ name: categoryName, slug: categoryName.toLowerCase().replace(/\s+/g, "-") })} className="rounded-xl bg-[#14214a] px-4 text-xs font-black text-white"><Plus className="h-4 w-4" /></button></div></Panel><EntityManager title="التصنيفات" items={categories} onUpdate={(input) => updateCategory.mutate(input)} onDelete={(id) => deleteCategory.mutate({ id })} /><Panel title="إضافة منتج"><div className="mb-4 rounded-2xl border-2 border-dashed border-[#dcd8d0] bg-[#fbfaf8] p-4"><div className="flex items-center gap-4"><img src={imagePreview} alt="معاينة صورة المنتج" className="h-20 w-20 rounded-xl bg-[#f1efeb] object-cover mix-blend-multiply" /><div className="min-w-0 flex-1"><p className="text-sm font-black text-[#14214a]">صورة المنتج</p><p className="mt-1 text-[11px] leading-5 text-[#858a96]">JPG أو PNG أو WebP · الحد الأقصى 10MB</p><div className="mt-3 flex flex-wrap gap-2"><label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#14214a] px-3 py-2 text-[11px] font-black text-white"><ImagePlus className="h-4 w-4" />اختر صورة<input type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => chooseImages(event.target.files)} /></label>{selectedImage && <button onClick={() => { setSelectedImage(null); setImagePreview(form.imageUrl || fallbackImage); }} className="inline-flex items-center gap-1 rounded-lg border border-[#e4e1db] px-3 py-2 text-[11px] font-bold text-[#858a96]"><X className="h-3.5 w-3.5" />إلغاء</button>}</div></div></div></div><div className="grid gap-3 md:grid-cols-2"><AdminField label="اسم المنتج" value={form.name} onChange={(value) => setForm({ ...form, name: value })} placeholder="iPhone 15 Pro" /><AdminField label="SKU" value={form.sku} onChange={(value) => setForm({ ...form, sku: value })} placeholder="IPH15P-256" /><AdminField label="Slug" value={form.slug} onChange={(value) => setForm({ ...form, slug: value })} placeholder="iphone-15-pro" /><AdminField label="السعر" type="number" value={form.price} onChange={(value) => setForm({ ...form, price: value })} placeholder="3299" /><AdminField label="الكمية" type="number" value={form.stock} onChange={(value) => setForm({ ...form, stock: value })} placeholder="10" /><AdminTextArea label="المواصفات" value={form.specs} onChange={(value) => setForm({ ...form, specs: value })} placeholder="مثال: شاشة 6.1 بوصة، ذاكرة 256GB، كاميرا 48MP" /><label><span className="mb-1.5 block text-[11px] font-black text-[#697184]">الحالة</span><select value={form.condition} onChange={(event) => setForm({ ...form, condition: event.target.value as "new" | "used" })} className="h-10 w-full rounded-xl border border-[#e4e1db] bg-white px-3 text-xs outline-none"><option value="new">جديد</option><option value="used">مستعمل</option></select></label><label><span className="mb-1.5 block text-[11px] font-black text-[#697184]">الماركة</span><select value={form.brandId} onChange={(event) => setForm({ ...form, brandId: event.target.value })} className="h-10 w-full rounded-xl border border-[#e4e1db] bg-white px-3 text-xs outline-none"><option value="">اختر الماركة</option>{brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}</select></label><label><span className="mb-1.5 block text-[11px] font-black text-[#697184]">التصنيف</span><select value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })} className="h-10 w-full rounded-xl border border-[#e4e1db] bg-white px-3 text-xs outline-none"><option value="">اختر التصنيف</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label></div><button onClick={submitProduct} disabled={createProduct.isPending} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#14214a] py-3 text-sm font-black text-white transition hover:bg-[#c9921a]"><PackagePlus className="h-4 w-4" />{createProduct.isPending ? "جاري الحفظ..." : "حفظ المنتج"}</button></Panel></div><Panel title="المنتجات والمخزون"><div className="overflow-x-auto"><table className="w-full min-w-[650px] text-right text-xs"><thead><tr className="border-b border-[#eeeae4] text-[#858a96]"><th className="pb-3 font-bold">الصورة</th><th className="pb-3 font-bold">المنتج</th><th className="pb-3 font-bold">SKU</th><th className="pb-3 font-bold">السعر</th><th className="pb-3 font-bold">المخزون</th><th className="pb-3 font-bold">إجراء</th></tr></thead><tbody>{catalogProducts.map((product) => <><tr key={product.id} className="border-b border-[#f1eee9]"><td className="py-3"><div className="flex items-center gap-2"><div className="relative"><img src={product.imageUrl || fallbackImage} alt={product.name} className="h-12 w-12 rounded-lg bg-[#f1efeb] object-cover mix-blend-multiply" />{!product.imageUrl && <span className="absolute -bottom-1 -left-1 rounded bg-[#858a96] px-1 text-[8px] font-bold text-white">بدون صورة</span>}</div><label className="cursor-pointer rounded-lg p-2 text-[#14214a] hover:bg-[#edf0f8]" title="استبدال الصورة"><ImagePlus className="h-4 w-4" /><input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" disabled={replacingProductId === product.id} onChange={(event) => replaceProductImage(product.id, event.target.files?.[0])} /></label>{product.imageUrl && <button onClick={() => clearProductImage(product.id)} disabled={replacingProductId === product.id} className="rounded-lg p-2 text-[#c43d4b] hover:bg-[#fff0f1]" title="حذف الصورة"><ImageOff className="h-4 w-4" /></button>}<label className="relative cursor-pointer rounded-lg p-2 text-[#c9921a] hover:bg-[#fff7df]" title="إضافة صور للمعرض"><Images className="h-4 w-4" /><input type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden" disabled={replacingProductId === product.id} onChange={(event) => uploadGalleryImages(product.id, event.target.files, parseGallery(product.galleryUrls))} /></label><button onClick={() => setExpandedGalleryId(expandedGalleryId === product.id ? null : product.id)} className="rounded-lg px-2 py-1 text-[10px] font-black text-[#c9921a] hover:bg-[#fff7df]">{parseGallery(product.galleryUrls).length ? "إدارة" : "معرض"}</button>{parseGallery(product.galleryUrls).length > 0 && <span className="text-[10px] font-bold text-[#858a96]">+{parseGallery(product.galleryUrls).length}</span>}{replacingProductId === product.id && <span className="text-[10px] font-bold text-[#858a96]">جاري...</span>}</div></td><td className="py-4 font-black text-[#14214a]"><button onClick={() => setEditingProductId(editingProductId === product.id ? null : product.id)} className="text-right hover:text-[#c9921a]" title="تعديل المنتج">{product.name}</button></td><td className="py-4 text-[#858a96]">{product.sku}</td><td className="py-4 font-black text-[#14214a]"><input defaultValue={product.price} type="number" onBlur={(event) => updateProduct.mutate({ id: product.id, price: Math.max(0, Number(event.target.value) || 0) })} className="h-8 w-24 rounded-lg border border-[#e4e1db] px-2 text-center text-xs font-black outline-none" /></td><td className="py-4"><input defaultValue={product.stock} onBlur={(event) => updateStock.mutate({ id: product.id, stock: Math.max(0, Number(event.target.value) || 0) })} className="h-8 w-20 rounded-lg border border-[#e4e1db] px-2 text-center text-xs font-black outline-none" /></td><td className="py-4"><button onClick={() => { if (window.confirm(`هل تريد حذف المنتج ${product.name}؟`)) deleteProduct.mutate({ id: product.id }); }} className="rounded-lg p-2 text-[#c43d4b] hover:bg-[#fff0f1]" aria-label="حذف المنتج"><Trash2 className="h-4 w-4" /></button></td></tr>{editingProductId === product.id && <ProductEditor product={product} brands={brands} categories={categories} onCancel={() => setEditingProductId(null)} onSave={(data) => updateProduct.mutate(data)} />}{expandedGalleryId === product.id && <GalleryEditor productId={product.id} gallery={parseGallery(product.galleryUrls)} onReorder={(gallery) => updateProductGallery.mutate({ id: product.id, galleryUrls: gallery })} onDelete={(index) => deleteGalleryImage(product.id, parseGallery(product.galleryUrls), index)} />}</>)} </tbody></table>{!catalogProducts.length && <div className="py-14 text-center text-sm font-bold text-[#858a96]">لا توجد منتجات في قاعدة البيانات بعد. أضف ماركة وتصنيفاً ثم أضف أول منتج.</div>}</div></Panel></div>
    {notice && <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#14214a] px-5 py-3 text-xs font-bold text-white shadow-2xl"><CheckCircle2 className="h-4 w-4 text-[#ffd45a]" />{notice}</div>}
  </AdminShell>;
}

function AdminShell({ children }: { children: React.ReactNode }) { return <section className="container py-8 md:py-12">{children}</section>; }
function AccessCard({ title, copy, actionLabel, onAction, icon }: { title: string; copy: string; actionLabel: string; onAction: () => void; icon: React.ReactNode }) { return <div className="mx-auto max-w-[540px] rounded-3xl bg-[#14214a] p-8 text-center text-white md:p-12"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ffd45a] text-[#14214a] [&>svg]:h-6 [&>svg]:w-6">{icon}</span><h1 className="mt-6 text-2xl font-black">{title}</h1><p className="mx-auto mt-3 max-w-[380px] text-sm leading-7 text-white/65">{copy}</p><button onClick={onAction} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#ffd45a] px-5 py-3 text-sm font-black text-[#14214a]">{actionLabel}<ArrowRight className="h-4 w-4" /></button></div>; }
function LocalLoginCard({ username, password, error, pending, onUsername, onPassword, onSubmit, onManusLogin }: { username: string; password: string; error: string; pending: boolean; onUsername: (value: string) => void; onPassword: (value: string) => void; onSubmit: () => void; onManusLogin: () => void }) { return <div className="mx-auto max-w-[540px] rounded-3xl bg-[#14214a] p-8 text-center text-white md:p-12"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ffd45a] text-[#14214a]"><LockKeyhole className="h-6 w-6" /></span><h1 className="mt-6 text-2xl font-black">دخول إدارة المتجر</h1><p className="mx-auto mt-3 max-w-[380px] text-sm leading-7 text-white/65">أدخل بيانات المسؤول للوصول إلى لوحة إدارة جوال وأكثر.</p><form className="mx-auto mt-6 max-w-sm space-y-3 text-right" onSubmit={(event) => { event.preventDefault(); onSubmit(); }}><label className="block text-xs font-bold text-white/80">اسم المستخدم<input value={username} onChange={(event) => onUsername(event.target.value)} autoComplete="username" className="mt-1 h-11 w-full rounded-xl border-0 bg-white px-3 text-sm text-[#14214a] outline-none" placeholder="admin" /></label><label className="block text-xs font-bold text-white/80">كلمة المرور<input value={password} onChange={(event) => onPassword(event.target.value)} type="password" autoComplete="current-password" className="mt-1 h-11 w-full rounded-xl border-0 bg-white px-3 text-sm text-[#14214a] outline-none" placeholder="••••••••" /></label>{error && <p className="rounded-lg bg-[#c43d4b]/20 px-3 py-2 text-xs font-bold text-[#ffd8dc]">{error}</p>}<button type="submit" disabled={pending} className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#ffd45a] px-5 py-3 text-sm font-black text-[#14214a]">{pending ? "جاري التحقق..." : "دخول لوحة التحكم"}<ArrowRight className="h-4 w-4" /></button></form><button onClick={onManusLogin} className="mt-5 text-xs font-bold text-white/65 underline underline-offset-4 hover:text-white">أو الدخول بحساب Manus</button></div>; }
function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <div className="rounded-2xl border border-[#e8e5df] bg-white p-5 md:p-6"><h2 className="mb-5 text-base font-black text-[#14214a]">{title}</h2>{children}</div>; }
function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) { return <div className="rounded-2xl border border-[#e8e5df] bg-white p-5"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf0f8] text-[#14214a] [&>svg]:h-5 [&>svg]:w-5">{icon}</span><p className="mt-4 text-xs font-bold text-[#858a96]">{label}</p><p className="mt-1 text-2xl font-black text-[#14214a]">{value}</p></div>; }
function AdminField({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; type?: string }) { return <label><span className="mb-1.5 block text-[11px] font-black text-[#697184]">{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-10 w-full rounded-xl border border-[#e4e1db] bg-white px-3 text-xs outline-none focus:border-[#14214a]" /></label>; }
function AdminTextArea({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) { return <label className="md:col-span-2"><span className="mb-1.5 block text-[11px] font-black text-[#697184]">{label}</span><textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={3} className="w-full resize-y rounded-xl border border-[#e4e1db] bg-white px-3 py-2 text-xs leading-6 outline-none focus:border-[#14214a]" /></label>; }

function EntityManager({ title, items, onUpdate, onDelete }: { title: string; items: Array<{ id: number; name: string; slug: string }>; onUpdate: (input: { id: number; name: string; slug: string }) => void; onDelete: (id: number) => void }) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState({ name: "", slug: "" });
  return <Panel title={`${title} الحالية`}><div className="space-y-2">{items.map((item) => editingId === item.id ? <div key={item.id} className="grid gap-2 rounded-xl bg-[#fbfaf8] p-3 sm:grid-cols-[1fr_1fr_auto_auto]"><input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className="h-9 rounded-lg border border-[#e4e1db] px-2 text-xs outline-none" /><input value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: event.target.value })} className="h-9 rounded-lg border border-[#e4e1db] px-2 text-xs outline-none" /><button onClick={() => { if (draft.name.trim() && draft.slug.trim()) { onUpdate({ id: item.id, name: draft.name.trim(), slug: draft.slug.trim() }); setEditingId(null); } }} className="rounded-lg bg-[#14214a] px-3 text-xs font-black text-white">حفظ</button><button onClick={() => setEditingId(null)} className="rounded-lg border border-[#e4e1db] px-3 text-xs font-bold">إلغاء</button></div> : <div key={item.id} className="flex items-center gap-3 rounded-xl border border-[#eeeae4] bg-white px-3 py-2"><div className="min-w-0 flex-1"><p className="truncate text-xs font-black text-[#14214a]">{item.name}</p><p className="truncate text-[10px] text-[#858a96]">/{item.slug}</p></div><button onClick={() => { setEditingId(item.id); setDraft({ name: item.name, slug: item.slug }); }} className="rounded-lg px-2 py-1 text-[11px] font-black text-[#14214a] hover:bg-[#edf0f8]">تعديل</button><button onClick={() => { if (window.confirm(`هل تريد حذف ${item.name}؟`)) onDelete(item.id); }} className="rounded-lg px-2 py-1 text-[11px] font-black text-[#c43d4b] hover:bg-[#fff0f1]">حذف</button></div>)}</div>{!items.length && <p className="rounded-xl border border-dashed border-[#dcd8d0] p-4 text-center text-xs text-[#858a96]">لا توجد عناصر بعد.</p>}</Panel>;
}

function ProductEditor({ product, brands, categories, onSave, onCancel }: { product: { id: number; sku: string; slug: string; name: string; brandId: number; categoryId: number; condition: "new" | "used"; grade: string | null; price: number; oldPrice: number | null; stock: number; storage: string | null; color: string | null; warrantyMonths: number; specs: string | null }; brands: Array<{ id: number; name: string }>; categories: Array<{ id: number; name: string }>; onSave: (data: { id: number; sku: string; slug: string; name: string; brandId: number; categoryId: number; condition: "new" | "used"; grade: string | null; price: number; oldPrice: number | null; stock: number; specs: string | null; storage: string | null; color: string | null; warrantyMonths: number }) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState({ sku: product.sku, slug: product.slug, name: product.name, brandId: String(product.brandId), categoryId: String(product.categoryId), condition: product.condition, grade: product.grade ?? "", price: String(product.price), oldPrice: product.oldPrice == null ? "" : String(product.oldPrice), stock: String(product.stock), specs: product.specs ?? "", storage: product.storage ?? "", color: product.color ?? "", warrantyMonths: String(product.warrantyMonths) });
  const field = (key: keyof typeof draft, label: string, type = "text") => <label><span className="mb-1 block text-[10px] font-black text-[#697184]">{label}</span><input type={type} value={draft[key]} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} className="h-8 w-full rounded-lg border border-[#e4e1db] bg-white px-2 text-xs outline-none focus:border-[#14214a]" /></label>;
  return <tr className="bg-[#fbfaf8]"><td colSpan={6} className="p-4"><div className="mb-3 flex items-center justify-between"><p className="text-xs font-black text-[#14214a]">تعديل بيانات المنتج</p><button onClick={onCancel} className="rounded-lg p-1 text-[#858a96]"><X className="h-4 w-4" /></button></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{field("name", "اسم المنتج")}{field("sku", "SKU")}{field("slug", "Slug")}{field("price", "السعر", "number")}{field("oldPrice", "السعر السابق", "number")}{field("stock", "المخزون", "number")}{field("specs", "المواصفات")}{field("storage", "السعة")}{field("color", "اللون")}{field("grade", "الدرجة")}{field("warrantyMonths", "الضمان بالأشهر", "number")}<label><span className="mb-1 block text-[10px] font-black text-[#697184]">الحالة</span><select value={draft.condition} onChange={(event) => setDraft({ ...draft, condition: event.target.value as "new" | "used" })} className="h-8 w-full rounded-lg border border-[#e4e1db] bg-white px-2 text-xs"><option value="new">جديد</option><option value="used">مستعمل</option></select></label><label><span className="mb-1 block text-[10px] font-black text-[#697184]">الماركة</span><select value={draft.brandId} onChange={(event) => setDraft({ ...draft, brandId: event.target.value })} className="h-8 w-full rounded-lg border border-[#e4e1db] bg-white px-2 text-xs">{brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}</select></label><label><span className="mb-1 block text-[10px] font-black text-[#697184]">التصنيف</span><select value={draft.categoryId} onChange={(event) => setDraft({ ...draft, categoryId: event.target.value })} className="h-8 w-full rounded-lg border border-[#e4e1db] bg-white px-2 text-xs">{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label></div><div className="mt-4 flex gap-2"><button onClick={() => onSave({ id: product.id, sku: draft.sku.trim(), slug: draft.slug.trim(), name: draft.name.trim(), brandId: Number(draft.brandId), categoryId: Number(draft.categoryId), condition: draft.condition, grade: draft.grade.trim() || null, price: Math.max(0, Number(draft.price) || 0), oldPrice: draft.oldPrice ? Math.max(0, Number(draft.oldPrice) || 0) : null, stock: Math.max(0, Number(draft.stock) || 0), specs: draft.specs.trim() || null, storage: draft.storage.trim() || null, color: draft.color.trim() || null, warrantyMonths: Math.max(0, Number(draft.warrantyMonths) || 0) })} className="rounded-xl bg-[#14214a] px-4 py-2 text-xs font-black text-white">حفظ التعديلات</button><button onClick={onCancel} className="rounded-xl border border-[#e4e1db] px-4 py-2 text-xs font-bold">إلغاء</button></div></td></tr>;
}
