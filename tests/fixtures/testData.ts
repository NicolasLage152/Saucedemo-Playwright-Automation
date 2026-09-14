/**
 * Centralised test-data factory for the SauceDemo framework.
 *
 * All test data used across the suite (checkout info, product names, users)
 * is defined here to eliminate duplication and make maintenance a one-liner.
 */

// ── Checkout customer data ────────────────────────────────────────────────────

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

/** Standard customer used in the majority of checkout flows. */
export const DEFAULT_CUSTOMER: CustomerInfo = {
  firstName: 'Nicolas',
  lastName: 'Tester',
  postalCode: '11000',
};

/** Alias — reads more naturally inside checkout-step1 edge-case tests. */
export const BLANK_CUSTOMER: CustomerInfo = {
  firstName: '',
  lastName: '',
  postalCode: '',
};

// ── Product catalog ───────────────────────────────────────────────────────────

export const PRODUCTS = {
  BACKPACK: 'Sauce Labs Backpack',
  BIKE_LIGHT: 'Sauce Labs Bike Light',
  BOLT_T_SHIRT: 'Sauce Labs Bolt T-Shirt',
  FLEECE_JACKET: 'Sauce Labs Fleece Jacket',
  ONESIE: 'Sauce Labs Onesie',
  RED_T_SHIRT: 'Test.allTheThings() T-Shirt (Red)',
} as const;

export type ProductName = (typeof PRODUCTS)[keyof typeof PRODUCTS];

// ── Sorted price catalogue (used in sorting assertions) ───────────────────────

export const PRICES_LOW_TO_HIGH = ['$7.99', '$9.99', '$15.99', '$15.99', '$29.99', '$49.99'];
export const PRICES_HIGH_TO_LOW = [...PRICES_LOW_TO_HIGH].reverse();

export const NAMES_A_TO_Z: ProductName[] = [
  PRODUCTS.BACKPACK,
  PRODUCTS.BIKE_LIGHT,
  PRODUCTS.BOLT_T_SHIRT,
  PRODUCTS.FLEECE_JACKET,
  PRODUCTS.ONESIE,
  PRODUCTS.RED_T_SHIRT,
];
export const NAMES_Z_TO_A: ProductName[] = [...NAMES_A_TO_Z].reverse();

// ── Users ─────────────────────────────────────────────────────────────────────

export const USERS = {
  STANDARD: 'standard_user',
  LOCKED_OUT: 'locked_out_user',
  PROBLEM: 'problem_user',
  PERFORMANCE_GLITCH: 'performance_glitch_user',
  ERROR: 'error_user',
  VISUAL: 'visual_user',
} as const;

export const PASSWORDS = {
  STANDARD: 'secret_sauce',
} as const;
