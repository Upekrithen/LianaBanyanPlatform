// services/product.service.ts

import { Product, CreateProductDto, UpdateProductDto, ProductId } from '../types/product.types';
import { logger } from '../utils/logger';
import { validateNonEmpty, validatePositiveNumber, validateNonNegativeInteger, combineValidations } from '../utils/validator';

const products = new Map<ProductId, Product>();

function generateId(): string {
  return 'prod_' + Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
}

export function createProduct(dto: CreateProductDto): Product {
  const errors = combineValidations([
    validateNonEmpty(dto.name, 'name'),
    validateNonEmpty(dto.description, 'description'),
    validatePositiveNumber(dto.priceCredits, 'priceCredits'),
    validateNonNegativeInteger(dto.stock, 'stock'),
    validateNonEmpty(dto.sellerId, 'sellerId'),
    validateNonEmpty(dto.category, 'category'),
  ]);
  if (!errors.valid) throw new Error(`Validation failed: ${errors.errors.join(', ')}`);

  const product: Product = {
    id: generateId(),
    name: dto.name,
    description: dto.description,
    priceCredits: dto.priceCredits,
    category: dto.category,
    stock: dto.stock,
    sellerId: dto.sellerId,
    active: true,
  };
  products.set(product.id, product);
  logger.info('Product created', { productId: product.id });
  return product;
}

export function getProductById(id: ProductId): Product | undefined {
  return products.get(id);
}

export function getAllProducts(activeOnly = false): Product[] {
  const all = Array.from(products.values());
  return activeOnly ? all.filter(p => p.active) : all;
}

export function updateProduct(id: ProductId, dto: UpdateProductDto): Product {
  const product = products.get(id);
  if (!product) throw new Error(`Product ${id} not found`);
  if (dto.priceCredits !== undefined) {
    const e = validatePositiveNumber(dto.priceCredits, 'priceCredits');
    if (e) throw new Error(e);
  }
  if (dto.stock !== undefined) {
    const e = validateNonNegativeInteger(dto.stock, 'stock');
    if (e) throw new Error(e);
  }
  const updated: Product = { ...product, ...dto };
  products.set(id, updated);
  logger.info('Product updated', { productId: id });
  return updated;
}

export function reduceStock(id: ProductId, quantity: number): Product {
  const product = products.get(id);
  if (!product) throw new Error(`Product ${id} not found`);
  if (product.stock < quantity) throw new Error(`Insufficient stock for product ${id}`);
  return updateProduct(id, { stock: product.stock - quantity });
}

export function deleteProduct(id: ProductId): boolean {
  const existed = products.has(id);
  products.delete(id);
  return existed;
}

export function clearProducts(): void {
  products.clear();
}
