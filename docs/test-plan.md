# Automated Test Plan - E-commerce SauceDemo

**Author:** Nicolas | Software Quality Assurance

## 1. Project Summary
This project contains a comprehensive suite of End-to-End (E2E) automated tests for the SauceDemo e-commerce platform. The test architecture is designed using Playwright and TypeScript, implementing the Page Object Model (POM) design pattern to ensure code scalability and maintainability.

## 2. Test Scope
The suite's coverage evaluates the full user lifecycle on the platform, encompassing the following critical modules:

*   **Authentication and User Profiles:** Validation of successful login. Handling of authentication errors due to invalid credentials or empty fields. Verification of expected anomalous behaviors for specific profiles (`locked_out_user`, `problem_user`, `performance_glitch_user`, `error_user`, `visual_user`).
*   **Catalog and Sorting (PLP & Sort):** Verification of the product grid rendering. Validation of alphabetical sorting algorithms (A to Z, Z to A). Validation of price filters (low to high, high to low).
*   **Shopping Cart Management:** Addition and removal of products from the general view and the Product Detail Page (PDP). Verification of the dynamic counter (badge). Data persistence in the cart after refreshing the page (F5) or logging out. Mass addition of the entire inventory.
*   **Checkout Flow:** 
    *   **Step 1 (Information):** Form submission, alerts for empty mandatory fields, and bug reporting.
    *   **Step 2 (Overview):** Visual validation of static shipping and payment data. Verification of correct redirection when canceling the purchase.
    *   **Step 3 (Complete):** Visibility of order confirmation and functional validation of the PDF receipt download button.
*   **Global Navigation:** Hamburger menu functionality (navigation to catalog, logout, app state reset, and external links to About). Accurate redirection of social links in the footer (Twitter, Facebook, LinkedIn).

## 3. Edge Cases and Identified Bugs
The test plan includes strict assertions to validate the security and logical consistency of the system:

*   **Security and Access Control:** Successful blocking of URL injection attempts; the system prevents direct access to `checkout-step-two.html` and `checkout-complete.html` without an active session or without completing the previous steps.
*   **Dynamic Calculations:** Automated mathematical validation that extracts the prices from the cart, calculates the subtotal, and successfully compares it with the applied taxes to verify the final total.
*   **Validation Bugs (Forms):** A critical flaw was reported in the shipping form (Step One); the system allows advancing to the payment phase by entering only blank spaces in the mandatory First Name, Last Name, and Postal Code fields, highlighting the lack of the `.trim()` method on the backend.

## 4. Execution Instructions
To run this test suite locally:

```bash
# Install project dependencies
npm install

# Install Playwright browsers
npx playwright install

# Run the entire test suite
npx playwright test

# Run tests with graphical interface (UI Mode)
npx playwright test --ui
```