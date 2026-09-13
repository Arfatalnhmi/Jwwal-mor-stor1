import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CreditCard,
  Gift,
  Globe2,
  Heart,
  Instagram,
  LayoutGrid,
  List,
  LockKeyhole,
  MapPin,
  Menu,
  Moon,
  Music2,
  MessageCircle,
  Minus,
  PackageCheck,
  Phone,
  Plus,
  RotateCcw,
  Search,
  Send,
  Share2,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Star,
  Store,
  Tablet,
  Tag,
  Trash2,
  Truck,
  UserRound,
  WalletCards,
  X,
  Zap,
  Sun,
} from "lucide-react";
import { formatSar } from "@shared/store";
import AdminConsole from "./Admin";
import { trpc } from "@/lib/trpc";

type Product = {
  id: string;
  name: string;
  brand: string;
  subtitle: string;
  category: string;
  condition: "جديد" | "مستعمل";
  grade?: string;
  price: number;
  oldPrice?: number;
  image: string;
  gallery?: string[];
  specs?: string;
  rating: number;
  reviews: number;
  badge?: string;
  storage: string;
  color: string;
  battery?: string;
};

type CartLine = Product & { quantity: number };

const assets = {
  hero: "/manus-storage/hero_4da3cffa.jpg",
  iphone: "/manus-storage/iphone_5cd46860.jpg",
  galaxy: "/manus-storage/galaxy_d788428f.jpg",
  ipad: "/manus-storage/ipad_c1bffd23.jpg",
  airpods: "/manus-storage/airpods_57b98713.jpg",
};

const products: Product[] = [
  {
    id: "iphone-15-pro",
    name: "iPhone 15 Pro",
    brand: "Apple",
    subtitle: "256GB · تيتانيوم طبيعي",
    category: "هواتف جديدة",
    condition: "جديد",
    price: 3299,
    oldPrice: 3599,
    image: assets.iphone,
    rating: 4.9,
    reviews: 128,
    badge: "الأكثر مبيعاً",
    storage: "256GB",
    color: "تيتانيوم طبيعي",
  },
  {
    id: "galaxy-s24-ultra",
    name: "Galaxy S24 Ultra",
    brand: "Samsung",
    subtitle: "256GB · أسود تيتانيوم",
    category: "هواتف جديدة",
    condition: "جديد",
    price: 3099,
    oldPrice: 3499,
    image: assets.galaxy,
    rating: 4.8,
    reviews: 94,
    badge: "عرض اليوم",
    storage: "256GB",
    color: "أسود تيتانيوم",
  },
  {
    id: "iphone-14-pro-used",
    name: "iPhone 14 Pro",
    brand: "Apple",
    subtitle: "256GB · بنفسجي عميق",
    category: "هواتف مستعملة",
    condition: "مستعمل",
    grade: "ممتاز",
    price: 2199,
    oldPrice: 2499,
    image: assets.iphone,
    rating: 4.7,
    reviews: 61,
    badge: "فحص ٢٥ نقطة",
    storage: "256GB",
    color: "بنفسجي عميق",
    battery: "92%",
  },
  {
    id: "ipad-air-5",
    name: "iPad Air 5",
    brand: "Apple",
    subtitle: "64GB · أزرق سماوي",
    category: "آيباد جديد",
    condition: "جديد",
    price: 2299,
    image: assets.ipad,
    rating: 4.9,
    reviews: 43,
    badge: "وصل حديثاً",
    storage: "64GB",
    color: "أزرق سماوي",
  },
  {
    id: "galaxy-s23-used",
    name: "Galaxy S23 Ultra",
    brand: "Samsung",
    subtitle: "256GB · أخضر فانتوم",
    category: "هواتف مستعملة",
    condition: "مستعمل",
    grade: "جيد جداً",
    price: 1699,
    oldPrice: 1899,
    image: assets.galaxy,
    rating: 4.6,
    reviews: 37,
    badge: "قيمة رائعة",
    storage: "256GB",
    color: "أخضر فانتوم",
    battery: "89%",
  },
  {
    id: "airpods-pro-2",
    name: "AirPods Pro 2",
    brand: "Apple",
    subtitle: "USB-C · عزل ضوضاء نشط",
    category: "إكسسوارات",
    condition: "جديد",
    price: 799,
    oldPrice: 899,
    image: assets.airpods,
    rating: 4.8,
    reviews: 76,
    badge: "خصم ١١٪",
    storage: "—",
    color: "أبيض",
  },
  {
    id: "iphone-15-used",
    name: "iPhone 15",
    brand: "Apple",
    subtitle: "128GB · أزرق",
    category: "هواتف مستعملة",
    condition: "مستعمل",
    grade: "جيد جداً",
    price: 1899,
    image: assets.iphone,
    rating: 4.6,
    reviews: 28,
    badge: "سعر مميز",
    storage: "128GB",
    color: "أزرق",
    battery: "91%",
  },
  {
    id: "redmi-note-13-pro",
    name: "Redmi Note 13 Pro",
    brand: "Xiaomi",
    subtitle: "256GB · أسود منتصف الليل",
    category: "هواتف جديدة",
    condition: "جديد",
    price: 999,
    oldPrice: 1149,
    image: assets.galaxy,
    rating: 4.5,
    reviews: 19,
    badge: "قيمة رائعة",
    storage: "256GB",
    color: "أسود منتصف الليل",
  },
  {
    id: "ipad-10-used",
    name: "iPad 10th Gen",
    brand: "Apple",
    subtitle: "64GB · فضي",
    category: "آيباد مستعمل",
    condition: "مستعمل",
    grade: "ممتاز",
    price: 1399,
    oldPrice: 1599,
    image: assets.ipad,
    rating: 4.7,
    reviews: 23,
    badge: "فحص ٢٥ نقطة",
    storage: "64GB",
    color: "فضي",
    battery: "96%",
  },
  {
    id: "matepad-11",
    name: "Huawei MatePad 11.5",
    brand: "Huawei",
    subtitle: "128GB · رمادي فضائي",
    category: "آيباد جديد",
    condition: "جديد",
    price: 1249,
    image: assets.ipad,
    rating: 4.4,
    reviews: 16,
    badge: "وصل حديثاً",
    storage: "128GB",
    color: "رمادي فضائي",
  },
  {
    id: "apple-watch-9",
    name: "Apple Watch Series 9",
    brand: "Apple",
    subtitle: "45mm · أسود منتصف الليل",
    category: "ساعات ذكية",
    condition: "جديد",
    price: 1499,
    oldPrice: 1699,
    image: assets.airpods,
    rating: 4.8,
    reviews: 31,
    badge: "عرض اليوم",
    storage: "—",
    color: "أسود منتصف الليل",
  },
  {
    id: "magsafe-charger",
    name: "شاحن MagSafe أصلي",
    brand: "Apple",
    subtitle: "شحن لاسلكي سريع · أبيض",
    category: "إكسسوارات",
    condition: "جديد",
    price: 179,
    image: assets.airpods,
    rating: 4.7,
    reviews: 42,
    badge: "الأكثر طلباً",
    storage: "—",
    color: "أبيض",
  },
];

const brands = ["APPLE", "SAMSUNG", "HUAWEI", "XIAOMI", "GOOGLE", "ONEPLUS"];
const categories = [
  { label: "هواتف جديدة", icon: <SmartphoneIcon /> },
  { label: "هواتف مستعملة", icon: <RefreshIcon /> },
  { label: "آيباد جديد", icon: <Tablet className="h-5 w-5" /> },
  { label: "آيباد مستعمل", icon: <Tablet className="h-5 w-5" /> },
  { label: "إكسسوارات", icon: <Gift className="h-5 w-5" /> },
  { label: "العروض", icon: <Zap className="h-5 w-5" /> },
  { label: "ساعات ذكية", icon: <Clock3 className="h-5 w-5" /> },
  { label: "ماركات عالمية", icon: <Globe2 className="h-5 w-5" /> },
];

function SmartphoneIcon() {
  return <span className="text-[20px] leading-none">◫</span>;
}
function RefreshIcon() {
  return <span className="text-[18px] leading-none">↻</span>;
}

const formatPrice = formatSar;

