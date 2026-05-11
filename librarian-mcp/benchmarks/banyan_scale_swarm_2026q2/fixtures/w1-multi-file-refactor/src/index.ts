// index.ts — entry point

export { dispatch, getRegisteredRoutes } from './router';
export { createUser, getUserById, getAllUsers, updateUser, deleteUser, clearUsers } from './services/user.service';
export { createProduct, getProductById, getAllProducts, updateProduct, reduceStock, deleteProduct, clearProducts } from './services/product.service';
export { createOrder, getOrderById, getOrdersByBuyer, updateOrderStatus, clearOrders } from './services/order.service';
export { logger, setLogLevel, getLogLevel } from './utils/logger';
export { validateEmail, validateNonEmpty, validatePositiveNumber, validateNonNegativeInteger, validateUUID, combineValidations } from './utils/validator';
export type { User, CreateUserDto, UpdateUserDto, UserId } from './types/user.types';
export type { Product, CreateProductDto, UpdateProductDto, ProductId, Order, CreateOrderDto, OrderLine } from './types/product.types';
export type { LogLevel, LogEntry } from './utils/logger';
export type { ValidationResult } from './utils/validator';
export type { ControllerResult } from './controllers/user.controller';
