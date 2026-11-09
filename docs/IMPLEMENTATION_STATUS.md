# WHATPART — System Implementation Inventory & Status

> **Document:** `docs/IMPLEMENTATION_STATUS.md`  
> **Repository:** `mraaziqp/WHATPART.git`  
> **Branch:** `platform-v2`  
> **Status Date:** November 2026  
> **Authority:** Verified codebase & production infrastructure  

---

## 1. Feature Implementation Matrix

| Feature | Current State | Backend | Frontend | Database | Integrations | Security | Testing | Required Work | Priority |
|---|---|---|---|---|---|---|---|---|---|
| **Authentication & RBAC** | Operational | better-auth routes in `src/app/api/auth/[...all]`, `src/lib/guards.ts` | Login (`/(auth)/login`), Register (`/(auth)/register`), Profile dropdown | `User`, `Session`, `Account`, `Verification` | None (Direct DB) | Database-enforced role checks (`requireAdminPage`, `requireActiveSeller`), session tokens | Covered in build/lint | Add password-reset email trigger | High |
| **Vehicle Selector & Garage** | Operational | `src/lib/vehicle.ts`, `src/lib/vehicle-cookie.ts` | `VehiclePicker.tsx`, `HeaderClient.tsx`, `/account/garage` | `Make`, `VehicleModel`, `Vehicle`, `GarageVehicle` | None | Cookie-based session sync | Unit tested (WMI/VIN) | Add model generation & engine derivative selector | High |
| **VIN Decoder** | Operational (Offline WMI) | `src/lib/vin.ts` | Direct VIN tab in `VehiclePicker.tsx` & Home Hero | Linked to `Vehicle` lookup | Offline SA WMI dictionary (Prospecton, Kariega, Silverton) | Format validation regex | Unit tested in `tests/unit/vin.test.ts` | Integrate external SA live registry API (Lightstone/TransUnion) | Medium |
| **Catalogue & Single-Product Multi-Offer** | Operational | `src/lib/catalog.ts`, `src/lib/product-search.ts` | Product detail page (`/p/[slug]`), Buy Box, All Offers Drawer | `Category`, `Brand`, `Product`, `ProductImage`, `Offer` | None | Server-side price & stock verification | Covered in build | Bulk CSV catalogue import engine for sellers | High |
| **Vehicle Fitment Engine** | Operational | Server check in `/p/[slug]`, `src/lib/catalog.ts` | Green/amber fitment confirmation banner | `Fitment` table (position, notes) | None | Strict vehicle ID match | Build verified | Support multi-position cross fitments (front/rear axle variants) | High |
| **Tyre & Search Engine** | Operational | Meilisearch v1.16 client in `src/lib/search.ts` | Autocomplete `/api/search/suggest`, faceted `/search` | Synchronized from `Product`, `Offer`, `Fitment` | Meilisearch v1.16 | API master key server-only, atomic swap | Verified via search queries | Fallback PostgreSQL search if Meilisearch container offline | High |
| **Shopping Cart** | Operational | `src/app/api/cart/route.ts`, `src/lib/cart-store.ts` | Drawer & `/cart` page | `Cart`, `CartItem` | None | Recalculated server-side on checkout | Tested | Support saved carts across multiple browser sessions | Medium |
| **Checkout & Delivery Threshold** | Operational | `src/app/checkout/actions.ts`, `src/lib/shipping.ts` | Step-by-step form at `/checkout` | `Order`, `OrderItem` | None | Recalculates all pricing server-side in integer cents | Unit tested in `tests/unit/financials.test.ts` | Courier Guy / RAM live API quotation integration | Critical |
| **PayFast Payment Gateway** | Operational (Sandbox configured) | `src/lib/payfast.ts`, `src/app/api/payfast/itn/route.ts` | Hosted redirect form | `Payment` table (provider, providerRef, raw) | PayFast Hosted & ITN Webhook | MD5 signature check, reverse DNS verification, server-to-server validation | Signature verified | Plug in live production FICA credentials once approved | High |
| **Manual EFT / Invoice** | Operational | `src/app/checkout/actions.ts`, `src/app/admin/actions.ts` | Checkout option, Admin order payment confirmation | `Order` status `PENDING_PAYMENT` $\rightarrow$ `PAID` | None | Address unmasked only after admin marks paid | Tested via admin actions | Add proof-of-payment (POP) upload file box for buyers | High |
| **Guest Order Tracking** | Operational | Server-rendered at `/track` | Stepper UI at `/track` | `Order`, `OrderItem` | None | Requires matching Order Number + Billing Email | Verified | Add live courier webhook auto-progression | High |
| **Customer Reviews** | Operational | `src/components/product/ReviewForm.tsx` | Star rating + text form on `/p/[slug]` | `Review` table | None | Enforces `verifiedPurchase` check against completed orders | Build verified | Support customer-uploaded photo attachments | Medium |
| **Wishlist & My Garage** | Operational | `src/app/account/actions.ts` | `/account/garage`, `/account/wishlist` | `GarageVehicle`, `WishlistItem` | None | User session boundary | Build verified | Email alerts when wishlisted items go on Daily Deal | Medium |
| **Seller Portal & Offer Management** | Operational | `src/app/seller/actions.ts`, `src/lib/guards.ts` | `/seller`, `/seller/listings`, `/seller/listings/new` | `Seller`, `Offer`, `OrderItem` | None | `requireActiveSeller` guard, masked buyer address | Build verified | Low stock alert notifications | Medium |
| **Seller Fulfillment** | Operational | `src/app/seller/orders/ItemActions.tsx` | `/seller/orders` | `OrderItem` status stepper | Manual tracking string | Address strictly hidden until order status is `PAID` | Build verified | Automated shipping label / waybill PDF generation | Critical |
| **RFQ Part Quotes** | Operational | `src/app/quote/actions.ts`, `src/app/seller/requests/` | `/quote`, `/seller/requests`, `/admin/requests` | `QuoteRequest`, `QuoteResponse` | None | Verified sellers only | Build verified | Automated WhatsApp notification when sellers quote | High |
| **Daily Deals Engine** | Operational | `scripts/refresh-deals.ts`, `src/app/admin/deals/` | Homepage deals carousel, `/deals`, `/admin/deals` | `Deal` table | Synced with Meilisearch `dealEndsAt` | Admin only | Build verified | Automatic deal expiration and Meilisearch attribute swap | Medium |
| **Live Appearance Customizer** | Operational | `src/lib/theme.ts`, `src/app/api/theme/route.ts` | 6-tab studio with device simulator at `/admin/appearance` | `SiteSetting` (`site_setting` table) | None | Nonce-safe CSS properties, admin auth required | Unit tested in `tests/unit/theme.test.ts` | Add banner scheduling (e.g. Black Friday, Festive hours) | Low |
| **Logistics & Automated Couriers** | Missing (Manual only) | None | Seller types tracking text | `OrderItem.trackingRef` | Pending TCG / RAM / Pargo APIs | None | Needs implementation | Build courier provider abstraction, waybill generator, webhooks | Critical |
| **Seller Financial Ledger & Payouts** | Missing (Calculation only) | Commission calculated in integer cents (`commissionBps`) | Basic metrics in `/seller` | `Seller.commissionBps` | Pending bank EFT / Ozow payout integration | None | Unit tested commission math | Create `SellerTransaction` ledger, payout batch generator | Critical |
| **Transactional Messaging (WhatsApp / SMS / Email)** | Partial (Stubs only) | Basic notification triggers | None | None | Resend / WhatsApp API pending | None | Needs implementation | Implement Resend email templates & WhatsApp order status dispatch | High |

---

## 2. Technical Quality Gates Status

| Quality Gate | Tool / Command | Current Status | Notes |
|---|---|---|---|
| **TypeScript Strict Checking** | `tsc --noEmit` | **PASSED (0 errors)** | Full type safety across Next.js App Router |
| **ESLint Compliance** | `eslint .` | **PASSED (0 errors)** | Cleaned unused imports and render-scope components |
| **Automated Test Suite** | `npm test` (`tsx --test`) | **PASSED (10 / 10 tests)** | Covers integer cents, shipping thresholds, commission math, VIN WMI lookups, and theme CSS properties |
| **Next.js Production Build** | `npm run build` | **PASSED (44 / 44 routes)** | Standalone optimized output |
| **Production Health Check** | `https://whatpart.africa/api/health` | **PASSED (`{"ok":true}`)** | PostgreSQL 17 healthy, Meilisearch available, Caddy SSL active |
