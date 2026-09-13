import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertBrand, InsertCategory, InsertProduct, InsertUser, brands, categories, products, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  values.lastSignedIn ??= new Date();
  if (!Object.keys(updateSet).length) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function listCatalogProducts() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: products.id,
    sku: products.sku,
    slug: products.slug,
    name: products.name,
    brandId: products.brandId,
    categoryId: products.categoryId,
    brand: brands.name,
    category: categories.name,
    condition: products.condition,
    grade: products.grade,
    price: products.price,
    oldPrice: products.oldPrice,
    stock: products.stock,
    imageUrl: products.imageUrl,
    specs: products.specs,
    galleryUrls: products.galleryUrls,
    storage: products.storage,
    color: products.color,
    batteryPercent: products.batteryPercent,
    warrantyMonths: products.warrantyMonths,
    rating: products.rating,
    reviewCount: products.reviewCount,
    createdAt: products.createdAt,
  }).from(products).leftJoin(brands, eq(products.brandId, brands.id)).leftJoin(categories, eq(products.categoryId, categories.id)).orderBy(desc(products.createdAt));
}

export async function listCatalogBrands() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(brands).orderBy(brands.name);
}

export async function listCatalogCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).orderBy(categories.name);
}

export async function createCatalogProduct(product: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const result = await db.insert(products).values(product);
  return result;
}

export async function updateCatalogStock(id: number, stock: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.update(products).set({ stock, updatedAt: new Date() }).where(eq(products.id, id));
}

export async function updateCatalogProduct(id: number, data: { sku?: string; slug?: string; name?: string; brandId?: number; categoryId?: number; condition?: "new" | "used"; grade?: string | null; price?: number; oldPrice?: number | null; stock?: number; storage?: string | null; color?: string | null; warrantyMonths?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.update(products).set({ ...data, updatedAt: new Date() }).where(eq(products.id, id));
}

export async function updateCatalogProductImage(id: number, imageUrl: string | null) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.update(products).set({ imageUrl, updatedAt: new Date() }).where(eq(products.id, id));
}

export async function updateCatalogProductGallery(id: number, galleryUrls: string | null) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.update(products).set({ galleryUrls, updatedAt: new Date() }).where(eq(products.id, id));
}

export async function deleteCatalogProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.delete(products).where(eq(products.id, id));
}

export async function createCatalogBrand(brand: InsertBrand) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.insert(brands).values(brand);
}

export async function createCatalogCategory(category: InsertCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.insert(categories).values(category);
}

export async function updateCatalogBrand(id: number, data: { name?: string; slug?: string; logoUrl?: string | null }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.update(brands).set(data).where(eq(brands.id, id));
}

export async function updateCatalogCategory(id: number, data: { name?: string; slug?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.update(categories).set(data).where(eq(categories.id, id));
}

export async function deleteCatalogBrand(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const inUse = await db.select({ id: products.id }).from(products).where(eq(products.brandId, id)).limit(1);
  if (inUse.length) throw new Error("لا يمكن حذف ماركة مرتبطة بمنتجات");
  return db.delete(brands).where(eq(brands.id, id));
}

export async function deleteCatalogCategory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const inUse = await db.select({ id: products.id }).from(products).where(eq(products.categoryId, id)).limit(1);
  if (inUse.length) throw new Error("لا يمكن حذف تصنيف مرتبط بمنتجات");
  return db.delete(categories).where(eq(categories.id, id));
}
