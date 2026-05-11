// controllers/order.controller.ts

import { CreateOrderDto } from '../types/product.types.js';
import {
  createOrder,
  getOrderById,
  getOrdersByBuyer,
  updateOrderStatus,
} from '../services/order.service.js';
import { ControllerResult } from './user.controller.js';
import { logger } from '../utils/logger.js';

export function handleCreateOrder(dto: CreateOrderDto): ControllerResult<ReturnType<typeof createOrder>> {
  try {
    const order = createOrder(dto);
    return { success: true, data: order };
  } catch (err) {
    logger.error('handleCreateOrder failed', { error: String(err) });
    return { success: false, error: String(err) };
  }
}

export function handleGetOrder(id: string): ControllerResult<ReturnType<typeof getOrderById>> {
  const order = getOrderById(id);
  if (!order) return { success: false, error: `Order ${id} not found` };
  return { success: true, data: order };
}

export function handleGetOrdersByBuyer(buyerId: string): ControllerResult<ReturnType<typeof getOrdersByBuyer>> {
  return { success: true, data: getOrdersByBuyer(buyerId) };
}

export function handleUpdateOrderStatus(
  id: string,
  status: Parameters<typeof updateOrderStatus>[1],
): ControllerResult<ReturnType<typeof updateOrderStatus>> {
  try {
    const order = updateOrderStatus(id, status);
    return { success: true, data: order };
  } catch (err) {
    logger.error('handleUpdateOrderStatus failed', { error: String(err) });
    return { success: false, error: String(err) };
  }
}
