/**
 * Extra products seed — adds more products across all categories.
 * Run: npx tsx prisma/seed-extra-products.ts
 */
import { PrismaClient, ProductStatus } from '@prisma/client';

const prisma = new PrismaClient();

// IDs from the existing seed data
const IDS = {
  // Vendors
  techVendor: 'cmq7zojvw0007gs3nyfw7djh7',
  techStore: 'cmq7zojwe000bgs3n0h0o7g85',
  fashionVendor: 'cmq7zojw70009gs3nozhpetpo',
  fashionStore: 'cmq7zojwp000dgs3nbupkax0r',
  // Root categories
  electronics: 'cmq7zojww000egs3nwjayr834',
  fashion: 'cmq7zojx7000fgs3negwlb1wk',
  homeLiving: 'cmq7zojxe000ggs3nazu01b5m',
  sports: 'cmq7zojxm000hgs3nxi62zhes',
  // Subcategories
  smartphones: 'cmq7zojxs000jgs3nagks6u7d',
  laptops: 'cmq7zojy0000lgs3n0mhj15gi',
  audio: 'cmq7zojy7000ngs3n60ptkapj',
  mensClothing: 'cmq7zojyf000pgs3na4c8rhn8',
  womensClothing: 'cmq7zojyn000rgs3nkscht6ca',
};

async function createProduct(data: {
  vendorId: string;
  storeId: string;
  categoryId: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  shortDescription: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  weight?: number;
  isFeatured?: boolean;
  averageRating?: number;
  totalReviews?: number;
  totalSold?: number;
  imageUrl: string;
  imageAlt: string;
  variants: Array<{ name: string; sku: string; price: number; comparePrice?: number; stock: number; attributes: Record<string, string> }>;
  inventoryQty: number;
}) {
  const product = await prisma.product.upsert({
    where: { slug: data.slug },
    update: {},
    create: {
      vendorId: data.vendorId,
      storeId: data.storeId,
      categoryId: data.categoryId,
      name: data.name,
      slug: data.slug,
      sku: data.sku,
      description: data.description,
      shortDescription: data.shortDescription,
      price: data.price,
      comparePrice: data.comparePrice,
      costPrice: data.costPrice,
      weight: data.weight,
      status: ProductStatus.ACTIVE,
      isFeatured: data.isFeatured ?? false,
      averageRating: data.averageRating ?? 0,
      totalReviews: data.totalReviews ?? 0,
      totalSold: data.totalSold ?? 0,
      publishedAt: new Date(),
    },
  });

  await prisma.productImage.createMany({
    skipDuplicates: true,
    data: [{ productId: product.id, url: data.imageUrl, altText: data.imageAlt, isPrimary: true, displayOrder: 0 }],
  });

  // Build attributes per variant field name
  const attributeMap: Record<string, string> = {}; // attrName → attributeId

  for (const v of data.variants) {
    for (const attrName of Object.keys(v.attributes)) {
      if (!attributeMap[attrName]) {
        const attr = await prisma.productAttribute.create({
          data: { productId: product.id, name: attrName },
        });
        attributeMap[attrName] = attr.id;
      }
    }
  }

  for (const v of data.variants) {
    const variant = await prisma.productVariant.upsert({
      where: { sku: v.sku },
      update: {},
      create: {
        productId: product.id,
        name: v.name,
        sku: v.sku,
        price: v.price,
        comparePrice: v.comparePrice,
        stock: v.stock,
        displayOrder: data.variants.indexOf(v),
      },
    });

    for (const [attrName, attrValue] of Object.entries(v.attributes)) {
      await prisma.productAttributeValue.createMany({
        skipDuplicates: true,
        data: [{ attributeId: attributeMap[attrName]!, variantId: variant.id, value: attrValue }],
      });
    }
  }

  await prisma.productInventory.upsert({
    where: { productId: product.id },
    update: {},
    create: {
      productId: product.id,
      sku: `${data.sku}-INV`,
      quantity: data.inventoryQty,
      reservedQuantity: 0,
      lowStockThreshold: 10,
    },
  });

  console.log(`  ✓ ${data.name}`);
  return product;
}

