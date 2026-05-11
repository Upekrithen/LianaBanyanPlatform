// tests/fixture.test.ts — 24 tests for W1 fixture
// These tests must pass 24/24 after CJS→ESM conversion.
// They test the PUBLIC API surface from src/index.ts.

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createUser, getUserById, getAllUsers, updateUser, deleteUser, clearUsers,
  createProduct, getProductById, getAllProducts, updateProduct, clearProducts, reduceStock,
  createOrder, getOrderById, getOrdersByBuyer, updateOrderStatus, clearOrders,
  validateEmail, validateNonEmpty, combineValidations,
  dispatch, getRegisteredRoutes,
} from '../src/index';

beforeEach(() => {
  clearUsers();
  clearProducts();
  clearOrders();
});

// --- Validator tests (4) ---

describe('validator', () => {
  it('T01: validateEmail accepts valid email', () => {
    expect(validateEmail('alice@example.com')).toBe(true);
  });

  it('T02: validateEmail rejects invalid email', () => {
    expect(validateEmail('not-an-email')).toBe(false);
  });

  it('T03: validateNonEmpty returns error for empty string', () => {
    expect(validateNonEmpty('', 'field')).toMatch(/must not be empty/);
  });

  it('T04: combineValidations returns valid when no errors', () => {
    expect(combineValidations([null, null])).toEqual({ valid: true, errors: [] });
  });
});

// --- User service tests (6) ---

describe('user service', () => {
  it('T05: createUser creates a user with expected fields', () => {
    const u = createUser({ email: 'bob@test.com', name: 'Bob' });
    expect(u.email).toBe('bob@test.com');
    expect(u.name).toBe('Bob');
    expect(u.role).toBe('member');
    expect(u.active).toBe(true);
  });

  it('T06: createUser throws on duplicate email', () => {
    createUser({ email: 'dup@test.com', name: 'A' });
    expect(() => createUser({ email: 'dup@test.com', name: 'B' })).toThrow();
  });

  it('T07: getUserById retrieves user by id', () => {
    const u = createUser({ email: 'get@test.com', name: 'Get' });
    expect(getUserById(u.id)?.email).toBe('get@test.com');
  });

  it('T08: getAllUsers returns all users', () => {
    createUser({ email: 'a@test.com', name: 'A' });
    createUser({ email: 'b@test.com', name: 'B' });
    expect(getAllUsers().length).toBe(2);
  });

  it('T09: updateUser updates name', () => {
    const u = createUser({ email: 'upd@test.com', name: 'Old' });
    const updated = updateUser(u.id, { name: 'New' });
    expect(updated.name).toBe('New');
  });

  it('T10: deleteUser removes user', () => {
    const u = createUser({ email: 'del@test.com', name: 'Del' });
    expect(deleteUser(u.id)).toBe(true);
    expect(getUserById(u.id)).toBeUndefined();
  });
});

// --- Product service tests (6) ---

describe('product service', () => {
  it('T11: createProduct creates product with expected fields', () => {
    const p = createProduct({ name: 'Bread', description: 'Fresh', priceCredits: 5, category: 'food', stock: 100, sellerId: 'sel1' });
    expect(p.name).toBe('Bread');
    expect(p.active).toBe(true);
  });

  it('T12: createProduct throws on invalid priceCredits', () => {
    expect(() => createProduct({ name: 'X', description: 'X', priceCredits: -1, category: 'x', stock: 0, sellerId: 'sel1' })).toThrow();
  });

  it('T13: getProductById retrieves product', () => {
    const p = createProduct({ name: 'P', description: 'D', priceCredits: 10, category: 'c', stock: 5, sellerId: 's' });
    expect(getProductById(p.id)?.name).toBe('P');
  });

  it('T14: getAllProducts with activeOnly=true filters inactive', () => {
    const p = createProduct({ name: 'P', description: 'D', priceCredits: 10, category: 'c', stock: 5, sellerId: 's' });
    updateProduct(p.id, { active: false });
    expect(getAllProducts(true).length).toBe(0);
    expect(getAllProducts(false).length).toBe(1);
  });

  it('T15: reduceStock reduces product stock', () => {
    const p = createProduct({ name: 'P', description: 'D', priceCredits: 10, category: 'c', stock: 10, sellerId: 's' });
    reduceStock(p.id, 3);
    expect(getProductById(p.id)?.stock).toBe(7);
  });

  it('T16: reduceStock throws on insufficient stock', () => {
    const p = createProduct({ name: 'P', description: 'D', priceCredits: 10, category: 'c', stock: 2, sellerId: 's' });
    expect(() => reduceStock(p.id, 5)).toThrow(/Insufficient/);
  });
});

// --- Order service tests (5) ---

describe('order service', () => {
  function seedUserAndProduct() {
    const u = createUser({ email: 'buyer@test.com', name: 'Buyer' });
    const p = createProduct({ name: 'Widget', description: 'A widget', priceCredits: 20, category: 'tools', stock: 50, sellerId: 'seller1' });
    return { u, p };
  }

  it('T17: createOrder creates order and deducts stock', () => {
    const { u, p } = seedUserAndProduct();
    const o = createOrder({ buyerId: u.id, lines: [{ productId: p.id, quantity: 3 }] });
    expect(o.totalCredits).toBe(60);
    expect(getProductById(p.id)?.stock).toBe(47);
  });

  it('T18: createOrder throws for unknown buyer', () => {
    expect(() => createOrder({ buyerId: 'ghost', lines: [] })).toThrow();
  });

  it('T19: getOrderById retrieves order', () => {
    const { u, p } = seedUserAndProduct();
    const o = createOrder({ buyerId: u.id, lines: [{ productId: p.id, quantity: 1 }] });
    expect(getOrderById(o.id)?.buyerId).toBe(u.id);
  });

  it('T20: getOrdersByBuyer returns buyer orders', () => {
    const { u, p } = seedUserAndProduct();
    createOrder({ buyerId: u.id, lines: [{ productId: p.id, quantity: 1 }] });
    createOrder({ buyerId: u.id, lines: [{ productId: p.id, quantity: 1 }] });
    expect(getOrdersByBuyer(u.id).length).toBe(2);
  });

  it('T21: updateOrderStatus follows valid transitions', () => {
    const { u, p } = seedUserAndProduct();
    const o = createOrder({ buyerId: u.id, lines: [{ productId: p.id, quantity: 1 }] });
    const confirmed = updateOrderStatus(o.id, 'confirmed');
    expect(confirmed.status).toBe('confirmed');
  });
});

// --- Router tests (3) ---

describe('router', () => {
  it('T22: getRegisteredRoutes returns expected count', () => {
    const routes = getRegisteredRoutes();
    expect(routes.length).toBeGreaterThanOrEqual(14);
  });

  it('T23: dispatch routes to user creation', () => {
    const result = dispatch('POST', '/users', { email: 'route@test.com', name: 'RouteUser' }) as { success: boolean };
    expect(result.success).toBe(true);
  });

  it('T24: dispatch returns error for unknown route', () => {
    const result = dispatch('GET', '/unknown') as { success: boolean; error: string };
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/not found/i);
  });
});
