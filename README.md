# 🚀 E-Commerce Playwright Automation Suite | SauceDemo

Welcome to my portfolio repository! I'm Nicolas, a  QA Engineer specializing in functional testing and e-commerce functionality. 

This repository demonstrates a robust, scalable, and highly detailed automated testing framework designed to ensure quality and reliability for an e-commerce platform (SauceDemo). It goes beyond standard "happy paths" to validate complex edge cases, mathematical dynamically calculated totals, and security controls.

## 🎯 Value Proposition 

If you are looking for a QA professional to ensure your e-commerce platform is bug-free and delivers a seamless user experience, this suite showcases my testing approach:

* **Scalable Architecture:** Utilizes the **Page Object Model (POM)** design pattern for maintainable and readable code (`LoginPage`, `CheckoutStep1`, `CheckoutComplete`).
* **Deep Functional Testing:** Comprehensive coverage of critical e-commerce flows, from product catalog to final checkout.
* **Edge Case & Bug Detection:** Actively identifies and documents platform vulnerabilities, such as bypassing URL restrictions without authentication or whitespace form validation bugs (e.g., `BUG-001`).
* **Dynamic Validations:** Automated tests that dynamically extract, calculate, and verify cart subtotals and taxes to ensure financial accuracy.
* **Resilience Testing:** Simulates heavy load (UI stress toggling), UI visual regressions, and slow network (performance glitch) user profiles.

## 🛠️ Tech Stack
* **Framework:** [Playwright](https://playwright.dev/)
* **Language:** TypeScript / JavaScript
* **Pattern:** Page Object Model (POM)

## 🧪 Test Coverage Breakdown

This automation suite is divided into focused, atomic modules to ensure complete coverage of the application:

### 1. 🛒 Cart Management 
* Validation of empty cart states and UI elements.
* Persistence of cart items across page reloads (F5) and login/logout sessions.
* Massive add-to-cart operations (Stress testing UI).
* Data consistency between Product Listing Page (PLP), Product Detail Page (PDP), and the Cart.

### 2. 💳 Checkout Flows 
* **Step One:** Strict form validation, capturing missing fields and whitespace bypass bugs (`BUG-001`).
* **Overview:** Dynamic mathematical calculations verifying Subtotal, Taxes, and Total match the items selected.
* **Security Edge Cases:** URL injection prevention—ensuring unauthenticated users cannot access checkout steps directly.
* **Completion:** Validation of order success screens, "Back Home" routing, and simulated PDF invoice generation.

### 3. 👥 User Role Verification 
Validates platform behavior against multiple user states:
* `standard_user`: Full happy path.
* `locked_out_user`: Validates explicit UI error messaging.
* `problem_user`: Captures broken image links (`404` assets) in the inventory.
* `performance_glitch_user`: Validates system stability under delayed response times (>3000ms).

### 4. 🧭 Navigation & UI Modules
* **Sorting (`sort.spec.ts`):** Verifies algorithmic sorting logic (A-Z, Z-A, Price Low-High, Price High-Low).
* **Hamburger Menu:** Validates application state resets, external external routing, and session logout.
* **Footer:** Verifies static content and social media redirect links.

## 🚀 How to Run the Tests Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/NicolasLage152/Saucedemo-Playwright-Automation.git
   cd Saucedemo-Playwright-Automation
   ```

2. **Install dependencies:**
   ```bash
   npm install
   npx playwright install
   ```

3. **Execute the test suite:**
   ```bash
   # Run all tests in headless mode
   npx playwright test

   # Run tests with UI
   npx playwright test --ui
   ```

   | Module | Coverage | Test Scenarios |
| :--- | :--- | :--- |
| **Authentication & User Personas** | **100%** | Standard login, `locked_out_user`, `problem_user`, `performance_glitch_user`, `error_user`, `visual_user`, invalid credentials. |
| **Product Listing Page (PLP)** | **95%** | Grid rendering, sorting logic (A-Z, Z-A, Price Low-High, Price High-Low), quick Add/Remove state toggles. |
| **Product Details Page (PDP)** | **90%** | Direct navigation, UI validations, direct item addition/removal from detailed view. |
| **Shopping Cart** | **95%** | Persistence on refresh (F5), bulk additions (6/6 items), partial/total removal, price consistency, state retention across re-login. |
| **Checkout Step 1 (Form)** | **90%** | Happy path, required field validations, input sanitization checks (whitespace handling). |
| **Checkout Step 2 (Overview)** | **100%** | Dynamic price calculation (Subtotal + Tax = Total), empty cart checkout handling, safe redirection logic. |
| **Checkout Complete** | **95%** | Confirmation state validations, return to home flow, order invoice PDF generation checks. |
| **Security & Routing** | **100%** | URL injection prevention across all checkout stages without an active session. |


## 📬 Let's Connect
Ensuring top-tier e-commerce functionality is my specialty. If you need a Senior QA to build a reliable automation suite, document precise bug reports, and elevate your platform's quality, feel free to reach out or review my code in this repository!
