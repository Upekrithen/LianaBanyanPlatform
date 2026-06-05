// index.ts — entry point

export { dispatch, getRegisteredRoutes } from './router.js';
export { createUser, getUserById, getAllUsers, updateUser, deleteUser, clearUsers } from './services/user.service.js';
export { createProduct, getProductById, getAllProducts, updateProduct, reduceStock, deleteProduct, clearProducts } from './services/product.service.js';
export { createOrder, getOrderById, getOrdersByBuyer, updateOrderStatus, clearOrders } from './services/order.service.js';
export { logger, setLogLevel, getLogLevel } from './utils/logger.js';
export { validateEmail, validateNonEmpty, validatePositiveNumber, validateNonNegativeInteger, validateUUID, combineValidations } from './utils/validator.js';
export type { User, CreateUserDto, UpdateUserDto, UserId } from './types/user.types.js';
export type { Product, CreateProductDto, UpdateProductDto, ProductId, Order, CreateOrderDto, OrderLine } from './types/product.types.js';
export type { LogLevel, LogEntry } from './utils/logger.js';
export type { ValidationResult } from './utils/validator.js';
export type { ControllerResult } from './controllers/user.controller.js';