export default function Storefront() {
  const [location, navigate] = useLocation();
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState("الكل");
  const [filterCondition, setFilterCondition] = useState("الكل");
  const [maxPrice, setMaxPrice] = useState(5000);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [countdown, setCountdown] = useState(6 * 60 + 42);
  const [darkMode, setDarkMode] = useState(() => window.localStorage.getItem("jawwal-theme") === "dark");
  const catalogQuery = trpc.catalog.list.useQuery();

  useEffect(() => {
    const timer = window.setInterval(() => setCountdown((current) => (current > 0 ? current - 1 : 6 * 60 + 42)), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 2600);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    window.localStorage.setItem("jawwal-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const addToCart = (product: Product) => {
    setCart((current) => {
      const found = current.find((line) => line.id === product.id);
      if (found) return current.map((line) => (line.id === product.id ? { ...line, quantity: line.quantity + 1 } : line));
      return [...current, { ...product, quantity: 1 }];
    });
    setNotice(`تمت إضافة ${product.name} إلى السلة`);
    setCartOpen(true);
  };

  const changeQuantity = (id: string, delta: number) => {
    setCart((current) => current.flatMap((line) => line.id !== id ? [line] : line.quantity + delta > 0 ? [{ ...line, quantity: line.quantity + delta }] : []));
  };

  const toggleWishlist = (id: string) => {
    setWishlist((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const cartTotal = cart.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  const catalogProducts = useMemo<Product[]>(() => {
    if (!catalogQuery.data?.length) return products;
    return catalogQuery.data.map((item) => ({
      id: item.slug,
      name: item.name,
      brand: item.brand ?? "—",
      subtitle: [item.storage, item.color].filter(Boolean).join(" · "),
      category: item.category ?? "أخرى",
      condition: item.condition === "used" ? "مستعمل" : "جديد",
      grade: item.grade ?? undefined,
      price: item.price,
      oldPrice: item.oldPrice ?? undefined,
      image: item.imageUrl ?? assets.iphone,
      specs: item.specs ?? undefined,
      gallery: (() => { try { return item.galleryUrls ? JSON.parse(item.galleryUrls) as string[] : []; } catch { return []; } })(),
      rating: item.rating / 10,
      reviews: item.reviewCount,
      badge: item.stock === 0 ? "نفد المخزون" : undefined,
      storage: item.storage ?? "—",
      color: item.color ?? "—",
      battery: item.batteryPercent ? `${item.batteryPercent}%` : undefined,
    }));
  }, [catalogQuery.data]);
  const currentProduct = catalogProducts.find((product) => location.includes(product.id)) ?? catalogProducts[0];
  const isCategory = location.startsWith("/category");
  const isProduct = location.startsWith("/product");
  const isCart = location === "/cart";
  const isCheckout = location === "/checkout";
  const isAccount = location === "/account";
  const isAdmin = location === "/admin";

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return catalogProducts.filter((product) => {
      const matchesText = !query || `${product.name} ${product.brand} ${product.category} ${product.subtitle}`.toLowerCase().includes(query);
      const matchesCategory = filterCategory === "الكل" || product.category === filterCategory;
      const matchesCondition = filterCondition === "الكل" || product.condition === filterCondition;
      const matchesPrice = product.price <= maxPrice;
      return matchesText && matchesCategory && matchesCondition && matchesPrice;
    });
  }, [catalogProducts, search, filterCategory, filterCondition, maxPrice]);
  const hasFilters = filterCategory !== "الكل" || filterCondition !== "الكل" || maxPrice < 5000;

  const goToCategory = (label: string) => {
    setMobileNavOpen(false);
    navigate(`/category/${encodeURIComponent(label)}`);
  };

  return (
    <div dir="rtl" className={`store-shell min-h-screen bg-[#fbfaf8] text-[#101a38] ${darkMode ? "dark-theme" : ""}`}>
      <AnnouncementBar />
      <header className="sticky top-0 z-40 border-b border-[#e8e5df] bg-[#fbfaf8]/95 backdrop-blur-xl">
        <div className="container flex h-[78px] items-center gap-5">
          <button className="flex items-center gap-3 text-right" onClick={() => navigate("/")} aria-label="الرئيسية">
            <LogoMark />
            <span className="hidden sm:block">
              <span className="block text-[17px] font-black leading-5 text-[#14214a]">جوال وأكثر</span>
              <span className="block text-[10px] font-semibold tracking-[0.18em] text-[#aa7d16]">JAWAL & MORE</span>
            </span>
          </button>

          <div className="relative hidden min-w-0 flex-1 md:block">
            <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#788094]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ابحث عن جهاز، موديل أو علامة تجارية..."
              className="h-11 w-full rounded-2xl border border-[#e4e2df] bg-white pr-11 pl-4 text-sm outline-none transition focus:border-[#17275a] focus:ring-4 focus:ring-[#17275a]/10"
            />
            <button onClick={() => setFilterOpen((open) => !open)} className={`absolute left-10 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold transition ${hasFilters ? "bg-[#fff4cf] text-[#a8780d]" : "text-[#788094] hover:bg-[#f2efe9]"}`} aria-label="فتح التصفية" title="تصفية المنتجات"><SlidersHorizontal className="h-3.5 w-3.5" />تصفية</button>
            {search && <button onClick={() => setSearch("")} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b8d94]" aria-label="مسح البحث"><X className="h-4 w-4" /></button>}
            {filterOpen && <div className="absolute left-0 right-0 top-14 z-50 rounded-2xl border border-[#e4e2df] bg-white p-4 text-right shadow-2xl"><div className="grid gap-3 sm:grid-cols-3"><label className="text-[11px] font-black text-[#697184]">التصنيف<select value={filterCategory} onChange={(event) => setFilterCategory(event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-[#e4e2df] bg-white px-3 text-xs font-bold text-[#14214a] outline-none"><option value="الكل">كل التصنيفات</option>{categories.map((category) => <option key={category.label} value={category.label}>{category.label}</option>)}</select></label><label className="text-[11px] font-black text-[#697184]">الحالة<select value={filterCondition} onChange={(event) => setFilterCondition(event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-[#e4e2df] bg-white px-3 text-xs font-bold text-[#14214a] outline-none"><option value="الكل">جديد ومستعمل</option><option value="جديد">جديد</option><option value="مستعمل">مستعمل</option></select></label><label className="text-[11px] font-black text-[#697184]">السعر حتى <span className="text-[#c9921a]">{formatPrice(maxPrice)}</span><input type="range" min="500" max="5000" step="100" value={maxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))} className="mt-3 w-full accent-[#c9921a]" /></label></div><div className="mt-3 flex items-center justify-between border-t border-[#f0ede8] pt-3"><span className="text-[11px] font-bold text-[#858a96]">{visibleProducts.length} منتج مطابق</span><button onClick={() => { setFilterCategory("الكل"); setFilterCondition("الكل"); setMaxPrice(5000); }} className="text-[11px] font-black text-[#a8780d] hover:underline">مسح التصفية</button></div></div>}
          </div>

          <div className="flex items-center gap-1.5">
            <IconAction icon={<UserRound />} label="حسابي" onClick={() => navigate("/account")} />
            <IconAction icon={<Heart />} label="المفضلة" count={wishlist.length} active={wishlist.length > 0} onClick={() => setNotice("قائمة المفضلة جاهزة للحفظ") } />
            <IconAction icon={<ShoppingBag />} label="السلة" count={cartCount} active={cartCount > 0} onClick={() => setCartOpen(true)} />
            <button onClick={() => navigate("/admin")} className="hidden h-10 items-center gap-2 rounded-xl border border-[#e4e2df] bg-white px-3 text-xs font-black text-[#14214a] transition hover:border-[#c9921a] hover:text-[#a8780d] sm:flex" title="فتح لوحة تحكم المتجر"><BarChart3 className="h-4 w-4" />لوحة التحكم</button>
            <button onClick={() => setDarkMode((mode) => !mode)} className="theme-toggle flex h-9 w-9 items-center justify-center rounded-xl border border-[#e4e2df] bg-white text-[#14214a] transition hover:border-[#c9921a] md:h-10 md:w-10" aria-label={darkMode ? "تفعيل الوضع النهاري" : "تفعيل الوضع الليلي"} title={darkMode ? "الوضع النهاري" : "الوضع الليلي"}>{darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button>
            <button onClick={() => setMobileNavOpen((open) => !open)} className="mr-1 rounded-xl p-2 text-[#14214a] md:hidden" aria-label="القائمة"><Menu className="h-5 w-5" /></button>
          </div>
        </div>

        <nav className="hidden border-t border-[#eeece8] md:block">
          <div className="container flex h-12 items-center justify-between gap-5 text-[13px] font-bold text-[#48516a]">
            <div className="flex items-center gap-6">
              <NavItem label="الرئيسية" active onClick={() => navigate("/")} />
              <NavItem label="هواتف جديدة" onClick={() => goToCategory("هواتف جديدة")} />
              <NavItem label="هواتف مستعملة" onClick={() => goToCategory("هواتف مستعملة")} />
              <NavItem label="آيباد جديد" onClick={() => goToCategory("آيباد جديد")} />
              <NavItem label="آيباد مستعمل" onClick={() => goToCategory("آيباد مستعمل")} />
              <NavItem label="إكسسوارات" onClick={() => goToCategory("إكسسوارات")} />
              <NavItem label="العروض" hot onClick={() => goToCategory("العروض")} />
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold text-[#8c8f99]"><span>خدمة العملاء</span><span className="h-4 w-px bg-[#e1ded8]" /><a href="tel:0546026420" className="flex items-center gap-1.5 text-[#17275a] transition hover:text-[#c9921a]" title="اتصال بخدمة العملاء 0546026420"><Phone className="h-3.5 w-3.5" />0546026420</a></div>
          </div>
        </nav>
      </header>

      {mobileNavOpen && (
        <div className="fixed inset-x-0 top-[79px] z-30 border-b border-[#e8e5df] bg-[#fbfaf8] p-4 shadow-xl md:hidden">
          <div className="mb-4 relative"><Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#788094]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ابحث عن جهاز..." className="h-11 w-full rounded-xl border border-[#e4e2df] bg-white pr-10 pl-4 text-sm outline-none" /></div><div className="mb-3 grid grid-cols-2 gap-2"><select value={filterCategory} onChange={(event) => setFilterCategory(event.target.value)} className="h-10 rounded-xl border border-[#e4e2df] bg-white px-2 text-xs font-bold text-[#14214a] outline-none"><option value="الكل">كل التصنيفات</option>{categories.map((category) => <option key={category.label} value={category.label}>{category.label}</option>)}</select><select value={filterCondition} onChange={(event) => setFilterCondition(event.target.value)} className="h-10 rounded-xl border border-[#e4e2df] bg-white px-2 text-xs font-bold text-[#14214a] outline-none"><option value="الكل">جديد ومستعمل</option><option value="جديد">جديد</option><option value="مستعمل">مستعمل</option></select></div>
          <button onClick={() => navigate("/admin")} className="mb-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#14214a] px-3 py-3 text-sm font-black text-white"><BarChart3 className="h-4 w-4" />لوحة تحكم المتجر</button><div className="grid grid-cols-2 gap-2">{categories.map((category) => <button key={category.label} onClick={() => goToCategory(category.label)} className="flex items-center gap-2 rounded-xl bg-white px-3 py-3 text-right text-sm font-bold text-[#17275a] shadow-sm">{category.icon}{category.label}</button>)}</div>
        </div>
      )}

      <main>
        {isCheckout ? <CheckoutPage cart={cart} total={cartTotal} onBack={() => navigate("/cart")} onComplete={() => { setCart([]); setNotice("تم تأكيد طلبك بنجاح"); navigate("/"); }} /> : isCart ? <CartPage cart={cart} total={cartTotal} changeQuantity={changeQuantity} onBack={() => navigate("/")} onCheckout={() => navigate("/checkout")} /> : isAccount ? <AccountPage onLogin={() => setNotice("سيتم تفعيل تسجيل الدخول قريباً")} /> : isAdmin ? <AdminConsole /> : isProduct ? <ProductPage product={currentProduct} onBack={() => navigate("/")} onAdd={addToCart} wished={wishlist.includes(currentProduct.id)} onWish={() => toggleWishlist(currentProduct.id)} /> : isCategory ? <CategoryPage categoryLabel={decodeURIComponent(location.split("/").slice(2).join("/") || "")} products={visibleProducts} onAdd={addToCart} onOpen={(id) => navigate(`/product/${id}`)} onWish={toggleWishlist} wishlist={wishlist} /> : <HomePage products={visibleProducts} onAdd={addToCart} onOpen={(id) => navigate(`/product/${id}`)} onWish={toggleWishlist} wishlist={wishlist} countdown={countdown} onCategory={goToCategory} />}
      </main>

      {!isCheckout && !isAdmin && <Footer onNavigate={navigate} />}
      <div className="fixed bottom-3 left-3 right-3 z-30 flex items-center justify-around rounded-2xl border border-[#e8e5df] bg-white/95 p-2 shadow-2xl backdrop-blur md:hidden">
        <MobileTab icon={<Store />} label="الرئيسية" onClick={() => navigate("/")} active={location === "/"} />
        <MobileTab icon={<Search />} label="بحث" onClick={() => setMobileNavOpen(true)} />
        <MobileTab icon={<Heart />} label="المفضلة" onClick={() => setNotice("أضف المنتجات التي تحبها إلى المفضلة")} />
        <MobileTab icon={<ShoppingBag />} label="السلة" count={cartCount} onClick={() => setCartOpen(true)} />
      </div>

      {cartOpen && <CartDrawer cart={cart} total={cartTotal} changeQuantity={changeQuantity} onClose={() => setCartOpen(false)} onCheckout={() => { setCartOpen(false); navigate("/checkout"); }} />}
      {notice && <div className="fixed bottom-24 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#14214a] px-5 py-3 text-sm font-bold text-white shadow-2xl md:bottom-6"><CheckCircle2 className="h-4 w-4 text-[#ffd45a]" />{notice}</div>}
    </div>
  );
}

function AnnouncementBar() {
  return <div className="bg-[#14214a] px-4 py-2 text-center text-[11px] font-semibold text-white/85"><span className="text-[#ffd45a]">شحن مجاني</span> للطلبات فوق 299 ر.س · ضمان موثوق على كل جهاز · الدفع عند الاستلام متاح</div>;
}

function LogoMark() {
  return <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#14214a] text-[#ffd45a] shadow-lg shadow-[#14214a]/20"><span className="absolute h-7 w-5 rounded-[6px] border-2 border-[#ffd45a]" /><span className="relative z-10 -mt-1 text-[25px] font-black">ج</span><span className="absolute bottom-[6px] h-1 w-1 rounded-full bg-[#ffd45a]" /></div>;
}

function IconAction({ icon, label, count, active, onClick }: { icon: React.ReactNode; label: string; count?: number; active?: boolean; onClick: () => void }) {
  return <button onClick={onClick} className="group relative flex w-12 flex-col items-center gap-0.5 rounded-xl p-1.5 text-[#6c7282] transition hover:bg-[#f2efe9] hover:text-[#14214a]"><span className={`transition ${active ? "text-[#14214a]" : ""}`}>{icon && <span className="block [&>svg]:h-[19px] [&>svg]:w-[19px]">{icon}</span>}</span><span className="hidden text-[10px] font-bold sm:block">{label}</span>{count ? <span className="absolute right-1 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#c9921a] px-1 text-[9px] font-black text-white">{count}</span> : null}</button>;
}

function NavItem({ label, onClick, active, hot }: { label: string; onClick: () => void; active?: boolean; hot?: boolean }) {
  return <button onClick={onClick} className={`relative flex h-12 items-center gap-1 border-b-2 px-1 transition ${active ? "border-[#c9921a] text-[#14214a]" : "border-transparent hover:text-[#14214a]"}`}>{hot && <span className="text-[#c9921a]">✦</span>}{label}</button>;
}

function HomePage({ products, onAdd, onOpen, onWish, wishlist, countdown, onCategory }: { products: Product[]; onAdd: (product: Product) => void; onOpen: (id: string) => void; onWish: (id: string) => void; wishlist: string[]; countdown: number; onCategory: (label: string) => void }) {
  return <>
    <section className="container pt-5 md:pt-7">
      <div className="relative min-h-[415px] overflow-hidden rounded-[28px] bg-[#14214a] shadow-2xl shadow-[#14214a]/15 md:min-h-[465px]">
        <img src={assets.hero} alt="تشكيلة من الهواتف والآيباد" className="absolute inset-0 h-full w-full object-cover object-left opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-l from-[#0f1b3d] via-[#0f1b3d]/85 to-transparent" />
        <div className="relative z-10 flex min-h-[415px] items-center px-7 py-10 md:min-h-[465px] md:px-16"><div className="max-w-[510px]">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#ffd45a]/30 bg-[#ffd45a]/10 px-3 py-1.5 text-xs font-bold text-[#ffe79a]"><Sparkles className="h-3.5 w-3.5" />اختيارات تستحقها</div>
          <h1 className="max-w-[480px] text-4xl font-black leading-[1.2] tracking-tight text-white md:text-[56px]">تقنية تحبها.<br /><span className="text-[#ffd45a]">قيمة تثق بها.</span></h1>
          <p className="mt-5 max-w-[410px] text-sm leading-7 text-white/70 md:text-base">أجهزة أصلية، أسعار واضحة، وفحص دقيق لكل جهاز مستعمل. اكتشف الفرق مع جوال وأكثر.</p>
          <div className="mt-7 flex flex-wrap items-center gap-3"><button onClick={() => onCategory("هواتف جديدة")} className="group flex items-center gap-3 rounded-xl bg-[#ffd45a] px-5 py-3.5 text-sm font-black text-[#14214a] transition hover:bg-white active:scale-[.98]">تسوق الآن <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" /></button><button onClick={() => onCategory("هواتف مستعملة")} className="rounded-xl border border-white/25 bg-white/5 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-white/10">تصفح المستعمل</button></div>
          <div className="mt-8 flex items-center gap-5 text-[11px] font-semibold text-white/55"><span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-[#ffd45a]" />ضمان موثوق</span><span className="flex items-center gap-1.5"><Truck className="h-4 w-4 text-[#ffd45a]" />شحن سريع</span></div>
        </div></div>
        <div className="absolute bottom-5 left-7 flex gap-1.5 md:left-16"><span className="h-1.5 w-8 rounded-full bg-[#ffd45a]" /><span className="h-1.5 w-2 rounded-full bg-white/35" /><span className="h-1.5 w-2 rounded-full bg-white/35" /></div>
      </div>
    </section>

    <section className="container py-10 md:py-14"><div className="mb-5 flex items-end justify-between"><div><p className="mb-1 text-xs font-black uppercase tracking-[0.18em] text-[#c9921a]">اكتشف مجموعتنا</p><h2 className="text-2xl font-black text-[#14214a] md:text-3xl">تسوق حسب الفئة</h2></div><button onClick={() => onCategory("هواتف جديدة")} className="hidden items-center gap-2 text-sm font-bold text-[#677086] transition hover:text-[#14214a] sm:flex">عرض الكل <ArrowLeft className="h-4 w-4" /></button></div><div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">{categories.map((category, index) => <button key={category.label} onClick={() => onCategory(category.label)} className="group flex min-h-[112px] flex-col items-center justify-center gap-3 rounded-2xl border border-[#e8e5df] bg-white p-4 text-center shadow-sm transition hover:-translate-y-1 hover:border-[#c9921a]/50 hover:shadow-lg"><span className={`flex h-11 w-11 items-center justify-center rounded-2xl transition ${index === 5 ? "bg-[#fff5d9] text-[#b17d0c]" : "bg-[#f0f2f8] text-[#14214a] group-hover:bg-[#14214a] group-hover:text-white"}`}>{category.icon}</span><span className="text-xs font-extrabold text-[#39435d]">{category.label}</span></button>)}</div></section>

    <section className="bg-[#f2f0eb] py-10 md:py-14"><div className="container"><SectionHeader eyebrow="اختياراتنا لك" title="وصل حديثاً" action="شاهد كل المنتجات" onAction={() => onCategory("هواتف جديدة")} /><div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">{products.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} onAdd={onAdd} onOpen={onOpen} onWish={onWish} wished={wishlist.includes(product.id)} />)}</div></div></section>

    <section className="container py-10 md:py-14"><div className="overflow-hidden rounded-[26px] bg-[#fff4d3]"><div className="grid items-center gap-8 p-7 md:grid-cols-[1fr_1.2fr] md:p-12"><div><div className="mb-3 inline-flex items-center gap-2 text-xs font-black text-[#9a6a05]"><Zap className="h-4 w-4 fill-current" />عرض لفترة محدودة</div><h2 className="text-3xl font-black leading-tight text-[#14214a] md:text-4xl">خصومات تصل إلى<br /><span className="text-[#b27b08]">٣٠٪ على المختارات</span></h2><p className="mt-4 max-w-[370px] text-sm leading-7 text-[#6e5a29]">لا تفوّت عروض اليوم على الأجهزة الجديدة والمستعملة بحالة ممتازة.</p><div className="mt-5 flex items-center gap-2" dir="ltr"><CountdownBlock value={Math.floor(countdown / 60)} label="دقيقة" /><span className="pb-5 text-xl font-black text-[#b27b08]">:</span><CountdownBlock value={countdown % 60} label="ثانية" /></div><button onClick={() => onCategory("العروض")} className="mt-6 flex items-center gap-2 rounded-xl bg-[#14214a] px-5 py-3 text-sm font-black text-white transition hover:bg-[#253a79]">استفد من العرض <ArrowLeft className="h-4 w-4" /></button></div><div className="relative hidden min-h-[250px] overflow-hidden rounded-2xl bg-[#14214a] md:block"><img src={assets.iphone} alt="عرض على آيفون" className="absolute -bottom-28 left-10 h-[470px] w-[470px] object-cover opacity-95 mix-blend-screen" /><div className="absolute right-8 top-8 rounded-2xl border border-white/20 bg-white/10 p-4 text-white backdrop-blur"><div className="text-3xl font-black text-[#ffd45a]">٣٠٪</div><div className="mt-1 text-xs font-bold text-white/70">خصم خاص</div></div></div></div></div></section>

    <section className="bg-[#f2f0eb] py-10 md:py-14"><div className="container"><SectionHeader eyebrow="الأكثر طلباً هذا الأسبوع" title="العملاء يحبونها" action="استكشف الأكثر مبيعاً" onAction={() => onCategory("الأكثر مبيعاً")} /><div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">{products.slice(1, 4).map((product) => <ProductCard key={product.id} product={product} onAdd={onAdd} onOpen={onOpen} onWish={onWish} wished={wishlist.includes(product.id)} />)}</div></div></section>

    <section className="container py-12 md:py-16"><SectionHeader eyebrow="لماذا جوال وأكثر؟" title="تجربة شراء أذكى" /><div className="grid gap-4 md:grid-cols-4">{[[<ShieldCheck />, "أصالة مضمونة", "نفحص كل جهاز ونتأكد من جودته قبل وصوله لك."], [<Truck />, "شحن سريع", "توصيل موثوق إلى جميع مدن المملكة خلال 1–3 أيام."], [<WalletCards />, "دفع آمن", "خيارات دفع مرنة تشمل مدى، Apple Pay والدفع عند الاستلام."], [<RotateCcw />, "استبدال سهل", "سياسة استبدال واضحة تمنحك راحة البال بعد الشراء."]].map(([icon, title, copy]) => <div key={title as string} className="rounded-2xl border border-[#e8e5df] bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg"><span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf0f8] text-[#14214a] [&>svg]:h-5 [&>svg]:w-5">{icon}</span><h3 className="font-black text-[#14214a]">{title}</h3><p className="mt-2 text-xs leading-6 text-[#727787]">{copy}</p></div>)}</div></section>

    <section className="container pb-14"><div className="mb-6 flex items-end justify-between"><div><p className="mb-1 text-xs font-black uppercase tracking-[0.18em] text-[#c9921a]">آراء عملائنا</p><h2 className="text-2xl font-black text-[#14214a]">تجارب تستحق المشاركة</h2></div><div className="flex gap-2"><button className="rounded-full border border-[#ddd9d1] p-2 text-[#727787]"><ChevronRight className="h-4 w-4" /></button><button className="rounded-full border border-[#14214a] bg-[#14214a] p-2 text-white"><ChevronLeft className="h-4 w-4" /></button></div></div><div className="grid gap-4 md:grid-cols-3">{[["سارة العتيبي", "طلبت آيفون مستعمل بحالة ممتازة ووصلني كأنه جديد تماماً. تجربة راقية وسريعة.", "S"], ["عبدالله القحطاني", "أعجبني وضوح الأسعار والتفاصيل. خدمة العملاء تجاوبوا معي بكل احترافية.", "A"], ["نورة الحربي", "الآيباد وصل بتغليف ممتاز وفي الموعد. أكيد راح أرجع أطلب منهم مرة ثانية.", "N"]].map(([name, copy, initial]) => <div key={name} className="rounded-2xl bg-[#f4f2ee] p-5"><div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#14214a] text-sm font-black text-[#ffd45a]">{initial}</span><div><p className="text-sm font-black text-[#14214a]">{name}</p><p className="text-[10px] font-semibold text-[#949597]">عميل موثوق</p></div></div><div className="flex gap-0.5 text-[#c9921a]">{[1, 2, 3, 4, 5].map((star) => <Star key={star} className="h-3.5 w-3.5 fill-current" />)}</div></div><p className="text-sm leading-7 text-[#5f6471]">“{copy}”</p></div>)}</div></section>

    <section className="border-y border-[#e8e5df] bg-white py-7"><div className="container flex flex-wrap items-center justify-center gap-x-10 gap-y-5 md:justify-between">{brands.map((brand) => <span key={brand} className="text-sm font-black tracking-[0.16em] text-[#b2b1af] transition hover:text-[#14214a]">{brand}</span>)}</div></section>
  </>;
}

function SectionHeader({ eyebrow, title, action, onAction }: { eyebrow: string; title: string; action?: string; onAction?: () => void }) {
  return <div className="mb-6 flex items-end justify-between"><div><p className="mb-1 text-xs font-black uppercase tracking-[0.18em] text-[#c9921a]">{eyebrow}</p><h2 className="text-2xl font-black text-[#14214a] md:text-3xl">{title}</h2></div>{action && <button onClick={onAction} className="hidden items-center gap-2 text-sm font-bold text-[#677086] transition hover:text-[#14214a] sm:flex">{action}<ArrowLeft className="h-4 w-4" /></button>}</div>;
}

function CountdownBlock({ value, label }: { value: number; label: string }) {
  return <div className="text-center"><div className="flex h-12 min-w-12 items-center justify-center rounded-xl bg-white text-xl font-black text-[#14214a] shadow-sm">{value.toString().padStart(2, "0")}</div><span className="mt-1 block text-[9px] font-bold text-[#9a7a2c]">{label}</span></div>;
}

function ProductCard({ product, onAdd, onOpen, onWish, wished }: { product: Product; onAdd: (product: Product) => void; onOpen: (id: string) => void; onWish: (id: string) => void; wished: boolean }) {
  return <article className="group relative overflow-hidden rounded-2xl border border-[#e8e5df] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><div className="relative aspect-[1/1.02] cursor-pointer overflow-hidden bg-[#f4f2ee]" onClick={() => onOpen(product.id)}><img src={product.image} alt={product.name} className="h-full w-full object-cover mix-blend-multiply transition duration-500 group-hover:scale-105" /><div className="absolute right-3 top-3 flex flex-col gap-1.5"><span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${product.condition === "جديد" ? "bg-[#e8f4ee] text-[#26734a]" : "bg-[#e7eef9] text-[#345c9c]"}`}>{product.condition}{product.grade ? ` · ${product.grade}` : ""}</span>{product.badge && <span className="rounded-full bg-[#14214a] px-2.5 py-1 text-[10px] font-black text-white">{product.badge}</span>}</div><button onClick={(event) => { event.stopPropagation(); onWish(product.id); }} className={`absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/85 shadow-sm backdrop-blur transition ${wished ? "text-[#c43d4b]" : "text-[#7f8490] hover:text-[#c43d4b]"}`} aria-label="إضافة للمفضلة"><Heart className={`h-4 w-4 ${wished ? "fill-current" : ""}`} /></button></div><div className="p-3.5 md:p-4"><div className="mb-1 flex items-center gap-1 text-[10px] text-[#c9921a]">{[1,2,3,4,5].map((star) => <Star key={star} className={`h-3 w-3 ${star <= Math.round(product.rating) ? "fill-current" : ""}`} />)}<span className="mr-1 text-[#9b9da2]">({product.reviews})</span></div><button onClick={() => onOpen(product.id)} className="block text-right text-sm font-black text-[#14214a] hover:text-[#b27b08]">{product.name}</button><p className="mt-1 text-[11px] text-[#818592]">{product.brand} · {product.subtitle}</p><div className="mt-3 flex items-end justify-between gap-2"><div><span className="block text-base font-black text-[#14214a]">{formatPrice(product.price)}</span>{product.oldPrice && <span className="text-[10px] font-semibold text-[#a5a5a4] line-through">{formatPrice(product.oldPrice)}</span>}</div><button onClick={() => onAdd(product)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#14214a] text-white transition hover:bg-[#c9921a] active:scale-95" aria-label={`إضافة ${product.name} للسلة`}><ShoppingBag className="h-4 w-4" /></button></div></div></article>;
}

function CategoryPage({ categoryLabel, products, onAdd, onOpen, onWish, wishlist }: { categoryLabel: string; products: Product[]; onAdd: (product: Product) => void; onOpen: (id: string) => void; onWish: (id: string) => void; wishlist: string[] }) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [condition, setCondition] = useState("الكل");
  const [brand, setBrand] = useState("الكل");
  const categoryProducts = categoryLabel === "العروض" ? products.filter((product) => product.oldPrice) : categoryLabel === "ماركات عالمية" || !categoryLabel ? products : products.filter((product) => product.category === categoryLabel);
  const filteredByBrand = brand === "الكل" ? categoryProducts : categoryProducts.filter((product) => product.brand === brand);
  const filtered = condition === "الكل" ? filteredByBrand : filteredByBrand.filter((product) => product.condition === condition);
  return <section className="container py-8 md:py-12"><div className="mb-8 rounded-3xl bg-[#14214a] p-7 text-white md:p-10"><p className="mb-2 text-xs font-black tracking-[0.2em] text-[#ffd45a]">{categoryLabel || "تشكيلة منتقاة بعناية"}</p><h1 className="text-3xl font-black md:text-4xl">{categoryLabel && categoryLabel !== "ماركات عالمية" ? categoryLabel : "تسوق أجهزتك بثقة"}</h1><p className="mt-3 max-w-[520px] text-sm leading-7 text-white/65">قارن بين أحدث الأجهزة والخيارات المستعملة المفحوصة، واختر ما يناسبك.</p></div><div className="flex flex-col gap-6 lg:flex-row"><aside className="h-fit w-full rounded-2xl border border-[#e8e5df] bg-white p-5 lg:w-60"><div className="mb-5 flex items-center justify-between"><h2 className="font-black text-[#14214a]">تصفية النتائج</h2><SlidersHorizontal className="h-4 w-4 text-[#c9921a]" /></div><FilterGroup title="الحالة" options={["الكل", "جديد", "مستعمل"]} selected={condition} onChange={setCondition} /><FilterGroup title="العلامة التجارية" options={["الكل", "Apple", "Samsung", "Huawei", "Xiaomi"]} selected={brand} onChange={setBrand} /><FilterGroup title="السعة التخزينية" options={["64GB", "128GB", "256GB", "512GB"]} /></aside><div className="min-w-0 flex-1"><div className="mb-5 flex items-center justify-between"><p className="text-sm font-bold text-[#737887]">عرض <span className="text-[#14214a]">{filtered.length}</span> منتج</p><div className="flex items-center gap-2"><button className="hidden items-center gap-2 rounded-xl border border-[#e8e5df] bg-white px-3 py-2 text-xs font-bold text-[#596176] sm:flex">الأحدث <ChevronDown className="h-3.5 w-3.5" /></button><button onClick={() => setView("grid")} className={`rounded-lg p-2 ${view === "grid" ? "bg-[#14214a] text-white" : "bg-white text-[#8a8c95]"}`}><LayoutGrid className="h-4 w-4" /></button><button onClick={() => setView("list")} className={`rounded-lg p-2 ${view === "list" ? "bg-[#14214a] text-white" : "bg-white text-[#8a8c95]"}`}><List className="h-4 w-4" /></button></div></div>{filtered.length ? <div className={view === "grid" ? "grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5" : "grid gap-3"}>{filtered.map((product) => <ProductCard key={product.id} product={product} onAdd={onAdd} onOpen={onOpen} onWish={onWish} wished={wishlist.includes(product.id)} />)}</div> : <div className="rounded-2xl border border-dashed border-[#e8e5df] bg-white p-12 text-center"><Search className="mx-auto h-8 w-8 text-[#c9921a]" /><p className="mt-3 font-black text-[#14214a]">لا توجد منتجات مطابقة</p><p className="mt-1 text-xs text-[#858a96]">جرّب تغيير الفلاتر أو تصفح فئة أخرى.</p></div>}</div></div></section>;
}

function FilterGroup({ title, options, selected, onChange }: { title: string; options: string[]; selected?: string; onChange?: (value: string) => void }) {
  return <div className="border-t border-[#eeeae4] py-4 first:border-0 first:pt-0"><h3 className="mb-3 text-xs font-black text-[#39435d]">{title}</h3><div className="space-y-2">{options.map((option) => <button key={option} onClick={() => onChange?.(option)} className={`flex w-full items-center justify-between text-right text-xs ${selected === option ? "font-black text-[#14214a]" : "text-[#7d818c]"}`}><span className="flex items-center gap-2"><span className={`flex h-4 w-4 items-center justify-center rounded border ${selected === option ? "border-[#14214a] bg-[#14214a] text-white" : "border-[#d6d3cd]"}`}>{selected === option && <Check className="h-3 w-3" />}</span>{option}</span>{option === "الكل" && <span className="text-[10px]">{products.length}</span>}</button>)}</div></div>;
}

function ProductPage({ product, onBack, onAdd, wished, onWish }: { product: Product; onBack: () => void; onAdd: (product: Product) => void; wished: boolean; onWish: () => void }) {
  const [quantity, setQuantity] = useState(1);
  const gallery = [product.image, ...(product.gallery ?? [])].filter((image, index, items) => image && items.indexOf(image) === index).slice(0, 8);
  const [activeImage, setActiveImage] = useState(product.image);
  useEffect(() => setActiveImage(product.image), [product.id, product.image]);
  return <section className="container py-7 md:py-12"><button onClick={onBack} className="mb-6 flex items-center gap-2 text-sm font-bold text-[#777c89] transition hover:text-[#14214a]"><ArrowRight className="h-4 w-4" />العودة للمنتجات</button><div className="grid gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-14"><div><div className="relative aspect-square overflow-hidden rounded-3xl bg-[#f1efeb]"><img src={activeImage} alt={product.name} className="h-full w-full object-cover mix-blend-multiply" /><span className={`absolute right-5 top-5 rounded-full px-3 py-1.5 text-xs font-black ${product.condition === "جديد" ? "bg-[#e8f4ee] text-[#26734a]" : "bg-[#e7eef9] text-[#345c9c]"}`}>{product.condition}{product.grade ? ` · ${product.grade}` : ""}</span></div><div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-6">{gallery.map((image) => <button key={image} onClick={() => setActiveImage(image)} className={`aspect-square overflow-hidden rounded-xl bg-[#f1efeb] ${activeImage === image ? "border-2 border-[#14214a]" : "border border-[#e5e2dc]"}`}><img src={image} alt="" className="h-full w-full object-cover mix-blend-multiply" /></button>)}</div></div><div className="flex flex-col justify-center"><div className="mb-3 flex items-center gap-2 text-xs font-bold text-[#c9921a]"><span className="flex gap-0.5">{[1,2,3,4,5].map((star) => <Star key={star} className="h-4 w-4 fill-current" />)}</span><span className="text-[#858a96]">{product.rating} · {product.reviews} تقييم</span></div><h1 className="text-3xl font-black text-[#14214a] md:text-4xl">{product.name}</h1><p className="mt-2 text-sm text-[#777c89]">{product.brand} · {product.subtitle}</p><div className="mt-6 flex items-end gap-3"><span className="text-3xl font-black text-[#14214a]">{formatPrice(product.price)}</span>{product.oldPrice && <span className="mb-1 text-sm font-semibold text-[#a8a6a2] line-through">{formatPrice(product.oldPrice)}</span>}</div><div className="my-6 h-px bg-[#e8e5df]" /><div className="space-y-4 text-sm"><div className="flex items-center justify-between"><span className="text-[#808593]">اللون</span><span className="font-black text-[#14214a]">{product.color}</span></div><div className="flex items-center justify-between"><span className="text-[#808593]">السعة</span><div className="flex gap-2"><span className="rounded-lg border-2 border-[#14214a] px-3 py-1 text-xs font-black">{product.storage}</span></div></div>{product.battery && <div className="flex items-center justify-between"><span className="text-[#808593]">صحة البطارية</span><span className="font-black text-[#26734a]">{product.battery} · ممتازة</span></div>}<div className="flex items-center justify-between"><span className="text-[#808593]">الضمان</span><span className="flex items-center gap-1.5 font-black text-[#26734a]"><ShieldCheck className="h-4 w-4" />ضمان 12 شهر</span></div></div><div className="mt-8 flex gap-3"><div className="flex h-12 items-center rounded-xl border border-[#e4e1db] bg-white"><button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 text-[#7d818c]"><Minus className="h-4 w-4" /></button><span className="w-6 text-center text-sm font-black">{quantity}</span><button onClick={() => setQuantity(quantity + 1)} className="px-3 text-[#7d818c]"><Plus className="h-4 w-4" /></button></div><button onClick={() => { for (let index = 0; index < quantity; index += 1) onAdd(product); }} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#14214a] px-4 text-sm font-black text-white transition hover:bg-[#c9921a]"><ShoppingBag className="h-4 w-4" />أضف للسلة</button><button onClick={onWish} className={`flex h-12 w-12 items-center justify-center rounded-xl border ${wished ? "border-[#c43d4b] text-[#c43d4b]" : "border-[#e4e1db] text-[#727887]"}`}><Heart className={`h-5 w-5 ${wished ? "fill-current" : ""}`} /></button></div><button className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#e4e1db] py-3 text-sm font-black text-[#14214a]"><Share2 className="h-4 w-4" />مشاركة المنتج</button></div></div><div className="mt-12 border-t border-[#e8e5df] pt-8"><h2 className="mb-5 text-xl font-black text-[#14214a]">تفاصيل المنتج</h2>{product.specs && <div className="mb-5 rounded-2xl bg-[#f4f2ee] p-5"><p className="text-xs font-black text-[#858a96]">المواصفات</p><p className="mt-2 whitespace-pre-line text-sm leading-7 text-[#14214a]">{product.specs}</p></div>}<div className="grid gap-3 md:grid-cols-3">{[["الحالة", product.condition === "جديد" ? "جديد بالكرتون" : `${product.grade} · مفحوص`], ["الشحن", "مجاني خلال 1–3 أيام"], ["الإرجاع", "استبدال خلال 7 أيام"]].map(([label, value]) => <div key={label} className="rounded-xl bg-[#f4f2ee] p-4"><p className="text-xs text-[#858a96]">{label}</p><p className="mt-1 text-sm font-black text-[#14214a]">{value}</p></div>)}</div></div></section>;
}

function CartDrawer({ cart, total, changeQuantity, onClose, onCheckout }: { cart: CartLine[]; total: number; changeQuantity: (id: string, delta: number) => void; onClose: () => void; onCheckout: () => void }) {
  return <div className="fixed inset-0 z-50"><button onClick={onClose} className="absolute inset-0 bg-[#10182f]/40 backdrop-blur-sm" aria-label="إغلاق السلة" /><aside className="absolute bottom-0 left-0 top-0 w-full max-w-[430px] overflow-y-auto bg-[#fbfaf8] p-5 shadow-2xl md:p-7"><div className="flex items-center justify-between border-b border-[#e8e5df] pb-5"><div><h2 className="text-xl font-black text-[#14214a]">سلة التسوق</h2><p className="mt-1 text-xs text-[#858a96]">{cart.length ? `${cart.length} منتجات في السلة` : "سلتك بانتظار اختياراتك"}</p></div><button onClick={onClose} className="rounded-xl bg-white p-2 text-[#777c89]"><X className="h-5 w-5" /></button></div>{cart.length === 0 ? <EmptyCart onClose={onClose} /> : <><div className="space-y-4 py-6">{cart.map((line) => <CartLineItem key={line.id} line={line} changeQuantity={changeQuantity} />)}</div><div className="rounded-2xl bg-white p-5 shadow-sm"><div className="mb-3 flex justify-between text-sm text-[#858a96]"><span>المجموع الفرعي</span><span className="font-black text-[#14214a]">{formatPrice(total)}</span></div><div className="mb-4 flex justify-between text-sm text-[#858a96]"><span>الشحن</span><span className="font-black text-[#26734a]">مجاني</span></div><div className="border-t border-[#eeeae4] pt-4"><div className="flex justify-between"><span className="font-black text-[#14214a]">الإجمالي</span><span className="text-xl font-black text-[#14214a]">{formatPrice(total)}</span></div></div><button onClick={onCheckout} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#14214a] py-3.5 text-sm font-black text-white transition hover:bg-[#c9921a]">إتمام الطلب <ArrowLeft className="h-4 w-4" /></button></div></>}</aside></div>;
}

function CartLineItem({ line, changeQuantity }: { line: CartLine; changeQuantity: (id: string, delta: number) => void }) {
  return <div className="flex gap-3"><img src={line.image} alt={line.name} className="h-20 w-20 rounded-xl bg-[#f1efeb] object-cover mix-blend-multiply" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-black text-[#14214a]">{line.name}</p><p className="mt-1 text-[11px] text-[#858a96]">{line.subtitle}</p><div className="mt-3 flex items-center justify-between"><div className="flex items-center rounded-lg border border-[#e4e1db] bg-white"><button onClick={() => changeQuantity(line.id, -1)} className="px-2 py-1 text-[#7d818c]"><Minus className="h-3 w-3" /></button><span className="px-2 text-xs font-black">{line.quantity}</span><button onClick={() => changeQuantity(line.id, 1)} className="px-2 py-1 text-[#7d818c]"><Plus className="h-3 w-3" /></button></div><span className="text-sm font-black text-[#14214a]">{formatPrice(line.price * line.quantity)}</span></div></div></div>;
}

function EmptyCart({ onClose }: { onClose: () => void }) {
  return <div className="flex flex-col items-center py-20 text-center"><span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#edf0f8] text-[#14214a]"><ShoppingCart className="h-7 w-7" /></span><h3 className="mt-5 font-black text-[#14214a]">السلة فارغة حالياً</h3><p className="mt-2 max-w-[230px] text-xs leading-6 text-[#858a96]">أضف المنتجات التي تعجبك وسنجهزها لك بعناية.</p><button onClick={onClose} className="mt-6 rounded-xl bg-[#14214a] px-5 py-3 text-xs font-black text-white">ابدأ التسوق</button></div>;
}

function CartPage({ cart, total, changeQuantity, onBack, onCheckout }: { cart: CartLine[]; total: number; changeQuantity: (id: string, delta: number) => void; onBack: () => void; onCheckout: () => void }) {
  return <section className="container py-8 md:py-12"><button onClick={onBack} className="mb-6 flex items-center gap-2 text-sm font-bold text-[#777c89]"><ArrowRight className="h-4 w-4" />متابعة التسوق</button><h1 className="mb-7 text-3xl font-black text-[#14214a]">مراجعة السلة</h1>{cart.length === 0 ? <div className="rounded-3xl bg-white p-12 text-center shadow-sm"><ShoppingBag className="mx-auto h-10 w-10 text-[#c9921a]" /><h2 className="mt-4 font-black text-[#14214a]">لا توجد منتجات بعد</h2><button onClick={onBack} className="mt-5 rounded-xl bg-[#14214a] px-5 py-3 text-sm font-black text-white">استكشف المنتجات</button></div> : <div className="grid gap-6 lg:grid-cols-[1fr_350px]"><div className="space-y-3">{cart.map((line) => <div key={line.id} className="flex gap-4 rounded-2xl border border-[#e8e5df] bg-white p-4"><img src={line.image} alt={line.name} className="h-24 w-24 rounded-xl bg-[#f1efeb] object-cover mix-blend-multiply" /><div className="flex min-w-0 flex-1 flex-col justify-between"><div><h2 className="font-black text-[#14214a]">{line.name}</h2><p className="mt-1 text-xs text-[#858a96]">{line.subtitle}</p></div><div className="flex items-center justify-between"><div className="flex items-center rounded-lg border border-[#e4e1db]"><button onClick={() => changeQuantity(line.id, -1)} className="px-2 py-1"><Minus className="h-3.5 w-3.5" /></button><span className="px-2 text-xs font-black">{line.quantity}</span><button onClick={() => changeQuantity(line.id, 1)} className="px-2 py-1"><Plus className="h-3.5 w-3.5" /></button></div><span className="font-black text-[#14214a]">{formatPrice(line.price * line.quantity)}</span></div></div></div>)}</div><OrderSummary total={total} onCheckout={onCheckout} /></div>}</section>;
}

function OrderSummary({ total, onCheckout }: { total: number; onCheckout: () => void }) {
  return <div className="h-fit rounded-2xl bg-white p-6 shadow-sm"><h2 className="mb-5 text-lg font-black text-[#14214a]">ملخص الطلب</h2><div className="space-y-3 text-sm"><div className="flex justify-between text-[#858a96]"><span>المجموع الفرعي</span><span className="font-bold text-[#14214a]">{formatPrice(total)}</span></div><div className="flex justify-between text-[#858a96]"><span>الشحن</span><span className="font-bold text-[#26734a]">مجاني</span></div><div className="flex justify-between text-[#858a96]"><span>الضريبة (15%)</span><span className="font-bold text-[#14214a]">{formatPrice(total * 0.15)}</span></div></div><div className="my-5 border-t border-[#eeeae4] pt-5"><div className="flex items-center justify-between"><span className="font-black text-[#14214a]">الإجمالي</span><span className="text-xl font-black text-[#14214a]">{formatPrice(total * 1.15)}</span></div></div><div className="mb-4 flex gap-2"><input placeholder="كود الخصم" className="min-w-0 flex-1 rounded-xl border border-[#e4e1db] px-3 text-xs outline-none focus:border-[#14214a]" /><button className="rounded-xl border border-[#14214a] px-3 text-xs font-black text-[#14214a]">تطبيق</button></div><button onClick={onCheckout} className="w-full rounded-xl bg-[#14214a] py-3.5 text-sm font-black text-white transition hover:bg-[#c9921a]">إتمام الطلب</button><p className="mt-4 text-center text-[10px] text-[#9b9da2]">دفع آمن ومشفّر 100%</p></div>;
}

function CheckoutPage({ cart, total, onBack, onComplete }: { cart: CartLine[]; total: number; onBack: () => void; onComplete: () => void }) {
  const [step, setStep] = useState(1);
  return <section className="container py-8 md:py-12"><button onClick={onBack} className="mb-7 flex items-center gap-2 text-sm font-bold text-[#777c89]"><ArrowRight className="h-4 w-4" />العودة للسلة</button><div className="mx-auto max-w-[980px]"><div className="mb-10 flex items-center justify-between"><h1 className="text-3xl font-black text-[#14214a]">إتمام الطلب</h1><span className="flex items-center gap-2 text-xs font-bold text-[#26734a]"><LockKeyhole className="h-4 w-4" />دفع آمن</span></div><div className="mb-10 flex items-center justify-between gap-2">{["بيانات التوصيل", "طريقة الشحن", "الدفع", "التأكيد"].map((label, index) => <div key={label} className="flex flex-1 items-center gap-2"><div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black ${step >= index + 1 ? "bg-[#14214a] text-white" : "bg-[#e9e6df] text-[#949597]"}`}>{step > index + 1 ? <Check className="h-4 w-4" /> : index + 1}</div><span className={`hidden text-xs font-bold sm:block ${step >= index + 1 ? "text-[#14214a]" : "text-[#a4a4a2]"}`}>{label}</span>{index < 3 && <div className={`h-px flex-1 ${step > index + 1 ? "bg-[#14214a]" : "bg-[#e0ddd6]"}`} />}</div>)}</div><div className="grid gap-6 lg:grid-cols-[1fr_320px]"><div className="rounded-2xl border border-[#e8e5df] bg-white p-6 md:p-8">{step === 1 && <CheckoutForm title="بيانات التوصيل"><div className="grid gap-4 md:grid-cols-2"><Field label="الاسم الكامل" placeholder="مثال: محمد العتيبي" /><Field label="رقم الجوال" placeholder="05X XXX XXXX" /><Field label="المدينة" placeholder="الرياض" /><Field label="الحي" placeholder="اسم الحي" /><Field label="العنوان بالتفصيل" placeholder="الشارع، رقم المبنى، الشقة" full /></div></CheckoutForm>}{step === 2 && <CheckoutForm title="اختر طريقة الشحن"><div className="space-y-3"><Choice title="توصيل سريع" copy="يصل خلال 1–2 يوم عمل" price="29 ر.س" active /><Choice title="توصيل عادي" copy="يصل خلال 2–4 أيام عمل" price="مجاني" /><Choice title="استلام من الفرع" copy="الرياض · طريق الملك فهد" price="مجاني" /></div></CheckoutForm>}{step === 3 && <CheckoutForm title="اختر طريقة الدفع"><div className="space-y-3"><Choice title="مدى / فيزا / ماستركارد" copy="دفع آمن عبر بوابة الدفع" price="" active icon={<CreditCard className="h-5 w-5" />} /><Choice title="Apple Pay" copy="ادفع بسرعة من جهازك" price="" icon={<span className="text-lg font-black"></span>} /><Choice title="الدفع عند الاستلام" copy="متاح للطلبات داخل المملكة" price="+ 10 ر.س" icon={<WalletCards className="h-5 w-5" />} /></div></CheckoutForm>}{step === 4 && <div className="py-8 text-center"><span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e8f4ee] text-[#26734a]"><CheckCircle2 className="h-8 w-8" /></span><h2 className="mt-5 text-2xl font-black text-[#14214a]">جاهز لتأكيد طلبك؟</h2><p className="mx-auto mt-2 max-w-[360px] text-sm leading-7 text-[#858a96]">بمجرد الضغط على التأكيد سيتم تجهيز طلبك وإرسال تفاصيله إلى جوالك.</p></div>}<div className="mt-8 flex justify-between gap-3"><button onClick={() => step > 1 && setStep(step - 1)} className={`rounded-xl border border-[#e4e1db] px-5 py-3 text-sm font-black text-[#677086] ${step === 1 ? "invisible" : ""}`}>رجوع</button><button onClick={() => step < 4 ? setStep(step + 1) : onComplete()} className="flex items-center gap-2 rounded-xl bg-[#14214a] px-6 py-3 text-sm font-black text-white transition hover:bg-[#c9921a]">{step === 4 ? "تأكيد الطلب" : "متابعة"}<ArrowLeft className="h-4 w-4" /></button></div></div><OrderSummary total={total} onCheckout={() => undefined} /></div></div></section>;
}

function CheckoutForm({ title, children }: { title: string; children: React.ReactNode }) { return <div><h2 className="mb-6 text-xl font-black text-[#14214a]">{title}</h2>{children}</div>; }
function Field({ label, placeholder, full }: { label: string; placeholder: string; full?: boolean }) { return <label className={full ? "md:col-span-2" : ""}><span className="mb-2 block text-xs font-black text-[#535a6b]">{label}</span><input placeholder={placeholder} className="h-12 w-full rounded-xl border border-[#e4e1db] bg-[#fbfaf8] px-4 text-sm outline-none transition focus:border-[#14214a] focus:ring-4 focus:ring-[#14214a]/10" /></label>; }
function Choice({ title, copy, price, active, icon }: { title: string; copy: string; price: string; active?: boolean; icon?: React.ReactNode }) { return <button className={`flex w-full items-center gap-4 rounded-xl border p-4 text-right transition ${active ? "border-[#14214a] bg-[#f4f6fb]" : "border-[#e8e5df] bg-white hover:border-[#b9b7b2]"}`}><span className={`flex h-5 w-5 items-center justify-center rounded-full border ${active ? "border-[#14214a]" : "border-[#c9c6bf]"}`}>{active && <span className="h-2.5 w-2.5 rounded-full bg-[#14214a]" />}</span>{icon && <span className="text-[#14214a]">{icon}</span>}<span className="flex-1"><span className="block text-sm font-black text-[#14214a]">{title}</span><span className="mt-1 block text-xs text-[#858a96]">{copy}</span></span><span className="text-xs font-black text-[#14214a]">{price}</span></button>; }

function AccountPage({ onLogin }: { onLogin: () => void }) { return <section className="container py-14"><div className="mx-auto max-w-[760px] rounded-3xl bg-[#14214a] p-8 text-white md:p-12"><div className="grid gap-10 md:grid-cols-[1fr_0.8fr] md:items-center"><div><span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ffd45a] text-[#14214a]"><UserRound className="h-6 w-6" /></span><h1 className="text-3xl font-black">أهلاً بك في حسابك</h1><p className="mt-4 text-sm leading-7 text-white/65">سجل دخولك لتتابع طلباتك، تحفظ عناوينك، وتستمتع بتجربة أسرع.</p><div className="mt-7 space-y-3 text-sm font-semibold text-white/80"><p className="flex items-center gap-2"><PackageCheck className="h-4 w-4 text-[#ffd45a]" />تتبع طلباتك بسهولة</p><p className="flex items-center gap-2"><Heart className="h-4 w-4 text-[#ffd45a]" />احفظ منتجاتك المفضلة</p><p className="flex items-center gap-2"><Tag className="h-4 w-4 text-[#ffd45a]" />عروض مخصصة لك</p></div></div><div className="rounded-2xl bg-white p-6 text-[#14214a]"><h2 className="text-lg font-black">تسجيل الدخول</h2><p className="mt-1 text-xs text-[#858a96]">بالجوال أو البريد الإلكتروني</p><input placeholder="رقم الجوال أو البريد" className="mt-5 h-12 w-full rounded-xl border border-[#e4e1db] px-3 text-sm outline-none" /><button onClick={onLogin} className="mt-3 w-full rounded-xl bg-[#14214a] py-3 text-sm font-black text-white">إرسال رمز التحقق</button><div className="my-5 flex items-center gap-3 text-[10px] text-[#aaa9a5]"><span className="h-px flex-1 bg-[#e8e5df]" />أو<span className="h-px flex-1 bg-[#e8e5df]" /></div><button onClick={onLogin} className="w-full rounded-xl border border-[#e4e1db] py-3 text-xs font-black">المتابعة مع Google</button></div></div></div></section>; }

function AdminPage() { return <section className="container py-8 md:py-12"><div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="mb-2 text-xs font-black tracking-[0.2em] text-[#c9921a]">لوحة التحكم</p><h1 className="text-3xl font-black text-[#14214a]">نظرة عامة على المتجر</h1></div><button className="flex items-center gap-2 rounded-xl bg-[#14214a] px-4 py-3 text-xs font-black text-white"><BarChart3 className="h-4 w-4" />تصدير التقرير</button></div><div className="grid gap-4 md:grid-cols-4">{[["إجمالي المبيعات", "48,920 ر.س", "+18.4%", <BarChart3 />], ["الطلبات", "126", "+12.8%", <ShoppingBag />], ["عملاء جدد", "84", "+9.2%", <UserRound />], ["متوسط السلة", "388 ر.س", "+4.6%", <WalletCards />]].map(([label, value, change, icon]) => <div key={label as string} className="rounded-2xl border border-[#e8e5df] bg-white p-5"><div className="flex items-start justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf0f8] text-[#14214a] [&>svg]:h-5 [&>svg]:w-5">{icon}</span><span className="rounded-full bg-[#e8f4ee] px-2 py-1 text-[10px] font-black text-[#26734a]">{change}</span></div><p className="mt-5 text-xs font-bold text-[#858a96]">{label}</p><p className="mt-1 text-2xl font-black text-[#14214a]">{value}</p></div>)}</div><div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]"><div className="rounded-2xl border border-[#e8e5df] bg-white p-6"><div className="mb-6 flex items-center justify-between"><h2 className="font-black text-[#14214a]">المبيعات خلال الأسبوع</h2><span className="text-xs font-bold text-[#858a96]">آخر 7 أيام</span></div><div className="flex h-48 items-end gap-3 border-b border-[#eeeae4] px-2">{[48, 62, 54, 78, 68, 92, 84].map((height, index) => <div key={index} className="group flex flex-1 flex-col items-center gap-2"><div className="w-full rounded-t-lg bg-[#dfe5f5] transition group-hover:bg-[#c9921a]" style={{ height: `${height}%` }} /><span className="text-[10px] text-[#a1a2a2]">{["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"][index]}</span></div>)}</div></div><div className="rounded-2xl border border-[#e8e5df] bg-white p-6"><h2 className="mb-5 font-black text-[#14214a]">الأكثر مبيعاً</h2><div className="space-y-4">{products.slice(0, 4).map((product, index) => <div key={product.id} className="flex items-center gap-3"><span className="text-xs font-black text-[#b2b1ae]">0{index + 1}</span><img src={product.image} alt="" className="h-12 w-12 rounded-xl bg-[#f1efeb] object-cover mix-blend-multiply" /><div className="min-w-0 flex-1"><p className="truncate text-xs font-black text-[#14214a]">{product.name}</p><p className="mt-1 text-[10px] text-[#858a96]">{product.reviews + 42} عملية بيع</p></div><span className="text-xs font-black text-[#14214a]">{formatPrice(product.price)}</span></div>)}</div></div></div></section>; }

function Footer({ onNavigate }: { onNavigate: (path: string) => void }) { return <footer className="bg-[#14214a] pb-24 pt-12 text-white md:pb-10"><div className="container"><div className="grid gap-10 border-b border-white/10 pb-10 md:grid-cols-[1.4fr_1fr_1fr_1.1fr]"><div><div className="flex items-center gap-3"><LogoMark /><div><p className="font-black">جوال وأكثر</p><p className="text-[10px] font-semibold tracking-[0.18em] text-[#ffd45a]">JAWAL & MORE</p></div></div><p className="mt-5 max-w-[270px] text-sm leading-7 text-white/55">وجهتك الموثوقة لشراء الهواتف الذكية والآيبادات الجديدة والمستعملة في المملكة العربية السعودية.</p><div className="mt-5 grid max-w-[290px] grid-cols-3 gap-2">
              <a href="https://www.snapchat.com/add/gwalat7?share_id=q-mmV7R3dOw&locale=ar-SA" target="_blank" rel="noreferrer" className="group flex flex-col items-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.06] px-2 py-3 text-[10px] font-black text-white/70 transition duration-200 hover:-translate-y-1 hover:border-[#ffd45a]/60 hover:bg-[#ffd45a] hover:text-[#14214a] hover:shadow-lg hover:shadow-[#ffd45a]/20" title="سناب شات gwalat7"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ffd45a] text-[#14214a] transition group-hover:scale-110"><Sparkles className="h-4 w-4" /></span><span>سناب شات</span></a>
              <a href="https://www.tiktok.com/@gwalat7?_r=1&_t=ZS-99hq2dhRRLR" target="_blank" rel="noreferrer" className="group flex flex-col items-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.06] px-2 py-3 text-[10px] font-black text-white/70 transition duration-200 hover:-translate-y-1 hover:border-[#ffd45a]/60 hover:bg-[#ffd45a] hover:text-[#14214a] hover:shadow-lg hover:shadow-[#ffd45a]/20" title="تيك توك gwalat7"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white transition group-hover:scale-110 group-hover:bg-[#14214a] group-hover:text-[#ffd45a]"><Music2 className="h-4 w-4" /></span><span>تيك توك</span></a>
              <a href="https://t.me/jawaalatbot" target="_blank" rel="noreferrer" className="group flex flex-col items-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.06] px-2 py-3 text-[10px] font-black text-white/70 transition duration-200 hover:-translate-y-1 hover:border-[#ffd45a]/60 hover:bg-[#ffd45a] hover:text-[#14214a] hover:shadow-lg hover:shadow-[#ffd45a]/20" title="تليجرام jawaalatbot"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#168ac0] text-white transition group-hover:scale-110"><Send className="h-4 w-4 -rotate-12" /></span><span>تليجرام</span></a>
            </div></div><div><h3 className="mb-4 text-sm font-black text-white">تسوق معنا</h3><div className="space-y-3 text-xs font-semibold text-white/55"><button onClick={() => onNavigate("/category/هواتف جديدة")} className="block hover:text-[#ffd45a]">هواتف جديدة</button><button onClick={() => onNavigate("/category/هواتف مستعملة")} className="block hover:text-[#ffd45a]">هواتف مستعملة</button><button onClick={() => onNavigate("/category/آيباد جديد")} className="block hover:text-[#ffd45a]">آيباد وأجهزة لوحية</button><button onClick={() => onNavigate("/category/إكسسوارات")} className="block hover:text-[#ffd45a]">الإكسسوارات</button></div></div><div><h3 className="mb-4 text-sm font-black text-white">خدمة العملاء</h3><div className="space-y-3 text-xs font-semibold text-white/55"><p>سياسة الاستبدال والاسترجاع</p><p>الشروط والأحكام</p><p>سياسة الخصوصية</p><p>الأسئلة الشائعة</p></div></div><div><h3 className="mb-4 text-sm font-black text-white">ابقَ على تواصل</h3><p className="text-xs leading-6 text-white/55">فريقنا جاهز لمساعدتك من السبت إلى الخميس، 9 صباحاً – 11 مساءً.</p><div className="mt-4 space-y-3 text-xs font-bold text-white/80"><p className="flex items-center gap-2"><Phone className="h-4 w-4 text-[#ffd45a]" /><a href="tel:0546026420" className="hover:text-[#ffd45a]">0546026420 اتصال</a></p><p className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-[#ffd45a]" /><a href="https://wa.me/966546026420" target="_blank" rel="noreferrer" className="hover:text-[#ffd45a]">0546026420 واتساب</a></p></div></div></div><div className="flex flex-col gap-4 pt-6 text-[10px] font-semibold text-white/35 md:flex-row md:items-center md:justify-between"><p>© 2026 جوال وأكثر. جميع الحقوق محفوظة.</p><div className="flex items-center gap-3"><span>سجل تجاري: 1010XXXXXX</span><span className="rounded bg-white/10 px-2 py-1 text-[#ffd45a]">معروف</span><span className="flex items-center gap-1"><CreditCard className="h-3 w-3" />مدى · Apple Pay · STC Pay</span></div></div></div></footer>; }

function MobileTab({ icon, label, count, onClick, active }: { icon: React.ReactNode; label: string; count?: number; onClick: () => void; active?: boolean }) { return <button onClick={onClick} className={`relative flex flex-col items-center gap-1 px-3 py-1 text-[10px] font-bold ${active ? "text-[#14214a]" : "text-[#858a96]"}`}><span className="[&>svg]:h-[18px] [&>svg]:w-[18px]">{icon}</span>{label}{count ? <span className="absolute -right-0.5 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#c9921a] px-1 text-[9px] text-white">{count}</span> : null}</button>; }
