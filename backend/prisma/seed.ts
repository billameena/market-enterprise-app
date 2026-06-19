import { PrismaClient, UserRole, VendorStatus, ProductStatus, CouponType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log('🌱 Starting database seed...');

  // ── Users ──────────────────────────────────────────────────────────────────
  console.log('👤 Creating users...');

  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@marketplace.com' },
    update: {},
    create: {
      email: 'superadmin@marketplace.com',
      password: await hashPassword('SuperAdmin@123'),
      firstName: 'Super',
      lastName: 'Admin',
      role: UserRole.SUPER_ADMIN,
      isEmailVerified: true,
      isActive: true,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@marketplace.com' },
    update: {},
    create: {
      email: 'admin@marketplace.com',
      password: await hashPassword('Admin@123'),
      firstName: 'Platform',
      lastName: 'Admin',
      role: UserRole.ADMIN,
      isEmailVerified: true,
      isActive: true,
    },
  });

  const vendorUser = await prisma.user.upsert({
    where: { email: 'vendor@techstore.com' },
    update: {},
    create: {
      email: 'vendor@techstore.com',
      password: await hashPassword('Vendor@123'),
      firstName: 'Alex',
      lastName: 'Chen',
      role: UserRole.VENDOR,
      isEmailVerified: true,
      isActive: true,
    },
  });

  const vendorUser2 = await prisma.user.upsert({
    where: { email: 'vendor2@fashionhub.com' },
    update: {},
    create: {
      email: 'vendor2@fashionhub.com',
      password: await hashPassword('Vendor@123'),
      firstName: 'Priya',
      lastName: 'Sharma',
      role: UserRole.VENDOR,
      isEmailVerified: true,
      isActive: true,
    },
  });

  const customer1 = await prisma.user.upsert({
    where: { email: 'john.doe@example.com' },
    update: {},
    create: {
      email: 'john.doe@example.com',
      password: await hashPassword('Customer@123'),
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.CUSTOMER,
      isEmailVerified: true,
      isActive: true,
      phone: '+1-555-0101',
    },
  });

  const customer2 = await prisma.user.upsert({
    where: { email: 'jane.smith@example.com' },
    update: {},
    create: {
      email: 'jane.smith@example.com',
      password: await hashPassword('Customer@123'),
      firstName: 'Jane',
      lastName: 'Smith',
      role: UserRole.CUSTOMER,
      isEmailVerified: true,
      isActive: true,
      phone: '+1-555-0102',
    },
  });

  console.log(`  ✓ Created ${6} users`);

  // ── User Addresses ─────────────────────────────────────────────────────────
  await prisma.userAddress.upsert({
    where: { id: 'addr-john-home' },
    update: {},
    create: {
      id: 'addr-john-home',
      userId: customer1.id,
      label: 'Home',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1-555-0101',
      addressLine1: '123 Main Street',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'US',
      isDefault: true,
    },
  });

  await prisma.userAddress.upsert({
    where: { id: 'addr-jane-home' },
    update: {},
    create: {
      id: 'addr-jane-home',
      userId: customer2.id,
      label: 'Home',
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '+1-555-0102',
      addressLine1: '456 Oak Avenue',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94102',
      country: 'US',
      isDefault: true,
    },
  });

  // ── Vendors ────────────────────────────────────────────────────────────────
  console.log('🏪 Creating vendors and stores...');

  const techVendor = await prisma.vendor.upsert({
    where: { userId: vendorUser.id },
    update: {},
    create: {
      userId: vendorUser.id,
      businessName: 'TechStore Pro',
      businessEmail: 'business@techstore.com',
      businessPhone: '+1-555-0200',
      description: 'Premium electronics and tech gadgets at competitive prices.',
      status: VendorStatus.APPROVED,
      commissionRate: 8.5,
      isVerified: true,
      verifiedAt: new Date(),
      totalOrders: 142,
      totalRevenue: 58420.75,
      rating: 4.7,
    },
  });

  const fashionVendor = await prisma.vendor.upsert({
    where: { userId: vendorUser2.id },
    update: {},
    create: {
      userId: vendorUser2.id,
      businessName: 'Fashion Hub',
      businessEmail: 'hello@fashionhub.com',
      businessPhone: '+1-555-0201',
      description: 'Trendy fashion for everyone — affordable and stylish.',
      status: VendorStatus.APPROVED,
      commissionRate: 10.0,
      isVerified: true,
      verifiedAt: new Date(),
      totalOrders: 89,
      totalRevenue: 22150.00,
      rating: 4.4,
    },
  });

  const techStore = await prisma.store.upsert({
    where: { vendorId: techVendor.id },
    update: {},
    create: {
      vendorId: techVendor.id,
      name: 'TechStore Pro',
      slug: 'techstore-pro',
      description: 'Your one-stop shop for the latest electronics and gadgets.',
      contactEmail: 'support@techstore.com',
      contactPhone: '+1-555-0200',
      returnPolicy: '30-day hassle-free returns on all products.',
      shippingPolicy: 'Free shipping on orders over $50. Express delivery available.',
      isActive: true,
    },
  });

  const fashionStore = await prisma.store.upsert({
    where: { vendorId: fashionVendor.id },
    update: {},
    create: {
      vendorId: fashionVendor.id,
      name: 'Fashion Hub',
      slug: 'fashion-hub',
      description: 'Discover the latest trends in clothing and accessories.',
      contactEmail: 'hello@fashionhub.com',
      contactPhone: '+1-555-0201',
      returnPolicy: '14-day returns accepted with original tags.',
      shippingPolicy: 'Standard shipping 3-5 days. Free on orders over $75.',
      isActive: true,
    },
  });

  console.log('  ✓ Created 2 vendors with stores');

  // ── Categories ─────────────────────────────────────────────────────────────
  console.log('📂 Creating categories...');

  const catElectronics = await prisma.category.upsert({
    where: { slug: 'electronics' },
    update: {},
    create: {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Gadgets, devices, and all things electronic.',
      imageUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400',
      displayOrder: 1,
      isActive: true,
    },
  });

  const catFashion = await prisma.category.upsert({
    where: { slug: 'fashion' },
    update: {},
    create: {
      name: 'Fashion',
      slug: 'fashion',
      description: 'Clothing, footwear, and accessories.',
      imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400',
      displayOrder: 2,
      isActive: true,
    },
  });

  const catHome = await prisma.category.upsert({
    where: { slug: 'home-living' },
    update: {},
    create: {
      name: 'Home & Living',
      slug: 'home-living',
      description: 'Furniture, decor, and essentials for your home.',
      imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',
      displayOrder: 3,
      isActive: true,
    },
  });

  const catSports = await prisma.category.upsert({
    where: { slug: 'sports-outdoors' },
    update: {},
    create: {
      name: 'Sports & Outdoors',
      slug: 'sports-outdoors',
      description: 'Gear and equipment for active lifestyles.',
      imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400',
      displayOrder: 4,
      isActive: true,
    },
  });

  // Subcategories
  const catSmartphones = await prisma.category.upsert({
    where: { slug: 'smartphones' },
    update: {},
    create: {
      name: 'Smartphones',
      slug: 'smartphones',
      description: 'Latest smartphones from top brands.',
      parentId: catElectronics.id,
      displayOrder: 1,
      isActive: true,
    },
  });

  const catLaptops = await prisma.category.upsert({
    where: { slug: 'laptops' },
    update: {},
    create: {
      name: 'Laptops',
      slug: 'laptops',
      description: 'Powerful laptops for work and play.',
      parentId: catElectronics.id,
      displayOrder: 2,
      isActive: true,
    },
  });

  const catAudio = await prisma.category.upsert({
    where: { slug: 'audio' },
    update: {},
    create: {
      name: 'Audio',
      slug: 'audio',
      description: 'Headphones, speakers and audio accessories.',
      parentId: catElectronics.id,
      displayOrder: 3,
      isActive: true,
    },
  });

  const catMensClothing = await prisma.category.upsert({
    where: { slug: 'mens-clothing' },
    update: {},
    create: {
      name: "Men's Clothing",
      slug: 'mens-clothing',
      description: "Fashion for men.",
      parentId: catFashion.id,
      displayOrder: 1,
      isActive: true,
    },
  });

  const catWomensClothing = await prisma.category.upsert({
    where: { slug: 'womens-clothing' },
    update: {},
    create: {
      name: "Women's Clothing",
      slug: 'womens-clothing',
      description: "Fashion for women.",
      parentId: catFashion.id,
      displayOrder: 2,
      isActive: true,
    },
  });

  console.log('  ✓ Created 9 categories');

  // ── Tags ───────────────────────────────────────────────────────────────────
  const tagFeatured = await prisma.tag.upsert({
    where: { slug: 'featured' },
    update: {},
    create: { name: 'Featured', slug: 'featured' },
  });

  const tagNewArrival = await prisma.tag.upsert({
    where: { slug: 'new-arrival' },
    update: {},
    create: { name: 'New Arrival', slug: 'new-arrival' },
  });

  const tagBestSeller = await prisma.tag.upsert({
    where: { slug: 'best-seller' },
    update: {},
    create: { name: 'Best Seller', slug: 'best-seller' },
  });

  const tagSale = await prisma.tag.upsert({
    where: { slug: 'sale' },
    update: {},
    create: { name: 'Sale', slug: 'sale' },
  });

  // ── Products ───────────────────────────────────────────────────────────────
  console.log('📦 Creating products...');

  // Product 1: iPhone 15 Pro
  const iphone = await prisma.product.upsert({
    where: { slug: 'iphone-15-pro-256gb' },
    update: {},
    create: {
      vendorId: techVendor.id,
      storeId: techStore.id,
      categoryId: catSmartphones.id,
      name: 'iPhone 15 Pro 256GB',
      slug: 'iphone-15-pro-256gb',
      description: 'The iPhone 15 Pro features the A17 Pro chip, a titanium design, and a customizable Action button. The 48MP Main camera shoots in 4K 120 fps Dolby Vision.',
      shortDescription: 'Apple iPhone 15 Pro with A17 Pro chip and titanium design.',
      sku: 'APPL-IP15P-256',
      price: 1099.00,
      comparePrice: 1199.00,
      costPrice: 850.00,
      weight: 0.187,
      status: ProductStatus.ACTIVE,
      isFeatured: true,
      averageRating: 4.8,
      totalReviews: 245,
      totalSold: 89,
      publishedAt: new Date(),
    },
  });

  await prisma.productImage.createMany({
    skipDuplicates: true,
    data: [
      { productId: iphone.id, url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800', altText: 'iPhone 15 Pro Natural Titanium', isPrimary: true, displayOrder: 0 },
      { productId: iphone.id, url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800', altText: 'iPhone 15 Pro back view', isPrimary: false, displayOrder: 1 },
    ],
  });

  const iphoneColorAttr = await prisma.productAttribute.create({
    data: { productId: iphone.id, name: 'Color' },
  });

  const iphoneStorageAttr = await prisma.productAttribute.create({
    data: { productId: iphone.id, name: 'Storage' },
  });

  const iphoneVariantNatural = await prisma.productVariant.upsert({
    where: { sku: 'APPL-IP15P-256-NT' },
    update: {},
    create: {
      productId: iphone.id,
      name: 'Natural Titanium / 256GB',
      sku: 'APPL-IP15P-256-NT',
      price: 1099.00,
      comparePrice: 1199.00,
      stock: 45,
      displayOrder: 0,
    },
  });

  await prisma.productAttributeValue.createMany({
    skipDuplicates: true,
    data: [
      { attributeId: iphoneColorAttr.id, variantId: iphoneVariantNatural.id, value: 'Natural Titanium' },
      { attributeId: iphoneStorageAttr.id, variantId: iphoneVariantNatural.id, value: '256GB' },
    ],
  });

  const iphoneVariantBlack = await prisma.productVariant.upsert({
    where: { sku: 'APPL-IP15P-256-BK' },
    update: {},
    create: {
      productId: iphone.id,
      name: 'Black Titanium / 256GB',
      sku: 'APPL-IP15P-256-BK',
      price: 1099.00,
      comparePrice: 1199.00,
      stock: 38,
      displayOrder: 1,
    },
  });

  await prisma.productAttributeValue.createMany({
    skipDuplicates: true,
    data: [
      { attributeId: iphoneColorAttr.id, variantId: iphoneVariantBlack.id, value: 'Black Titanium' },
      { attributeId: iphoneStorageAttr.id, variantId: iphoneVariantBlack.id, value: '256GB' },
    ],
  });

  await prisma.productInventory.upsert({
    where: { productId: iphone.id },
    update: {},
    create: {
      productId: iphone.id,
      sku: 'APPL-IP15P-256-INV',
      quantity: 83,
      reservedQuantity: 5,
      lowStockThreshold: 10,
    },
  });

  await prisma.productTag.createMany({
    skipDuplicates: true,
    data: [
      { productId: iphone.id, tagId: tagFeatured.id },
      { productId: iphone.id, tagId: tagBestSeller.id },
    ],
  });

  // Product 2: MacBook Pro 14"
  const macbook = await prisma.product.upsert({
    where: { slug: 'macbook-pro-14-m3' },
    update: {},
    create: {
      vendorId: techVendor.id,
      storeId: techStore.id,
      categoryId: catLaptops.id,
      name: 'MacBook Pro 14" M3',
      slug: 'macbook-pro-14-m3',
      description: 'MacBook Pro with the powerful M3 chip. Up to 22 hours of battery life. Liquid Retina XDR display.',
      shortDescription: 'Apple MacBook Pro 14-inch with M3 chip.',
      sku: 'APPL-MBP14-M3',
      price: 1999.00,
      comparePrice: 2199.00,
      costPrice: 1600.00,
      weight: 1.55,
      status: ProductStatus.ACTIVE,
      isFeatured: true,
      averageRating: 4.9,
      totalReviews: 178,
      totalSold: 56,
      publishedAt: new Date(),
    },
  });

  await prisma.productImage.createMany({
    skipDuplicates: true,
    data: [
      { productId: macbook.id, url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', altText: 'MacBook Pro 14 Space Gray', isPrimary: true, displayOrder: 0 },
      { productId: macbook.id, url: 'https://images.unsplash.com/photo-1611186871525-5a2b48b8d7a9?w=800', altText: 'MacBook Pro open view', isPrimary: false, displayOrder: 1 },
    ],
  });

  const mbpRamAttr = await prisma.productAttribute.create({
    data: { productId: macbook.id, name: 'RAM' },
  });

  const mbpVariant16 = await prisma.productVariant.upsert({
    where: { sku: 'APPL-MBP14-M3-16GB' },
    update: {},
    create: {
      productId: macbook.id,
      name: '16GB RAM / 512GB SSD',
      sku: 'APPL-MBP14-M3-16GB',
      price: 1999.00,
      comparePrice: 2199.00,
      stock: 22,
      displayOrder: 0,
    },
  });

  await prisma.productAttributeValue.createMany({
    skipDuplicates: true,
    data: [
      { attributeId: mbpRamAttr.id, variantId: mbpVariant16.id, value: '16GB' },
    ],
  });

  const mbpVariant32 = await prisma.productVariant.upsert({
    where: { sku: 'APPL-MBP14-M3-32GB' },
    update: {},
    create: {
      productId: macbook.id,
      name: '32GB RAM / 1TB SSD',
      sku: 'APPL-MBP14-M3-32GB',
      price: 2399.00,
      comparePrice: 2599.00,
      stock: 15,
      displayOrder: 1,
    },
  });

  await prisma.productAttributeValue.createMany({
    skipDuplicates: true,
    data: [
      { attributeId: mbpRamAttr.id, variantId: mbpVariant32.id, value: '32GB' },
    ],
  });

  await prisma.productInventory.upsert({
    where: { productId: macbook.id },
    update: {},
    create: {
      productId: macbook.id,
      sku: 'APPL-MBP14-M3-INV',
      quantity: 37,
      reservedQuantity: 2,
      lowStockThreshold: 5,
    },
  });

  await prisma.productTag.createMany({
    skipDuplicates: true,
    data: [
      { productId: macbook.id, tagId: tagFeatured.id },
      { productId: macbook.id, tagId: tagNewArrival.id },
    ],
  });

  // Product 3: Sony WH-1000XM5 Headphones
  const headphones = await prisma.product.upsert({
    where: { slug: 'sony-wh1000xm5-headphones' },
    update: {},
    create: {
      vendorId: techVendor.id,
      storeId: techStore.id,
      categoryId: catAudio.id,
      name: 'Sony WH-1000XM5 Wireless Headphones',
      slug: 'sony-wh1000xm5-headphones',
      description: 'Industry-leading noise cancellation with two processors and eight microphones. Up to 30 hours of battery life. Multi-device pairing.',
      shortDescription: 'Sony WH-1000XM5 — best-in-class noise cancellation.',
      sku: 'SONY-WH1000XM5',
      price: 349.99,
      comparePrice: 399.99,
      costPrice: 220.00,
      weight: 0.25,
      status: ProductStatus.ACTIVE,
      isFeatured: true,
      averageRating: 4.7,
      totalReviews: 512,
      totalSold: 203,
      publishedAt: new Date(),
    },
  });

  await prisma.productImage.createMany({
    skipDuplicates: true,
    data: [
      { productId: headphones.id, url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', altText: 'Sony WH-1000XM5 Black', isPrimary: true, displayOrder: 0 },
    ],
  });

  const hpColorAttr = await prisma.productAttribute.create({
    data: { productId: headphones.id, name: 'Color' },
  });

  const hpVariantBlack = await prisma.productVariant.upsert({
    where: { sku: 'SONY-WH1000XM5-BK' },
    update: {},
    create: {
      productId: headphones.id,
      name: 'Black',
      sku: 'SONY-WH1000XM5-BK',
      price: 349.99,
      stock: 67,
      displayOrder: 0,
    },
  });

  await prisma.productAttributeValue.createMany({
    skipDuplicates: true,
    data: [
      { attributeId: hpColorAttr.id, variantId: hpVariantBlack.id, value: 'Black' },
    ],
  });

  const hpVariantSilver = await prisma.productVariant.upsert({
    where: { sku: 'SONY-WH1000XM5-SV' },
    update: {},
    create: {
      productId: headphones.id,
      name: 'Platinum Silver',
      sku: 'SONY-WH1000XM5-SV',
      price: 349.99,
      stock: 42,
      displayOrder: 1,
    },
  });

  await prisma.productAttributeValue.createMany({
    skipDuplicates: true,
    data: [
      { attributeId: hpColorAttr.id, variantId: hpVariantSilver.id, value: 'Platinum Silver' },
    ],
  });

  await prisma.productInventory.upsert({
    where: { productId: headphones.id },
    update: {},
    create: {
      productId: headphones.id,
      sku: 'SONY-WH1000XM5-INV',
      quantity: 109,
      reservedQuantity: 8,
      lowStockThreshold: 15,
    },
  });

  await prisma.productTag.createMany({
    skipDuplicates: true,
    data: [
      { productId: headphones.id, tagId: tagBestSeller.id },
      { productId: headphones.id, tagId: tagSale.id },
    ],
  });

  // Product 4: Samsung Galaxy S24 Ultra
  const samsung = await prisma.product.upsert({
    where: { slug: 'samsung-galaxy-s24-ultra' },
    update: {},
    create: {
      vendorId: techVendor.id,
      storeId: techStore.id,
      categoryId: catSmartphones.id,
      name: 'Samsung Galaxy S24 Ultra 512GB',
      slug: 'samsung-galaxy-s24-ultra',
      description: 'Galaxy AI is here. Galaxy S24 Ultra with embedded S Pen, 200MP camera, and titanium frame.',
      shortDescription: 'Samsung Galaxy S24 Ultra with Galaxy AI and embedded S Pen.',
      sku: 'SAMS-S24U-512',
      price: 1299.00,
      comparePrice: 1399.00,
      costPrice: 950.00,
      weight: 0.232,
      status: ProductStatus.ACTIVE,
      isFeatured: false,
      averageRating: 4.6,
      totalReviews: 189,
      totalSold: 67,
      publishedAt: new Date(),
    },
  });

  await prisma.productImage.createMany({
    skipDuplicates: true,
    data: [
      { productId: samsung.id, url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800', altText: 'Samsung Galaxy S24 Ultra', isPrimary: true, displayOrder: 0 },
    ],
  });

  const samsungColorAttr = await prisma.productAttribute.create({
    data: { productId: samsung.id, name: 'Color' },
  });

  const samsungVariantTitanium = await prisma.productVariant.upsert({
    where: { sku: 'SAMS-S24U-512-TGB' },
    update: {},
    create: {
      productId: samsung.id,
      name: 'Titanium Gray / 512GB',
      sku: 'SAMS-S24U-512-TGB',
      price: 1299.00,
      stock: 30,
      displayOrder: 0,
    },
  });

  await prisma.productAttributeValue.createMany({
    skipDuplicates: true,
    data: [
      { attributeId: samsungColorAttr.id, variantId: samsungVariantTitanium.id, value: 'Titanium Gray' },
    ],
  });

  await prisma.productInventory.upsert({
    where: { productId: samsung.id },
    update: {},
    create: {
      productId: samsung.id,
      sku: 'SAMS-S24U-512-INV',
      quantity: 30,
      reservedQuantity: 3,
      lowStockThreshold: 8,
    },
  });

  // Product 5: Men's Classic T-Shirt
  const tshirt = await prisma.product.upsert({
    where: { slug: 'mens-classic-cotton-tshirt' },
    update: {},
    create: {
      vendorId: fashionVendor.id,
      storeId: fashionStore.id,
      categoryId: catMensClothing.id,
      name: "Men's Classic Cotton T-Shirt",
      slug: 'mens-classic-cotton-tshirt',
      description: '100% premium cotton crew-neck t-shirt. Pre-shrunk fabric, comfortable fit, available in multiple colors and sizes.',
      shortDescription: 'Premium cotton crew-neck tee — timeless and comfortable.',
      sku: 'FASH-MENS-TEE-001',
      price: 29.99,
      comparePrice: 39.99,
      costPrice: 12.00,
      weight: 0.2,
      status: ProductStatus.ACTIVE,
      isFeatured: false,
      averageRating: 4.3,
      totalReviews: 328,
      totalSold: 412,
      publishedAt: new Date(),
    },
  });

  await prisma.productImage.createMany({
    skipDuplicates: true,
    data: [
      { productId: tshirt.id, url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800', altText: 'White classic t-shirt', isPrimary: true, displayOrder: 0 },
      { productId: tshirt.id, url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800', altText: 'Navy classic t-shirt', isPrimary: false, displayOrder: 1 },
    ],
  });

  const tshirtSizeAttr = await prisma.productAttribute.create({
    data: { productId: tshirt.id, name: 'Size' },
  });

  const tshirtColorAttr = await prisma.productAttribute.create({
    data: { productId: tshirt.id, name: 'Color' },
  });

  const tshirtSizes = ['S', 'M', 'L', 'XL', 'XXL'];
  const tshirtColors = ['White', 'Black', 'Navy'];

  for (const color of tshirtColors) {
    for (const size of tshirtSizes) {
      const sku = `FASH-MENS-TEE-${color.toUpperCase().slice(0, 2)}-${size}`;
      const variant = await prisma.productVariant.upsert({
        where: { sku },
        update: {},
        create: {
          productId: tshirt.id,
          name: `${color} / ${size}`,
          sku,
          price: 29.99,
          comparePrice: 39.99,
          stock: Math.floor(Math.random() * 30) + 10,
          displayOrder: tshirtColors.indexOf(color) * 5 + tshirtSizes.indexOf(size),
        },
      });

      await prisma.productAttributeValue.createMany({
        skipDuplicates: true,
        data: [
          { attributeId: tshirtSizeAttr.id, variantId: variant.id, value: size },
          { attributeId: tshirtColorAttr.id, variantId: variant.id, value: color },
        ],
      });
    }
  }

  await prisma.productInventory.upsert({
    where: { productId: tshirt.id },
    update: {},
    create: {
      productId: tshirt.id,
      sku: 'FASH-MENS-TEE-001-INV',
      quantity: 375,
      reservedQuantity: 12,
      lowStockThreshold: 30,
    },
  });

  await prisma.productTag.createMany({
    skipDuplicates: true,
    data: [
      { productId: tshirt.id, tagId: tagSale.id },
      { productId: tshirt.id, tagId: tagBestSeller.id },
    ],
  });

  // Product 6: Women's Floral Dress
  const dress = await prisma.product.upsert({
    where: { slug: 'womens-floral-summer-dress' },
    update: {},
    create: {
      vendorId: fashionVendor.id,
      storeId: fashionStore.id,
      categoryId: catWomensClothing.id,
      name: "Women's Floral Summer Dress",
      slug: 'womens-floral-summer-dress',
      description: 'Lightweight and breezy floral midi dress. Perfect for summer occasions. V-neck silhouette with adjustable waist tie.',
      shortDescription: 'Elegant floral midi dress for summer.',
      sku: 'FASH-WMNS-DRESS-001',
      price: 59.99,
      comparePrice: 79.99,
      costPrice: 25.00,
      weight: 0.35,
      status: ProductStatus.ACTIVE,
      isFeatured: true,
      averageRating: 4.5,
      totalReviews: 156,
      totalSold: 198,
      publishedAt: new Date(),
    },
  });

  await prisma.productImage.createMany({
    skipDuplicates: true,
    data: [
      { productId: dress.id, url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800', altText: "Women's floral dress", isPrimary: true, displayOrder: 0 },
    ],
  });

  const dressSizeAttr = await prisma.productAttribute.create({
    data: { productId: dress.id, name: 'Size' },
  });

  const dressSizes = ['XS', 'S', 'M', 'L', 'XL'];
  for (const size of dressSizes) {
    const sku = `FASH-WMNS-DRESS-${size}`;
    const variant = await prisma.productVariant.upsert({
      where: { sku },
      update: {},
      create: {
        productId: dress.id,
        name: size,
        sku,
        price: 59.99,
        comparePrice: 79.99,
        stock: Math.floor(Math.random() * 20) + 5,
        displayOrder: dressSizes.indexOf(size),
      },
    });

    await prisma.productAttributeValue.createMany({
      skipDuplicates: true,
      data: [
        { attributeId: dressSizeAttr.id, variantId: variant.id, value: size },
      ],
    });
  }

  await prisma.productInventory.upsert({
    where: { productId: dress.id },
    update: {},
    create: {
      productId: dress.id,
      sku: 'FASH-WMNS-DRESS-001-INV',
      quantity: 87,
      reservedQuantity: 4,
      lowStockThreshold: 10,
    },
  });

  await prisma.productTag.createMany({
    skipDuplicates: true,
    data: [
      { productId: dress.id, tagId: tagFeatured.id },
      { productId: dress.id, tagId: tagNewArrival.id },
    ],
  });

  // Product 7: Dell XPS 15 Laptop
  const dellLaptop = await prisma.product.upsert({
    where: { slug: 'dell-xps-15-9530' },
    update: {},
    create: {
      vendorId: techVendor.id,
      storeId: techStore.id,
      categoryId: catLaptops.id,
      name: 'Dell XPS 15 (9530)',
      slug: 'dell-xps-15-9530',
      description: 'Dell XPS 15 with 13th Gen Intel Core i7, 32GB RAM, NVIDIA RTX 4070, 3.5K OLED display.',
      shortDescription: 'Dell XPS 15 — premium performance laptop with OLED display.',
      sku: 'DELL-XPS15-9530',
      price: 1849.00,
      comparePrice: 1999.00,
      costPrice: 1400.00,
      weight: 1.86,
      status: ProductStatus.ACTIVE,
      isFeatured: false,
      averageRating: 4.5,
      totalReviews: 94,
      totalSold: 31,
      publishedAt: new Date(),
    },
  });

  await prisma.productImage.createMany({
    skipDuplicates: true,
    data: [
      { productId: dellLaptop.id, url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800', altText: 'Dell XPS 15 laptop', isPrimary: true, displayOrder: 0 },
    ],
  });

  const dellVariant = await prisma.productVariant.upsert({
    where: { sku: 'DELL-XPS15-9530-32GB' },
    update: {},
    create: {
      productId: dellLaptop.id,
      name: '32GB RAM / 1TB SSD',
      sku: 'DELL-XPS15-9530-32GB',
      price: 1849.00,
      comparePrice: 1999.00,
      stock: 18,
      displayOrder: 0,
    },
  });

  await prisma.productInventory.upsert({
    where: { productId: dellLaptop.id },
    update: {},
    create: {
      productId: dellLaptop.id,
      sku: 'DELL-XPS15-9530-INV',
      quantity: 18,
      reservedQuantity: 1,
      lowStockThreshold: 5,
    },
  });

  // Product 8: JBL Charge 5 Speaker
  const jblSpeaker = await prisma.product.upsert({
    where: { slug: 'jbl-charge-5-bluetooth-speaker' },
    update: {},
    create: {
      vendorId: techVendor.id,
      storeId: techStore.id,
      categoryId: catAudio.id,
      name: 'JBL Charge 5 Bluetooth Speaker',
      slug: 'jbl-charge-5-bluetooth-speaker',
      description: 'JBL Pro Sound. Massive power bank. IP67 waterproof. 20 hours of playtime. Connect+ compatible with 100+ JBL speakers.',
      shortDescription: 'JBL Charge 5 — waterproof portable speaker with power bank.',
      sku: 'JBL-CHARGE5',
      price: 179.99,
      comparePrice: 199.99,
      costPrice: 100.00,
      weight: 0.96,
      status: ProductStatus.ACTIVE,
      isFeatured: false,
      averageRating: 4.6,
      totalReviews: 287,
      totalSold: 154,
      publishedAt: new Date(),
    },
  });

  await prisma.productImage.createMany({
    skipDuplicates: true,
    data: [
      { productId: jblSpeaker.id, url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800', altText: 'JBL Charge 5', isPrimary: true, displayOrder: 0 },
    ],
  });

  const jblColorAttr = await prisma.productAttribute.create({
    data: { productId: jblSpeaker.id, name: 'Color' },
  });

  for (const [color, stock] of [['Black', 55], ['Blue', 40], ['Red', 28]] as [string, number][]) {
    const sku = `JBL-CHARGE5-${color.toUpperCase()}`;
    const variant = await prisma.productVariant.upsert({
      where: { sku },
      update: {},
      create: {
        productId: jblSpeaker.id,
        name: color,
        sku,
        price: 179.99,
        stock,
        displayOrder: ['Black', 'Blue', 'Red'].indexOf(color),
      },
    });

    await prisma.productAttributeValue.createMany({
      skipDuplicates: true,
      data: [
        { attributeId: jblColorAttr.id, variantId: variant.id, value: color },
      ],
    });
  }

  await prisma.productInventory.upsert({
    where: { productId: jblSpeaker.id },
    update: {},
    create: {
      productId: jblSpeaker.id,
      sku: 'JBL-CHARGE5-INV',
      quantity: 123,
      reservedQuantity: 6,
      lowStockThreshold: 20,
    },
  });

  console.log('  ✓ Created 8 products with variants and inventory');

  // ── Reviews ────────────────────────────────────────────────────────────────
  console.log('⭐ Creating reviews...');

  await prisma.review.createMany({
    skipDuplicates: true,
    data: [
      {
        userId: customer1.id,
        productId: iphone.id,
        rating: 5,
        title: 'Absolutely love it!',
        content: 'The camera is incredible and the titanium build feels premium. Battery life is great too.',
        isVerified: true,
        isApproved: true,
      },
      {
        userId: customer2.id,
        productId: headphones.id,
        rating: 5,
        title: 'Best headphones I have ever owned',
        content: 'The noise cancellation is on another level. Perfect for long flights.',
        isVerified: true,
        isApproved: true,
      },
      {
        userId: customer1.id,
        productId: tshirt.id,
        rating: 4,
        title: 'Great quality for the price',
        content: 'Soft fabric, true to size. Washes well without shrinking.',
        isVerified: true,
        isApproved: true,
      },
    ],
  });

  console.log('  ✓ Created 3 reviews');

  // ── Coupons ────────────────────────────────────────────────────────────────
  console.log('🏷️  Creating coupons...');

  await prisma.coupon.createMany({
    skipDuplicates: true,
    data: [
      {
        code: 'WELCOME10',
        name: 'Welcome Discount',
        description: '10% off your first order',
        type: CouponType.PERCENTAGE,
        value: 10,
        minOrderAmount: 50,
        maxDiscountAmount: 50,
        maxUses: 1000,
        maxUsesPerUser: 1,
        isActive: true,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      },
      {
        code: 'SAVE20',
        name: 'Save $20',
        description: '$20 off on orders over $100',
        type: CouponType.FIXED_AMOUNT,
        value: 20,
        minOrderAmount: 100,
        maxUses: 500,
        maxUsesPerUser: 1,
        isActive: true,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
      },
      {
        code: 'FREESHIP',
        name: 'Free Shipping',
        description: 'Free shipping on any order',
        type: CouponType.FREE_SHIPPING,
        value: 0,
        maxUses: 2000,
        maxUsesPerUser: 3,
        isActive: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
      {
        code: 'TECH15',
        name: 'Tech Sale 15%',
        description: '15% off electronics — limited time',
        type: CouponType.PERCENTAGE,
        value: 15,
        minOrderAmount: 200,
        maxDiscountAmount: 150,
        maxUses: 300,
        maxUsesPerUser: 1,
        isActive: true,
        startsAt: new Date(),
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      },
      {
        code: 'SUMMER25',
        name: 'Summer Fashion Sale',
        description: '25% off all fashion items',
        type: CouponType.PERCENTAGE,
        value: 25,
        minOrderAmount: 75,
        maxDiscountAmount: 100,
        maxUses: 400,
        maxUsesPerUser: 2,
        isActive: true,
        expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days
      },
    ],
  });

  console.log('  ✓ Created 5 coupons');

  // ── Banners ────────────────────────────────────────────────────────────────
  console.log('🖼️  Creating banners...');

  await prisma.banner.createMany({
    skipDuplicates: false,
    data: [
      {
        title: 'Summer Tech Sale',
        imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1920',
        linkUrl: '/products?categoryId=electronics&sort=discount',
        position: 'hero',
        displayOrder: 1,
        isActive: true,
        endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'New Fashion Arrivals',
        imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920',
        linkUrl: '/products?categoryId=fashion&sort=newest',
        position: 'hero',
        displayOrder: 2,
        isActive: true,
      },
      {
        title: 'Shop Electronics',
        imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
        linkUrl: '/products?categoryId=electronics',
        position: 'category',
        displayOrder: 1,
        isActive: true,
      },
    ],
  });

  console.log('  ✓ Created 3 banners');

  // ── FAQs ───────────────────────────────────────────────────────────────────
  await prisma.faq.createMany({
    skipDuplicates: false,
    data: [
      {
        question: 'How do I track my order?',
        answer: 'Once your order is shipped, you will receive an email with a tracking number. You can also track your order from the Orders section in your account dashboard.',
        category: 'Orders',
        displayOrder: 1,
        isActive: true,
      },
      {
        question: 'What is the return policy?',
        answer: 'We accept returns within 30 days of delivery for most items in original condition. Some items like digital goods are non-refundable. Please check the vendor\'s store policy for specific items.',
        category: 'Returns',
        displayOrder: 2,
        isActive: true,
      },
      {
        question: 'How do I become a vendor?',
        answer: 'Click on "Sell on Marketplace" in the footer and complete the vendor registration form. Your application will be reviewed within 2-3 business days.',
        category: 'Vendors',
        displayOrder: 3,
        isActive: true,
      },
      {
        question: 'What payment methods are accepted?',
        answer: 'We accept all major credit/debit cards (Visa, Mastercard, Amex), PayPal, and Cash on Delivery in select regions.',
        category: 'Payments',
        displayOrder: 4,
        isActive: true,
      },
      {
        question: 'Is my payment information secure?',
        answer: 'Yes, all payments are processed through Stripe with industry-standard SSL encryption. We never store your full card details.',
        category: 'Payments',
        displayOrder: 5,
        isActive: true,
      },
    ],
  });

  // ── CMS Pages ──────────────────────────────────────────────────────────────
  await prisma.cmsPage.createMany({
    skipDuplicates: true,
    data: [
      {
        title: 'About Us',
        slug: 'about-us',
        content: '<h1>About Marketplace</h1><p>We are a premier multi-vendor marketplace connecting buyers with trusted sellers worldwide.</p>',
        isPublished: true,
        publishedAt: new Date(),
      },
      {
        title: 'Privacy Policy',
        slug: 'privacy-policy',
        content: '<h1>Privacy Policy</h1><p>Your privacy is important to us. This policy explains how we collect and use your data.</p>',
        isPublished: true,
        publishedAt: new Date(),
      },
      {
        title: 'Terms of Service',
        slug: 'terms-of-service',
        content: '<h1>Terms of Service</h1><p>By using our marketplace, you agree to these terms and conditions.</p>',
        isPublished: true,
        publishedAt: new Date(),
      },
    ],
  });

  console.log('');
  console.log('✅ Database seeded successfully!');
  console.log('');
  console.log('📋 Seed Summary:');
  console.log('  Users:      6  (superadmin, admin, 2 vendors, 2 customers)');
  console.log('  Vendors:    2  (TechStore Pro, Fashion Hub)');
  console.log('  Categories: 9  (4 top-level, 5 subcategories)');
  console.log('  Products:   8  (with variants, images, and inventory)');
  console.log('  Coupons:    5  (WELCOME10, SAVE20, FREESHIP, TECH15, SUMMER25)');
  console.log('  Banners:    3');
  console.log('  FAQs:       5');
  console.log('  CMS Pages:  3');
  console.log('');
  console.log('🔑 Login Credentials:');
  console.log('  Super Admin:  superadmin@marketplace.com / SuperAdmin@123');
  console.log('  Admin:        admin@marketplace.com / Admin@123');
  console.log('  Vendor:       vendor@techstore.com / Vendor@123');
  console.log('  Customer:     john.doe@example.com / Customer@123');
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
