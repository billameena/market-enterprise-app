import type { ProductVariant } from '../../../types/product.types';
import { cn } from '../../../utils/cn';

interface SelectedOptions {
  [attributeName: string]: string;
}

interface ProductVariantsProps {
  variants: ProductVariant[];
  selectedOptions: SelectedOptions;
  onOptionChange: (attributeName: string, value: string) => void;
  selectedVariant: ProductVariant | null;
}

interface AttributeGroup {
  name: string;
  values: string[];
}

function buildAttributeGroups(variants: ProductVariant[]): AttributeGroup[] {
  const groups: Map<string, Set<string>> = new Map();

  for (const variant of variants) {
    for (const attr of variant.attributeValues) {
      if (!groups.has(attr.attribute.name)) {
        groups.set(attr.attribute.name, new Set());
      }
      groups.get(attr.attribute.name)!.add(attr.value);
    }
  }

  return Array.from(groups.entries()).map(([name, valueSet]) => ({
    name,
    values: Array.from(valueSet),
  }));
}

function isColorAttribute(name: string): boolean {
  return ['color', 'colour'].includes(name.toLowerCase());
}

const COLOR_MAP: Record<string, string> = {
  black: '#000000',
  white: '#ffffff',
  red: '#ef4444',
  blue: '#3b82f6',
  green: '#22c55e',
  yellow: '#eab308',
  purple: '#a855f7',
  pink: '#ec4899',
  orange: '#f97316',
  gray: '#6b7280',
  grey: '#6b7280',
  brown: '#92400e',
  navy: '#1e3a5f',
  beige: '#d4b483',
};

export function ProductVariants({ variants, selectedOptions, onOptionChange, selectedVariant }: ProductVariantsProps) {
  const attributeGroups = buildAttributeGroups(variants);

  function isOptionAvailable(attrName: string, value: string): boolean {
    const testOptions = { ...selectedOptions, [attrName]: value };
    return variants.some((v) => {
      const variantOptions: Record<string, string> = {};
      for (const attr of v.attributeValues) {
        variantOptions[attr.attribute.name] = attr.value;
      }
      return Object.entries(testOptions).every(([k, val]) => variantOptions[k] === val) && v.stock > 0;
    });
  }

  return (
    <div className="space-y-5">
      {attributeGroups.map((group) => (
        <div key={group.name}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-surface-900">{group.name}</span>
            {selectedOptions[group.name] && (
              <span className="text-sm text-surface-500">{selectedOptions[group.name]}</span>
            )}
          </div>

          {isColorAttribute(group.name) ? (
            <div className="flex flex-wrap gap-2">
              {group.values.map((value) => {
                const isSelected = selectedOptions[group.name] === value;
                const isAvailable = isOptionAvailable(group.name, value);
                const colorHex = COLOR_MAP[value.toLowerCase()];

                return (
                  <button
                    key={value}
                    onClick={() => isAvailable && onOptionChange(group.name, value)}
                    disabled={!isAvailable}
                    title={value}
                    aria-label={`${group.name}: ${value}${!isAvailable ? ' (out of stock)' : ''}`}
                    className={cn(
                      'w-8 h-8 rounded-full border-2 transition-all relative',
                      isSelected ? 'border-primary-500 ring-2 ring-primary-200 scale-110' : 'border-surface-200 hover:border-surface-400',
                      !isAvailable && 'opacity-40 cursor-not-allowed',
                    )}
                    style={{ backgroundColor: colorHex ?? undefined }}
                  >
                    {!colorHex && (
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                        {value.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                    {!isAvailable && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="w-full h-px bg-surface-400 rotate-45 block" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {group.values.map((value) => {
                const isSelected = selectedOptions[group.name] === value;
                const isAvailable = isOptionAvailable(group.name, value);

                return (
                  <button
                    key={value}
                    onClick={() => isAvailable && onOptionChange(group.name, value)}
                    disabled={!isAvailable}
                    className={cn(
                      'px-4 py-2 rounded-lg border text-sm font-medium transition-all',
                      isSelected
                        ? 'border-primary-500 bg-primary-50 text-primary-700 ring-1 ring-primary-300'
                        : 'border-surface-200 text-surface-700 hover:border-surface-300 hover:bg-surface-50',
                      !isAvailable && 'opacity-40 cursor-not-allowed line-through',
                    )}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {selectedVariant && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-50 border border-surface-100">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-surface-600">SKU: <span className="font-mono font-medium text-surface-800">{selectedVariant.sku}</span></p>
            {selectedVariant.stock <= 5 && selectedVariant.stock > 0 && (
              <p className="text-xs text-warning-600 font-medium mt-0.5">
                Only {selectedVariant.stock} left in stock
              </p>
            )}
            {selectedVariant.stock === 0 && (
              <p className="text-xs text-danger-600 font-medium mt-0.5">Out of stock</p>
            )}
          </div>
          {selectedVariant.price && (
            <p className="text-lg font-bold text-surface-900">
              ${selectedVariant.price.toFixed(2)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