async function main() {
  console.log('🌱 Seeding extra products...\n');

  // ── Add subcategories for Home & Living and Sports ─────────────────────────
  console.log('📂 Adding subcategories...');

  const catFurniture = await prisma.category.upsert({
    where: { slug: 'furniture' },
    update: {},
    create: { name: 'Furniture', slug: 'furniture', parentId: IDS.homeLiving, displayOrder: 1, isActive: true },
  });

  const catKitchen = await prisma.category.upsert({
    where: { slug: 'kitchen-appliances' },
    update: {},
    create: { name: 'Kitchen & Appliances', slug: 'kitchen-appliances', parentId: IDS.homeLiving, displayOrder: 2, isActive: true },
  });

  const catDecor = await prisma.category.upsert({
    where: { slug: 'home-decor' },
    update: {},
    create: { name: 'Home Decor', slug: 'home-decor', parentId: IDS.homeLiving, displayOrder: 3, isActive: true },
  });

  const catFitness = await prisma.category.upsert({
    where: { slug: 'fitness-equipment' },
    update: {},
    create: { name: 'Fitness Equipment', slug: 'fitness-equipment', parentId: IDS.sports, displayOrder: 1, isActive: true },
  });

  const catOutdoorGear = await prisma.category.upsert({
    where: { slug: 'outdoor-gear' },
    update: {},
    create: { name: 'Outdoor Gear', slug: 'outdoor-gear', parentId: IDS.sports, displayOrder: 2, isActive: true },
  });

  const catSportswear = await prisma.category.upsert({
    where: { slug: 'sportswear' },
    update: {},
    create: { name: 'Sportswear', slug: 'sportswear', parentId: IDS.sports, displayOrder: 3, isActive: true },
  });

  const catTablets = await prisma.category.upsert({
    where: { slug: 'tablets' },
    update: {},
    create: { name: 'Tablets', slug: 'tablets', parentId: IDS.electronics, displayOrder: 4, isActive: true },
  });

  const catAccessories = await prisma.category.upsert({
    where: { slug: 'accessories' },
    update: {},
    create: { name: 'Accessories', slug: 'accessories', parentId: IDS.fashion, displayOrder: 3, isActive: true },
  });

  console.log('  ✓ Added 8 subcategories\n');

  // ── Electronics ────────────────────────────────────────────────────────────
  console.log('📱 Electronics products...');

  await createProduct({
    vendorId: IDS.techVendor, storeId: IDS.techStore, categoryId: catTablets.id,
    name: 'iPad Pro 12.9" M2',
    slug: 'ipad-pro-12-9-m2',
    sku: 'APPL-IPADPRO-M2',
    description: 'iPad Pro with the powerful M2 chip, 12.9-inch Liquid Retina XDR display, and Apple Pencil support.',
    shortDescription: 'Apple iPad Pro 12.9" with M2 chip and Liquid Retina XDR.',
    price: 1099.00, comparePrice: 1199.00, costPrice: 820.00, weight: 0.682,
    isFeatured: true, averageRating: 4.8, totalReviews: 134, totalSold: 47,
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800',
    imageAlt: 'iPad Pro 12.9 M2',
    variants: [
      { name: 'Space Gray / 128GB / WiFi', sku: 'APPL-IPADPRO-M2-128-SG', price: 1099.00, comparePrice: 1199.00, stock: 25, attributes: { Storage: '128GB', Connectivity: 'WiFi' } },
      { name: 'Space Gray / 256GB / WiFi', sku: 'APPL-IPADPRO-M2-256-SG', price: 1299.00, comparePrice: 1399.00, stock: 18, attributes: { Storage: '256GB', Connectivity: 'WiFi' } },
      { name: 'Silver / 128GB / WiFi+Cellular', sku: 'APPL-IPADPRO-M2-128-SV-C', price: 1299.00, comparePrice: 1399.00, stock: 12, attributes: { Storage: '128GB', Connectivity: 'WiFi+Cellular' } },
    ],
    inventoryQty: 55,
  });

  await createProduct({
    vendorId: IDS.techVendor, storeId: IDS.techStore, categoryId: IDS.smartphones,
    name: 'Google Pixel 8 Pro',
    slug: 'google-pixel-8-pro',
    sku: 'GOOG-PIX8PRO',
    description: 'Google Pixel 8 Pro with Tensor G3 chip, 50MP camera triple system, and 7 years of OS updates.',
    shortDescription: 'Google Pixel 8 Pro — the most helpful phone ever.',
    price: 999.00, comparePrice: 1099.00, costPrice: 720.00, weight: 0.213,
    isFeatured: false, averageRating: 4.5, totalReviews: 89, totalSold: 34,
    imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800',
    imageAlt: 'Google Pixel 8 Pro',
    variants: [
      { name: 'Obsidian / 128GB', sku: 'GOOG-PIX8PRO-128-OB', price: 999.00, stock: 28, attributes: { Color: 'Obsidian', Storage: '128GB' } },
      { name: 'Porcelain / 256GB', sku: 'GOOG-PIX8PRO-256-PO', price: 1099.00, stock: 20, attributes: { Color: 'Porcelain', Storage: '256GB' } },
    ],
    inventoryQty: 48,
  });

  await createProduct({
    vendorId: IDS.techVendor, storeId: IDS.techStore, categoryId: IDS.audio,
    name: 'Apple AirPods Pro (2nd Gen)',
    slug: 'apple-airpods-pro-2nd-gen',
    sku: 'APPL-APP-2GEN',
    description: 'AirPods Pro 2nd generation with Adaptive Transparency, Personalized Spatial Audio, and up to 30 hours total battery life.',
    shortDescription: 'AirPods Pro with next-level Active Noise Cancellation.',
    price: 249.00, comparePrice: 279.00, costPrice: 160.00, weight: 0.050,
    isFeatured: true, averageRating: 4.7, totalReviews: 428, totalSold: 215,
    imageUrl: 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=800',
    imageAlt: 'Apple AirPods Pro 2nd Generation',
    variants: [
      { name: 'White', sku: 'APPL-APP-2GEN-WH', price: 249.00, stock: 80, attributes: { Color: 'White' } },
    ],
    inventoryQty: 80,
  });

  await createProduct({
    vendorId: IDS.techVendor, storeId: IDS.techStore, categoryId: IDS.laptops,
    name: 'ASUS ROG Zephyrus G14 (2024)',
    slug: 'asus-rog-zephyrus-g14-2024',
    sku: 'ASUS-ROG-G14-24',
    description: 'ASUS ROG Zephyrus G14 gaming laptop with AMD Ryzen 9 8945HS, RX 7900S, 2.5K 165Hz OLED display, 32GB RAM.',
    shortDescription: 'Compact gaming powerhouse with AMD Ryzen 9 and OLED display.',
    price: 1799.00, comparePrice: 1999.00, costPrice: 1350.00, weight: 1.65,
    isFeatured: false, averageRating: 4.6, totalReviews: 67, totalSold: 24,
    imageUrl: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800',
    imageAlt: 'ASUS ROG Zephyrus G14',
    variants: [
      { name: 'Eclipse Gray / 32GB / 1TB', sku: 'ASUS-ROG-G14-32-1T', price: 1799.00, stock: 15, attributes: { RAM: '32GB', Storage: '1TB' } },
    ],
    inventoryQty: 15,
  });

  // ── Home & Living ──────────────────────────────────────────────────────────
  console.log('\n🏠 Home & Living products...');

  await createProduct({
    vendorId: IDS.techVendor, storeId: IDS.techStore, categoryId: catKitchen.id,
    name: 'Instant Pot Duo 7-in-1 Electric Pressure Cooker',
    slug: 'instant-pot-duo-7-in-1',
    sku: 'INST-DUO-7IN1-6QT',
    description: 'The most-loved multi-cooker. 7 appliances in 1: Pressure Cooker, Slow Cooker, Rice Cooker, Steamer, Sauté Pan, Yogurt Maker & Warmer. 6-quart capacity.',
    shortDescription: '7-in-1 multi-cooker — pressure cook, slow cook, sauté and more.',
    price: 79.99, comparePrice: 99.99, costPrice: 42.00, weight: 5.0,
    isFeatured: true, averageRating: 4.7, totalReviews: 892, totalSold: 634,
    imageUrl: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=800',
    imageAlt: 'Instant Pot Duo 7-in-1',
    variants: [
      { name: '6 Quart', sku: 'INST-DUO-6QT', price: 79.99, comparePrice: 99.99, stock: 120, attributes: { Size: '6 Quart' } },
      { name: '8 Quart', sku: 'INST-DUO-8QT', price: 99.99, comparePrice: 119.99, stock: 75, attributes: { Size: '8 Quart' } },
    ],
    inventoryQty: 195,
  });

  await createProduct({
    vendorId: IDS.techVendor, storeId: IDS.techStore, categoryId: catKitchen.id,
    name: 'Dyson V15 Detect Cordless Vacuum',
    slug: 'dyson-v15-detect-cordless',
    sku: 'DYSO-V15-DETECT',
    description: 'The most powerful Dyson cordless vacuum with laser dust detection, LCD screen displaying scientifically proven results, and 60 minutes of run time.',
    shortDescription: 'Dyson V15 — laser dust detection & 60 min runtime.',
    price: 699.99, comparePrice: 749.99, costPrice: 480.00, weight: 3.1,
    isFeatured: true, averageRating: 4.6, totalReviews: 341, totalSold: 128,
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    imageAlt: 'Dyson V15 Detect Cordless Vacuum',
    variants: [
      { name: 'Nickel/Yellow', sku: 'DYSO-V15-NY', price: 699.99, stock: 35, attributes: { Color: 'Nickel/Yellow' } },
    ],
    inventoryQty: 35,
  });

  await createProduct({
    vendorId: IDS.fashionVendor, storeId: IDS.fashionStore, categoryId: catDecor.id,
    name: 'Himalayan Salt Lamp with Dimmer',
    slug: 'himalayan-salt-lamp-dimmer',
    sku: 'DECOR-SALT-LAMP',
    description: 'Natural pink Himalayan salt lamp with adjustable brightness dimmer switch. Creates a warm amber glow. Perfect for relaxation and ambient lighting.',
    shortDescription: 'Natural Himalayan salt lamp with dimmer — warm ambient glow.',
    price: 29.99, comparePrice: 44.99, costPrice: 12.00, weight: 2.5,
    isFeatured: false, averageRating: 4.4, totalReviews: 567, totalSold: 389,
    imageUrl: 'https://images.unsplash.com/photo-1603575448878-868a20723f5d?w=800',
    imageAlt: 'Himalayan Salt Lamp',
    variants: [
      { name: 'Small (5-7 lbs)', sku: 'DECOR-SALT-SM', price: 29.99, stock: 150, attributes: { Size: 'Small' } },
      { name: 'Large (9-11 lbs)', sku: 'DECOR-SALT-LG', price: 44.99, stock: 90, attributes: { Size: 'Large' } },
    ],
    inventoryQty: 240,
  });

  await createProduct({
    vendorId: IDS.fashionVendor, storeId: IDS.fashionStore, categoryId: catFurniture.id,
    name: 'Ergonomic Mesh Office Chair',
    slug: 'ergonomic-mesh-office-chair',
    sku: 'FURN-CHAIR-ERG',
    description: 'Premium ergonomic mesh office chair with lumbar support, adjustable armrests, headrest, and seat height. Designed for long work sessions.',
    shortDescription: 'Ergonomic mesh chair with lumbar support — work in comfort.',
    price: 249.99, comparePrice: 349.99, costPrice: 150.00, weight: 18.0,
    isFeatured: true, averageRating: 4.5, totalReviews: 234, totalSold: 167,
    imageUrl: 'https://images.unsplash.com/photo-1589384267710-7a25bc5b4862?w=800',
    imageAlt: 'Ergonomic Mesh Office Chair',
    variants: [
      { name: 'Black', sku: 'FURN-CHAIR-ERG-BK', price: 249.99, stock: 40, attributes: { Color: 'Black' } },
      { name: 'Gray', sku: 'FURN-CHAIR-ERG-GR', price: 249.99, stock: 25, attributes: { Color: 'Gray' } },
    ],
    inventoryQty: 65,
  });

  await createProduct({
    vendorId: IDS.fashionVendor, storeId: IDS.fashionStore, categoryId: catDecor.id,
    name: 'Scented Soy Candle Set (3-Pack)',
    slug: 'scented-soy-candle-set',
    sku: 'DECOR-CANDLE-3PK',
    description: 'Handcrafted soy wax candles with premium fragrance oils. Set of 3: Vanilla & Sandalwood, Eucalyptus & Mint, Lavender & Rose. 45 hours burn time each.',
    shortDescription: 'Handcrafted soy wax candle set — 3 premium fragrances.',
    price: 39.99, comparePrice: 54.99, costPrice: 16.00, weight: 0.9,
    isFeatured: false, averageRating: 4.8, totalReviews: 412, totalSold: 298,
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800',
    imageAlt: 'Scented Soy Candle Set',
    variants: [
      { name: 'Assorted (3-pack)', sku: 'DECOR-CANDLE-3PK-V1', price: 39.99, stock: 200, attributes: { Pack: '3-pack' } },
    ],
    inventoryQty: 200,
  });

  // ── Sports & Outdoors ──────────────────────────────────────────────────────
  console.log('\n🏋️  Sports & Outdoors products...');

  await createProduct({
    vendorId: IDS.techVendor, storeId: IDS.techStore, categoryId: catFitness.id,
    name: 'Bowflex SelectTech 552 Adjustable Dumbbells (Pair)',
    slug: 'bowflex-selecttech-552-dumbbells',
    sku: 'BWFL-ST552-PAIR',
    description: 'Replace 15 sets of weights. Adjusts from 5 to 52.5 lbs in 2.5 lb increments. Innovative dial system. Includes stand.',
    shortDescription: 'Bowflex adjustable dumbbells — 5 to 52.5 lbs, replaces 15 sets.',
    price: 429.00, comparePrice: 499.00, costPrice: 280.00, weight: 24.0,
    isFeatured: true, averageRating: 4.8, totalReviews: 1204, totalSold: 543,
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
    imageAlt: 'Bowflex SelectTech 552 Dumbbells',
    variants: [
      { name: 'Pair (5–52.5 lbs)', sku: 'BWFL-ST552-PAIR-V1', price: 429.00, comparePrice: 499.00, stock: 45, attributes: { Set: 'Pair' } },
    ],
    inventoryQty: 45,
  });

  await createProduct({
    vendorId: IDS.techVendor, storeId: IDS.techStore, categoryId: catFitness.id,
    name: 'Yoga Mat Premium Non-Slip 6mm',
    slug: 'yoga-mat-premium-6mm',
    sku: 'YOGA-MAT-6MM',
    description: 'Extra thick 6mm non-slip yoga mat with alignment lines. Made from eco-friendly TPE. Includes carry strap. 183cm × 61cm.',
    shortDescription: 'Premium 6mm non-slip yoga mat with alignment guides.',
    price: 34.99, comparePrice: 49.99, costPrice: 14.00, weight: 1.2,
    isFeatured: false, averageRating: 4.5, totalReviews: 678, totalSold: 892,
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
    imageAlt: 'Premium Yoga Mat 6mm',
    variants: [
      { name: 'Purple', sku: 'YOGA-MAT-6MM-PU', price: 34.99, stock: 200, attributes: { Color: 'Purple' } },
      { name: 'Blue', sku: 'YOGA-MAT-6MM-BL', price: 34.99, stock: 185, attributes: { Color: 'Blue' } },
      { name: 'Black', sku: 'YOGA-MAT-6MM-BK', price: 34.99, stock: 220, attributes: { Color: 'Black' } },
    ],
    inventoryQty: 605,
  });

  await createProduct({
    vendorId: IDS.techVendor, storeId: IDS.techStore, categoryId: catOutdoorGear.id,
    name: 'Osprey Atmos AG 65 Backpack',
    slug: 'osprey-atmos-ag-65-backpack',
    sku: 'OSPR-ATMOS-65',
    description: 'Award-winning Osprey Atmos AG 65L hiking backpack with Anti-Gravity suspension, adjustable torso fit, and StraightJacket compression straps.',
    shortDescription: 'Osprey Atmos AG 65L — the most comfortable hiking pack.',
    price: 289.95, comparePrice: 319.95, costPrice: 190.00, weight: 2.18,
    isFeatured: true, averageRating: 4.9, totalReviews: 445, totalSold: 187,
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
    imageAlt: 'Osprey Atmos AG 65 Hiking Backpack',
    variants: [
      { name: 'Abyss Grey / Small/Medium', sku: 'OSPR-ATMOS-65-AG-SM', price: 289.95, stock: 30, attributes: { Color: 'Abyss Grey', Size: 'S/M' } },
      { name: 'Abyss Grey / Medium/Large', sku: 'OSPR-ATMOS-65-AG-ML', price: 289.95, stock: 28, attributes: { Color: 'Abyss Grey', Size: 'M/L' } },
      { name: 'Rigby Red / S/M', sku: 'OSPR-ATMOS-65-RR-SM', price: 289.95, stock: 22, attributes: { Color: 'Rigby Red', Size: 'S/M' } },
    ],
    inventoryQty: 80,
  });

  await createProduct({
    vendorId: IDS.fashionVendor, storeId: IDS.fashionStore, categoryId: catSportswear.id,
    name: "Nike Dri-FIT Men's Training Shorts",
    slug: 'nike-dri-fit-mens-training-shorts',
    sku: 'NIKE-DRI-SHORTS-M',
    description: "Nike Dri-FIT technology moves sweat away from your skin. 7-inch inseam. Side pockets and back zip pocket. Lightweight and breathable fabric.",
    shortDescription: "Nike Dri-FIT training shorts — light, breathable, fast-drying.",
    price: 40.00, comparePrice: 50.00, costPrice: 18.00, weight: 0.22,
    isFeatured: false, averageRating: 4.4, totalReviews: 389, totalSold: 512,
    imageUrl: 'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=800',
    imageAlt: 'Nike Dri-FIT Training Shorts',
    variants: [
      ...['Black', 'Navy', 'Gray'].flatMap(color =>
        ['S', 'M', 'L', 'XL'].map(size => ({
          name: `${color} / ${size}`,
          sku: `NIKE-DRI-SHORTS-M-${color.toUpperCase().slice(0,2)}-${size}`,
          price: 40.00, comparePrice: 50.00,
          stock: Math.floor(Math.random() * 40) + 20,
          attributes: { Color: color, Size: size },
        }))
      ),
    ],
    inventoryQty: 420,
  });

  await createProduct({
    vendorId: IDS.fashionVendor, storeId: IDS.fashionStore, categoryId: catSportswear.id,
    name: "Women's High-Waist Yoga Leggings",
    slug: 'womens-high-waist-yoga-leggings',
    sku: 'YOGA-LEGGINGS-W',
    description: 'Ultra-soft 4-way stretch yoga leggings with high waistband, side pockets, and squat-proof fabric. 88% polyester, 12% spandex.',
    shortDescription: 'High-waist yoga leggings — squat-proof, soft, and supportive.',
    price: 49.99, comparePrice: 69.99, costPrice: 20.00, weight: 0.28,
    isFeatured: false, averageRating: 4.6, totalReviews: 723, totalSold: 891,
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800',
    imageAlt: "Women's High-Waist Yoga Leggings",
    variants: [
      ...['Black', 'Midnight Blue', 'Dusty Rose'].flatMap(color =>
        ['XS', 'S', 'M', 'L', 'XL'].map(size => ({
          name: `${color} / ${size}`,
          sku: `YOGA-LEGGINGS-W-${color.replace(' ', '').toUpperCase().slice(0,3)}-${size}`,
          price: 49.99, comparePrice: 69.99,
          stock: Math.floor(Math.random() * 35) + 15,
          attributes: { Color: color, Size: size },
        }))
      ),
    ],
    inventoryQty: 520,
  });

  // ── Fashion — more items ───────────────────────────────────────────────────
  console.log('\n👗 More Fashion products...');

  await createProduct({
    vendorId: IDS.fashionVendor, storeId: IDS.fashionStore, categoryId: IDS.mensClothing,
    name: "Men's Slim Fit Chino Pants",
    slug: 'mens-slim-fit-chino-pants',
    sku: 'FASH-MENS-CHINO',
    description: "Slim fit chino trousers crafted from stretch cotton blend. Perfect for smart-casual occasions. Features 5-pocket design and button closure.",
    shortDescription: "Slim fit chinos in stretch cotton — smart-casual essential.",
    price: 54.99, comparePrice: 74.99, costPrice: 24.00, weight: 0.6,
    isFeatured: false, averageRating: 4.3, totalReviews: 198, totalSold: 267,
    imageUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800',
    imageAlt: "Men's Slim Fit Chino Pants",
    variants: [
      ...['Khaki', 'Navy', 'Olive'].flatMap(color =>
        ['30x30', '32x30', '32x32', '34x32', '36x32'].map(size => ({
          name: `${color} / ${size}`,
          sku: `FASH-MENS-CHINO-${color.toUpperCase().slice(0,2)}-${size.replace('x','')}`,
          price: 54.99, comparePrice: 74.99,
          stock: Math.floor(Math.random() * 25) + 5,
          attributes: { Color: color, Size: size },
        }))
      ),
    ],
    inventoryQty: 290,
  });

  await createProduct({
    vendorId: IDS.fashionVendor, storeId: IDS.fashionStore, categoryId: IDS.womensClothing,
    name: "Women's Oversized Knit Sweater",
    slug: 'womens-oversized-knit-sweater',
    sku: 'FASH-WMNS-SWTR',
    description: 'Cozy oversized knit sweater with drop shoulders, ribbed cuffs and hem. Made from a soft acrylic-wool blend. Perfect for layering.',
    shortDescription: "Oversized knit sweater — cozy, relaxed, and stylish.",
    price: 69.99, comparePrice: 89.99, costPrice: 30.00, weight: 0.55,
    isFeatured: false, averageRating: 4.5, totalReviews: 287, totalSold: 334,
    imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800',
    imageAlt: "Women's Oversized Knit Sweater",
    variants: [
      ...['Cream', 'Dusty Pink', 'Sage Green', 'Caramel'].flatMap(color =>
        ['XS/S', 'M/L', 'XL/XXL'].map(size => ({
          name: `${color} / ${size}`,
          sku: `FASH-WMNS-SWTR-${color.replace(' ','').toUpperCase().slice(0,3)}-${size.replace('/','_')}`,
          price: 69.99, comparePrice: 89.99,
          stock: Math.floor(Math.random() * 30) + 10,
          attributes: { Color: color, Size: size },
        }))
      ),
    ],
    inventoryQty: 360,
  });

  await createProduct({
    vendorId: IDS.fashionVendor, storeId: IDS.fashionStore, categoryId: catAccessories.id,
    name: 'Leather Tote Bag — Everyday Essential',
    slug: 'leather-tote-bag-everyday',
    sku: 'FASH-TOTE-LTHR',
    description: 'Genuine full-grain leather tote bag. Spacious main compartment with zip closure, interior pockets, and detachable shoulder strap. Perfect for work or weekend.',
    shortDescription: 'Full-grain leather tote bag — spacious and timeless.',
    price: 149.99, comparePrice: 199.99, costPrice: 75.00, weight: 0.95,
    isFeatured: true, averageRating: 4.7, totalReviews: 156, totalSold: 124,
    imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800',
    imageAlt: 'Leather Tote Bag',
    variants: [
      { name: 'Tan', sku: 'FASH-TOTE-LTHR-TN', price: 149.99, stock: 35, attributes: { Color: 'Tan' } },
      { name: 'Black', sku: 'FASH-TOTE-LTHR-BK', price: 149.99, stock: 40, attributes: { Color: 'Black' } },
      { name: 'Cognac', sku: 'FASH-TOTE-LTHR-CG', price: 149.99, stock: 28, attributes: { Color: 'Cognac' } },
    ],
    inventoryQty: 103,
  });

  await createProduct({
    vendorId: IDS.fashionVendor, storeId: IDS.fashionStore, categoryId: catAccessories.id,
    name: 'Classic Analog Watch — Minimalist Design',
    slug: 'classic-analog-watch-minimalist',
    sku: 'FASH-WATCH-ALOG',
    description: 'Clean minimalist analog watch with Japanese quartz movement. Stainless steel case, sapphire crystal glass, genuine leather strap. Water resistant 50m.',
    shortDescription: 'Minimalist analog watch with sapphire crystal and leather strap.',
    price: 119.00, comparePrice: 159.00, costPrice: 55.00, weight: 0.12,
    isFeatured: false, averageRating: 4.6, totalReviews: 342, totalSold: 219,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
    imageAlt: 'Classic Minimalist Analog Watch',
    variants: [
      { name: 'Silver / Black Leather', sku: 'FASH-WATCH-SV-BK', price: 119.00, stock: 45, attributes: { Case: 'Silver', Strap: 'Black Leather' } },
      { name: 'Gold / Brown Leather', sku: 'FASH-WATCH-GD-BR', price: 129.00, stock: 38, attributes: { Case: 'Gold', Strap: 'Brown Leather' } },
      { name: 'Rose Gold / Blush Leather', sku: 'FASH-WATCH-RG-BL', price: 129.00, stock: 30, attributes: { Case: 'Rose Gold', Strap: 'Blush Leather' } },
    ],
    inventoryQty: 113,
  });

  // ── Summary ────────────────────────────────────────────────────────────────
  const total = await prisma.product.count({ where: { status: 'ACTIVE' } });
  console.log(`\n✅ Done! Total active products in database: ${total}`);
  console.log('\nProduct breakdown:');

  const cats = await prisma.category.findMany({
    where: { parentId: { not: null } },
    include: { _count: { select: { products: { where: { status: 'ACTIVE' } } } } },
    orderBy: { name: 'asc' },
  });

  const rootCats = await prisma.category.findMany({
    where: { parentId: null },
    include: { _count: { select: { products: { where: { status: 'ACTIVE' } } } } },
    orderBy: { name: 'asc' },
  });

  for (const c of rootCats) {
    console.log(`  ${c.name}: ${c._count.products} direct`);
  }
  for (const c of cats) {
    if (c._count.products > 0) console.log(`    └─ ${c.name}: ${c._count.products} products`);
  }
}

main()
  .catch((e) => { console.error('❌', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
