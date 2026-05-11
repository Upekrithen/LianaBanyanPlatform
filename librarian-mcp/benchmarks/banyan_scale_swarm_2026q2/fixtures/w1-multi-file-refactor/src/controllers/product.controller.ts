// controllers/product.controller.ts

import { CreateProductDto, UpdateProductDto, ProductId } from '../types/product.types';
import {
  createProduct,
  getProductById,
  getAllProducts,
  updateProduct,
  deleteProduct,
} from '../services/product.service';
import { ControllerResult } from './user.controller';
import { logger } from '../utils/logger';

export function handleCreateProduct(dto: CreateProductDto): ControllerResult<ReturnType<typeof createProduct>> {
  try {
    const product = createProduct(dto);
    return { success: true, data: product };
  } catch (err) {
    logger.error('handleCreateProduct failed', { error: String(err) });
    return { success: false, error: String(err) };
  }
}

export function handleGetProduct(id: ProductId): ControllerResult<ReturnType<typeof getProductById>> {
  const product = getProductById(id);
  if (!product) return { success: false, error: `Product ${id} not found` };
  return { success: true, data: product };
}

export function handleListProducts(activeOnly = false): ControllerResult<ReturnType<typeof getAllProducts>> {
  return { success: true, data: getAllProducts(activeOnly) };
}

export function handleUpdateProduct(id: ProductId, dto: UpdateProductDto): ControllerResult<ReturnType<typeof updateProduct>> {
  try {
    const product = updateProduct(id, dto);
    return { success: true, data: product };
  } catch (err) {
    logger.error('handleUpdateProduct failed', { error: String(err) });
    return { success: false, error: String(err) };
  }
}

export function handleDeleteProduct(id: ProductId): ControllerResult<boolean> {
  try {
    const deleted = deleteProduct(id);
    if (!deleted) return { success: false, error: `Product ${id} not found` };
    return { success: true, data: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
