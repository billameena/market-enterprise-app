import crypto from 'crypto';

export function generateSKU(productName: string, variantName?: string): string {
  const base = productName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 10);

  const suffix = variantName
    ? variantName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5)
    : '';

  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return suffix ? `${base}-${suffix}-${random}` : `${base}-${random}`;
}

export function generateVariantSKU(productSKU: string, variantAttributes: Record<string, string>): string {
  const attrCode = Object.values(variantAttributes)
    .map((v) => v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3))
    .join('-');
  const random = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${productSKU}-${attrCode}-${random}`;
}
