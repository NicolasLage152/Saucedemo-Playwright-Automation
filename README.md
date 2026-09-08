
[![SauceDemo Playwright Tests](https://github.com/NicolasLage152/Saucedemo-Playwright-Automation/actions/workflows/playwright.yml/badge.svg)](https://github.com/NicolasLage152/Saucedemo-Playwright-Automation/actions/workflows/playwright.yml)
[![Netlify Status](https://img.shields.io/netlify/bcb9fe4a-e4e1-4ed7-9727-7c8d37c639ed)](https://app.netlify.com/projects/saucedemoautomation/deploys)



🚀 E-Commerce Playwright Automation Suite | SauceDemo

Welcome to my portfolio repository! I'm Nicolas, a QA Engineer specializing in functional testing and e-commerce functionality.

This repository demonstrates a robust, scalable, and highly detailed automated testing framework designed to ensure quality and reliability for an e-commerce platform (SauceDemo). It goes beyond standard "happy paths" to validate complex edge cases, mathematically calculated dynamic totals, and security controls.

🎯 Value Proposition

If you are looking for a QA professional to ensure your e-commerce platform is bug-free and delivers a seamless user experience, this suite showcases my testing approach:

Scalable Architecture: Utilizes the Page Object Model (POM) design pattern for maintainable and readable code (LoginPage, CheckoutStep1, CheckoutComplete).

Deep Functional Testing: Comprehensive coverage of critical e-commerce flows, from product catalog to final checkout.

Edge Case & Bug Detection: Actively identifies and documents platform vulnerabilities, such as bypassing URL restrictions without authentication or whitespace form validation bugs (e.g., BUG-001).

Dynamic Validations: Automated tests that dynamically extract, calculate, and verify cart subtotals and taxes to ensure financial accuracy.

Resilience Testing: Simulates heavy load (UI stress toggling), UI visual regressions, and slow network (performance glitch) user profiles.

🚀 Technologies Used

Playwright: Core framework for fast, resilient, and reliable browser automation.
TypeScript: Base language ensuring strict typing, reducing errors, and facilitating maintenance.
Page Object Model (POM): Design pattern used to centralize selectors and methods in specific classes (e.g., LoginPage, CheckoutStep1, CheckoutCompletePage).
GitHub Actions: Continuous Integration (CI) orchestration for automated cloud executions.
Netlify: Static hosting for public visualization of the generated HTML reports.
SMTP (Notifications): Automated email delivery for quality alerts.

## 🧪 Test Results 

https://saucedemoautomation.netlify.app/

## 🧪 Test Coverage Breakdown

This automation suite is divided into focused, atomic modules to ensure complete coverage of the application:

### 1. 🛒 Cart Management (95%)
* Validation of empty cart states and UI elements.
* Persistence of cart items across page reloads (F5) and login/logout sessions.
* Massive add-to-cart operations (Stress testing UI).
* Data consistency between Product Listing Page (PLP), Product Detail Page (PDP), and the Cart.

### 2. 💳 Checkout Flows (95%)
* **Step One:** Strict form validation, capturing missing fields and whitespace bypass bugs (`BUG-001`).
* **Overview:** Dynamic mathematical calculations verifying Subtotal, Taxes, and Total match the items selected.
* **Security Edge Cases:** URL injection prevention—ensuring unauthenticated users cannot access checkout steps directly.
* **Completion:** Validation of order success screens, "Back Home" routing, and simulated PDF invoice generation.

### 3. 👥 User Role Verification  (100%)
Validates platform behavior against multiple user states:
* `standard_user`: Full happy path.
* `locked_out_user`: Validates explicit UI error messaging.
* `problem_user`: Captures broken image links (`404` assets) in the inventory.
* `performance_glitch_user`: Validates system stability under delayed response times (>3000ms).

### 4. 🧭 Navigation & UI Modules (100%)
* **Sorting (`sort.spec.ts`):** Verifies algorithmic sorting logic (A-Z, Z-A, Price Low-High, Price High-Low).
* **Hamburger Menu:** Validates application state resets, external external routing, and session logout.
* **Footer:** Verifies static content and social media redirect links.

⚙️ Continuous Integration & Deployment (CI/CD)

This project implements a complete professional automated pipeline:

Matrix Builds (Parallel Testing): Simultaneous execution across Chromium, Firefox, and WebKit to guarantee cross-browser compatibility without increasing execution times.

Optimized Caching: Intelligent caching of Playwright browser binaries to reduce GitHub Actions pipeline duration.

Consolidated Cloud Reports: Merging test results (blobs) from all three rendering engines into a single, unified HTML visual report, automatically deployed to Netlify on every push.

Email Notifications: Dynamic emails sent on every execution detailing the test suite status (✅ Success or 🚨 Failure) with a direct link to the updated QA report.

💎 Why is this code professional grade?  

Scalable Architecture: The Page Object Model (POM) isolates business logic from web selectors. If the e-commerce UI changes, only a single file requires modification, keeping the tests intact.

Dynamic & Flexible Validations: Instead of hardcoding expected results, the code extracts live platform data (like counting the dynamic array of cart items or extracting price strings and parsing them into mathematical floats) to perform highly precise assertions.

Atomic & Resilient Tests: Tests are completely independent. Structured hooks like test.beforeEach are used to set up initial conditions, such as injecting the login and navigation steps centrally for every test.

🚀 How to Run the Tests Locally

Clone the repository:

git clone https://github.com/NicolasLage152/Saucedemo-Playwright-Automation.git
cd Saucedemo-Playwright-Automation


Install dependencies:

npm install
npx playwright install


Execute the test suite:

# Run all tests in headless mode
npx playwright test

# Run tests with UI
npx playwright test --ui


📬 Let's Connect

Ensuring top-tier e-commerce functionality is my specialty. If you need a Senior QA to build a reliable automation suite, document precise bug reports, and elevate your platform's quality, feel free to reach out or review my code in this repository!
