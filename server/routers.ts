import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { ENV } from "./_core/env";
import { clearLocalAdminCookieOptions, createLocalAdminSession, LOCAL_ADMIN_COOKIE, localAdminCookieOptions } from "./_core/localAdmin";
import {
  createCatalogBrand,
  createCatalogCategory,
  createCatalogProduct,
  deleteCatalogBrand,
  deleteCatalogCategory,
  deleteCatalogProduct,
  listCatalogBrands,
  listCatalogCategories,
  listCatalogProducts,
  updateCatalogProduct,
  updateCatalogBrand,
  updateCatalogCategory,
  updateCatalogProductGallery,
  updateCatalogProductImage,
  updateCatalogStock,
} from "./db";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  return next({ ctx });
});

const productInput = z.object({
  sku: z.string().min(2),
  slug: z.string().min(2),
  name: z.string().min(2),
  brandId: z.number().int().positive(),
  categoryId: z.number().int().positive(),
  condition: z.enum(["new", "used"]),
  grade: z.string().optional(),
  price: z.number().int().nonnegative(),
  oldPrice: z.number().int().nonnegative().optional(),
  stock: z.number().int().nonnegative(),
  imageUrl: z.string().min(1),
  specs: z.string().max(4000).optional(),
  galleryUrls: z.array(z.string().min(1)).max(8).optional(),
  storage: z.string().optional(),
  color: z.string().optional(),
  batteryPercent: z.number().int().min(0).max(100).optional(),
  warrantyMonths: z.number().int().nonnegative().default(12),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      ctx.res.clearCookie(LOCAL_ADMIN_COOKIE, clearLocalAdminCookieOptions(ctx.req));
      return { success: true } as const;
    }),
    localLogin: publicProcedure.input(z.object({ username: z.string().min(1), password: z.string().min(1) })).mutation(async ({ input, ctx }) => {
      if (!ENV.adminPassword || input.username !== ENV.adminUsername || input.password !== ENV.adminPassword) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "اسم المستخدم أو كلمة المرور غير صحيحة" });
      }
      const token = await createLocalAdminSession();
      ctx.res.cookie(LOCAL_ADMIN_COOKIE, token, localAdminCookieOptions(ctx.req));
      return { success: true } as const;
    }),
  }),
  catalog: router({
    list: publicProcedure.query(() => listCatalogProducts()),
    brands: publicProcedure.query(() => listCatalogBrands()),
    categories: publicProcedure.query(() => listCatalogCategories()),
    adminProducts: adminProcedure.query(() => listCatalogProducts()),
    createProduct: adminProcedure.input(productInput).mutation(({ input }) => createCatalogProduct({ ...input, specs: input.specs ?? null, galleryUrls: input.galleryUrls ? JSON.stringify(input.galleryUrls) : null })),
    updateProduct: adminProcedure.input(z.object({ id: z.number().int().positive(), sku: z.string().min(2).optional(), slug: z.string().min(2).optional(), name: z.string().min(2).optional(), brandId: z.number().int().positive().optional(), categoryId: z.number().int().positive().optional(), condition: z.enum(["new", "used"]).optional(), grade: z.string().nullable().optional(), price: z.number().int().nonnegative().optional(), oldPrice: z.number().int().nonnegative().nullable().optional(), stock: z.number().int().nonnegative().optional(), storage: z.string().nullable().optional(), color: z.string().nullable().optional(), warrantyMonths: z.number().int().nonnegative().optional(), specs: z.string().max(4000).nullable().optional() })).mutation(({ input }) => updateCatalogProduct(input.id, input)),
    updateProductImage: adminProcedure.input(z.object({ id: z.number().int().positive(), imageUrl: z.string().min(1).nullable() })).mutation(({ input }) => updateCatalogProductImage(input.id, input.imageUrl)),
    updateProductGallery: adminProcedure.input(z.object({ id: z.number().int().positive(), galleryUrls: z.array(z.string().min(1)).max(8) })).mutation(({ input }) => updateCatalogProductGallery(input.id, JSON.stringify(input.galleryUrls))),
    updateStock: adminProcedure.input(z.object({ id: z.number().int().positive(), stock: z.number().int().nonnegative() })).mutation(({ input }) => updateCatalogStock(input.id, input.stock)),
    deleteProduct: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => deleteCatalogProduct(input.id)),
    createBrand: adminProcedure.input(z.object({ name: z.string().min(2), slug: z.string().min(2) })).mutation(({ input }) => createCatalogBrand(input)),
    createCategory: adminProcedure.input(z.object({ name: z.string().min(2), slug: z.string().min(2) })).mutation(({ input }) => createCatalogCategory(input)),
    updateBrand: adminProcedure.input(z.object({ id: z.number().int().positive(), name: z.string().min(2), slug: z.string().min(2) })).mutation(({ input }) => updateCatalogBrand(input.id, { name: input.name, slug: input.slug })),
    updateCategory: adminProcedure.input(z.object({ id: z.number().int().positive(), name: z.string().min(2), slug: z.string().min(2) })).mutation(({ input }) => updateCatalogCategory(input.id, { name: input.name, slug: input.slug })),
    deleteBrand: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => deleteCatalogBrand(input.id)),
    deleteCategory: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => deleteCatalogCategory(input.id)),
  }),
});

export type AppRouter = typeof appRouter;
