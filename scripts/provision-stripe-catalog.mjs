#!/usr/bin/env node
/**
 * Idempotent Stripe catalog provision · test or live from STRIPE_CATALOG.
 *
 *   STRIPE_SECRET_KEY=sk_test_… node scripts/provision-stripe-catalog.mjs
 *   STRIPE_SECRET_KEY=sk_live_… node scripts/provision-stripe-catalog.mjs --dry-run
 *
 * Uses lookup_key when present · updates product metadata + images · creates missing prices.
 * Does not archive duplicate products · see docs/STRIPE_DEEP_AUDIT_2026-09-22.md.
 */
import { STRIPE_CATALOG, stripeProductImageUrl } from "../web/lib/stripe-catalog.mjs";
import { ISLES_PORTFOLIO_PRODUCTS } from "../web/lib/isles-portfolio-products.mjs";
import { productStatementDescriptor } from "../web/lib/isles-checkout-branding.mjs";

const dryRun = process.argv.includes("--dry-run");
const portfolioOnly = process.argv.includes("--portfolio");
const innsegallOnly = !portfolioOnly;
const sk = process.env.STRIPE_SECRET_KEY || "";
const live = sk.startsWith("sk_live_");
const test = sk.startsWith("sk_test_");

if (!live && !test) {
  console.error("Set STRIPE_SECRET_KEY to sk_test_… or sk_live_…");
  process.exit(1);
}

const productIdKey = live ? "live_product_id" : "test_product_id";
const priceIdKey = live ? "live_price_id" : "test_price_id";

async function stripe(path, method = "GET", body = null) {
  const opts = {
    method,
    headers: { Authorization: `Bearer ${sk}` },
  };
  if (body) {
    opts.headers["Content-Type"] = "application/x-www-form-urlencoded";
    opts.body = body;
  }
  const res = await fetch(`https://api.stripe.com/v1${path}`, opts);
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.error?.message || res.statusText);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

function encodeMetadata(meta) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(meta || {})) {
    if (v != null && v !== "") p.append(`metadata[${k}]`, String(v));
  }
  return p;
}

async function findPriceByLookupKey(lookupKey) {
  if (!lookupKey) return null;
  const q = new URLSearchParams();
  q.set("lookup_keys[0]", lookupKey);
  q.set("active", "true");
  q.set("limit", "1");
  const list = await stripe(`/prices?${q}`);
  return list.data?.[0] || null;
}

async function getProduct(id) {
  try {
    return await stripe(`/products/${id}`);
  } catch (e) {
    if (e.status === 404) return null;
    throw e;
  }
}

async function ensureProduct(sku, item, opts = {}) {
  const stripeActive = item.stripe_active !== false;
  let productId = item[productIdKey];
  let product = productId ? await getProduct(productId) : null;

  if (!product && item.lookup_key) {
    const q = new URLSearchParams();
    q.set("limit", "20");
    q.set("active", "false");
    const list = await stripe(`/products?${q}`);
    const hit = (list.data || []).find(
      (p) => p.metadata?.isles_lane === item.metadata?.isles_lane
    );
    if (hit) {
      product = hit;
      productId = hit.id;
    }
  }

  const descriptor = opts.statementDescriptor || null;

  if (!product) {
    if (dryRun) {
      console.log(`[dry-run] would create product ${sku}`);
      return { id: `prod_NEW_${sku}` };
    }
    const body = new URLSearchParams();
    body.append("name", item.name);
    body.append("description", item.description);
    body.append("type", "service");
    body.append("active", stripeActive ? "true" : "false");
    const img = opts.imageUrl || stripeProductImageUrl(sku);
    if (img) body.append("images[0]", img);
    if (descriptor) body.append("statement_descriptor", descriptor);
    const meta = encodeMetadata(item.metadata);
    for (const [k, v] of meta) body.append(k, v);
    product = await stripe("/products", "POST", body);
    productId = product.id;
    console.log(`created product ${sku} → ${productId}`);
  } else {
    if (!dryRun) {
      const body = new URLSearchParams();
      body.append("name", item.name);
      body.append("description", item.description);
      body.append("active", stripeActive ? "true" : "false");
      const img = opts.imageUrl || stripeProductImageUrl(sku);
      if (img) body.append("images[0]", img);
      if (descriptor) body.append("statement_descriptor", descriptor);
      const meta = encodeMetadata(item.metadata);
      for (const [k, v] of meta) body.append(k, v);
      await stripe(`/products/${productId}`, "POST", body);
      console.log(`updated product ${sku} ${productId}`);
    } else {
      console.log(`[dry-run] would update product ${sku} ${productId}`);
    }
  }
  return product;
}

