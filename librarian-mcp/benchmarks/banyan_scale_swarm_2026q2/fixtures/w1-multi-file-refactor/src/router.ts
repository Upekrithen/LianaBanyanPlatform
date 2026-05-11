// router.ts

import { handleCreateUser, handleGetUser, handleListUsers, handleUpdateUser, handleDeleteUser } from './controllers/user.controller';
import { handleCreateProduct, handleGetProduct, handleListProducts, handleUpdateProduct, handleDeleteProduct } from './controllers/product.controller';
import { handleCreateOrder, handleGetOrder, handleGetOrdersByBuyer, handleUpdateOrderStatus } from './controllers/order.controller';
import { logger } from './utils/logger';

export interface RouteHandler {
  (params: Record<string, unknown>): unknown;
}

const routes = new Map<string, RouteHandler>();

routes.set('POST /users', (p) => handleCreateUser(p as Parameters<typeof handleCreateUser>[0]));
routes.set('GET /users', () => handleListUsers());
routes.set('GET /users/:id', (p) => handleGetUser(p.id as string));
routes.set('PATCH /users/:id', (p) => handleUpdateUser(p.id as string, p.body as Parameters<typeof handleUpdateUser>[1]));
routes.set('DELETE /users/:id', (p) => handleDeleteUser(p.id as string));

routes.set('POST /products', (p) => handleCreateProduct(p as Parameters<typeof handleCreateProduct>[0]));
routes.set('GET /products', (p) => handleListProducts((p.activeOnly as boolean) ?? false));
routes.set('GET /products/:id', (p) => handleGetProduct(p.id as string));
routes.set('PATCH /products/:id', (p) => handleUpdateProduct(p.id as string, p.body as Parameters<typeof handleUpdateProduct>[1]));
routes.set('DELETE /products/:id', (p) => handleDeleteProduct(p.id as string));

routes.set('POST /orders', (p) => handleCreateOrder(p as Parameters<typeof handleCreateOrder>[0]));
routes.set('GET /orders/:id', (p) => handleGetOrder(p.id as string));
routes.set('GET /orders/buyer/:buyerId', (p) => handleGetOrdersByBuyer(p.buyerId as string));
routes.set('PATCH /orders/:id/status', (p) => handleUpdateOrderStatus(p.id as string, p.status as Parameters<typeof handleUpdateOrderStatus>[1]));

export function dispatch(method: string, path: string, params: Record<string, unknown> = {}): unknown {
  const key = `${method} ${path}`;
  const handler = routes.get(key);
  if (!handler) {
    logger.warn('Route not found', { method, path });
    return { success: false, error: `Route ${key} not found` };
  }
  return handler(params);
}

export function getRegisteredRoutes(): string[] {
  return Array.from(routes.keys());
}
