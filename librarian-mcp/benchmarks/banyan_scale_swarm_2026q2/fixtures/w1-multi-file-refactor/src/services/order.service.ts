// services/order.service.ts

import { Order, CreateOrderDto, OrderLine } from '../types/product.types';
import { getProductById, reduceStock } from './product.service';
import { getUserById } from './user.service';
import { logger } from '../utils/logger';

const orders = new Map<string, Order>();

function generateId(): string {
  return 'ord_' + Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
}

export function createOrder(dto: CreateOrderDto): Order {
  const buyer = getUserById(dto.buyerId);
  if (!buyer) throw new Error(`Buyer ${dto.buyerId} not found`);
  if (!buyer.active) throw new Error(`Buyer ${dto.buyerId} is inactive`);

  if (!dto.lines || dto.lines.length === 0) {
    throw new Error('Order must have at least one line');
  }

  const lines: OrderLine[] = [];
  let totalCredits = 0;

  for (const lineDto of dto.lines) {
    if (lineDto.quantity <= 0) throw new Error('Line quantity must be positive');
    const product = getProductById(lineDto.productId);
    if (!product) throw new Error(`Product ${lineDto.productId} not found`);
    if (!product.active) throw new Error(`Product ${lineDto.productId} is inactive`);
    if (product.stock < lineDto.quantity) {
      throw new Error(`Insufficient stock for product ${lineDto.productId}`);
    }
    lines.push({
      productId: lineDto.productId,
      quantity: lineDto.quantity,
      unitPriceCredits: product.priceCredits,
    });
    totalCredits += product.priceCredits * lineDto.quantity;
  }

  for (const line of lines) {
    reduceStock(line.productId, line.quantity);
  }

  const order: Order = {
    id: generateId(),
    buyerId: dto.buyerId,
    lines,
    totalCredits,
    status: 'pending',
    createdAt: new Date(),
  };
  orders.set(order.id, order);
  logger.info('Order created', { orderId: order.id, totalCredits });
  return order;
}

export function getOrderById(id: string): Order | undefined {
  return orders.get(id);
}

export function getOrdersByBuyer(buyerId: string): Order[] {
  return Array.from(orders.values()).filter(o => o.buyerId === buyerId);
}

export function updateOrderStatus(id: string, status: Order['status']): Order {
  const order = orders.get(id);
  if (!order) throw new Error(`Order ${id} not found`);
  const VALID_TRANSITIONS: Record<Order['status'], Order['status'][]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: [],
  };
  if (!VALID_TRANSITIONS[order.status].includes(status)) {
    throw new Error(`Invalid status transition ${order.status} → ${status}`);
  }
  const updated: Order = { ...order, status };
  orders.set(id, updated);
  logger.info('Order status updated', { orderId: id, status });
  return updated;
}

export function clearOrders(): void {
  orders.clear();
}