async function ensurePrice(sku, item, productId) {
  const existingByLookup = await findPriceByLookupKey(item.lookup_key);
  if (existingByLookup?.product === productId) {
    console.log(`ok price ${sku} lookup ${item.lookup_key} → ${existingByLookup.id}`);
    return existingByLookup;
  }

  let priceId = item[priceIdKey];
  if (priceId) {
    try {
      const p = await stripe(`/prices/${priceId}`);
      if (p.product === productId && p.unit_amount === item.unit_amount && p.active) {
        console.log(`ok price ${sku} catalog id → ${priceId}`);
        return p;
      }
    } catch {
      /* create below */
    }
  }

  if (dryRun) {
    console.log(`[dry-run] would create price ${sku} on ${productId}`);
    return { id: `price_NEW_${sku}` };
  }

  const body = new URLSearchParams();
  body.append("product", productId);
  body.append("currency", item.currency);
  body.append("unit_amount", String(item.unit_amount));
  if (item.lookup_key) body.append("lookup_key", item.lookup_key);
  if (item.recurring) {
    body.append("recurring[interval]", item.recurring.interval);
  }
  const meta = encodeMetadata({ innsegall_sku: sku });
  for (const [k, v] of meta) body.append(k, v);
  const price = await stripe("/prices", "POST", body);
  console.log(`created price ${sku} → ${price.id}`);
  return price;
}

const envKeys = { extra: "STRIPE_PRICE_EXTRA", clan: "STRIPE_PRICE_CLAN", msp: "STRIPE_PRICE_MSP_SEAT" };
const out = {};

async function provisionEntry(key, item, opts) {
  const product = await ensureProduct(key, item, opts);
  if (item.checkout_enabled === false) {
    console.log(`skip price ${key} · checkout_enabled false (tank reserve)`);
    return { product_id: product.id, price_id: null };
  }
  const price = await ensurePrice(key, item, product.id);
  return { product_id: product.id, price_id: price.id };
}

if (innsegallOnly) {
  for (const [sku, item] of Object.entries(STRIPE_CATALOG)) {
    try {
      out[sku] = await provisionEntry(sku, item, {
        statementDescriptor: productStatementDescriptor(sku),
      });
    } catch (e) {
      console.error(`FAIL ${sku}:`, e.message);
      process.exitCode = 1;
    }
  }
}

if (portfolioOnly || process.argv.includes("--with-portfolio")) {
  for (const [key, item] of Object.entries(ISLES_PORTFOLIO_PRODUCTS)) {
    try {
      const ids = await provisionEntry(key, item, {});
      console.log(`portfolio ${key} → product ${ids.product_id}`);
    } catch (e) {
      console.error(`FAIL portfolio ${key}:`, e.message);
      process.exitCode = 1;
    }
  }
}

if (innsegallOnly && Object.keys(out).length) {
  console.log(`\n# Vercel env (${live ? "live" : "test"}) · paste after verify`);
  console.log(`STRIPE_SECRET_KEY=${live ? "sk_live_…" : "sk_test_…"}`);
  for (const [sku, ids] of Object.entries(out)) {
    if (ids.price_id) console.log(`${envKeys[sku]}=${ids.price_id}`);
  }
  console.log("INNSEGALL_LICENSE_SECRET=  # openssl rand -base64 32");
  console.log("\nThen: npm run sync:stripe-images · redeploy · smoke:live");
}
