<div align="center">
  <h1>🚀 E-Commerce Playwright Automation Suite | SauceDemo</h1>
  <p><strong>A robust, scalable, and highly detailed automated testing framework designed to ensure quality and reliability for e-commerce platforms.</strong></p>

  [![Playwright](https://img.shields.io/badge/Playwright-45ba4b?style=for-the-badge&logo=Playwright&logoColor=white)](https://playwright.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)](https://github.com/features/actions)
  
  [![GitHub Pages Deployment](https://github.com/NicolasLage152/Saucedemo-Playwright-Automation/actions/workflows/playwright.yml/badge.svg)](https://nicolaslage152.github.io/Saucedemo-Playwright-Automation/)
</div>

---

## 👋 Welcome
Welcome to my portfolio repository! I'm **Nicolas**, a QA Engineer specializing in functional testing and e-commerce quality assurance.

This repository demonstrates a **professional-grade automated testing framework**. It goes beyond standard "happy paths" to validate complex edge cases, mathematically calculated dynamic totals, security controls, and resilience under network stress.

---

## 🎯 Value Proposition

If you are looking for a QA professional to ensure your platform is bug-free and delivers a seamless user experience, this suite showcases my core capabilities:

- **Scalable Architecture**: Utilizes the **Page Object Model (POM)** design pattern for highly maintainable and readable code.
- **Deep Functional Testing**: Comprehensive coverage of critical e-commerce flows, from the product catalog to the final checkout step.
- **Edge Case & Bug Detection**: Actively identifies and documents vulnerabilities, such as bypassing URL restrictions without authentication or whitespace form validation bugs (`BUG-001`).
- **Dynamic Validations**: Automated tests that dynamically extract, calculate, and verify cart subtotals and taxes to ensure strict financial accuracy.
- **Resilience & Stress Testing**: Simulates multiple user profiles, including UI visual regressions and slow network behaviors (performance glitch user).

---

## 🏗️ Project Architecture

The framework is structured using best practices to ensure modularity and scalability.

```text
📦 Saucedemo-Playwright-Automation
 ┣ 📂 POMs                 # Page Object Models encapsulating locators and methods
 ┃ ┣ 📜 CartPage.ts
 ┃ ┣ 📜 CheckoutStep1.ts
 ┃ ┣ 📜 InventoryPage.ts
 ┃ ┗ 📜 ... 
 ┣ 📂 tests                # E2E test suites grouped by functionality
 ┃ ┣ 📜 CartManagment.spec.ts
 ┃ ┣ 📜 Checkout.spec.ts
 ┃ ┣ 📜 HappyPath.spec.ts
 ┃ ┗ 📜 ...
 ┣ 📂 Login                # Dedicated test suite for authentication edge cases
 ┃ ┣ 📜 Login.spec.ts
 ┃ ┣ 📜 Lockedupuser.spec.ts
 ┃ ┗ 📜 ...
 ┣ 📂 .github/workflows    # CI/CD pipeline definitions
 ┃ ┗ 📜 playwright.yml
 ┣ 📜 playwright.config.ts # Global configuration for Playwright
 ┗ 📜 package.json         # Project dependencies and scripts
```

### 💎 Why is this code professional grade?         

1. **Separation of Concerns**: The POM pattern isolates business logic from web selectors. If the UI changes, only a single file requires modification, keeping tests robust and DRY.
2. **Dynamic Data Extraction**: Instead of hardcoding expected results, the code extracts live platform data (e.g., parsing string prices into floats) to perform highly precise mathematical assertions.
3. **Atomic & Resilient Design**: Tests are completely independent. Setup and teardown rely on structured hooks (`test.beforeEach`) to establish clean states, such as injecting login sequences centrally.

---

## 📊 Test Coverage Breakdown

This automation suite is divided into focused, atomic modules to ensure complete coverage:

### 1. 🛒 Cart Management (95%)
* Validation of empty cart states and dynamic UI elements.
* Persistence of cart items across page reloads (F5) and login/logout sessions.
* Massive add-to-cart operations (UI stress testing).
* Data consistency between Product Listing Page (PLP), Product Detail Page (PDP), and the Cart.

### 2. 💳 Checkout Flows (95%)
* **Step One:** Strict form validation, capturing missing fields and whitespace bypass bugs (`BUG-001`).
* **Overview:** Dynamic mathematical calculations verifying Subtotal, Taxes, and Total match the selected items.
* **Security Edge Cases:** URL injection prevention—ensuring unauthenticated users cannot access checkout steps directly.
* **Completion:** Validation of order success screens, routing, and simulated PDF invoice generation.

### 3. 👥 User Role Verification (100%)
Validates platform behavior against multiple user states:
* `standard_user`: Full happy path.
* `locked_out_user`: Validates explicit UI error messaging.
* `problem_user`: Captures broken image links (`404` assets) in the inventory.
* `performance_glitch_user`: Validates system stability under delayed response times (>3000ms).

### 4. 🧭 Navigation & UI Modules (100%)
* **Sorting (`Sorting.spec.ts`):** Verifies algorithmic sorting logic (A-Z, Z-A, Price Low-High, Price High-Low).
* **Hamburger Menu:** Validates application state resets, external routing, and session logout.
* **Footer:** Verifies static content and social media redirect links.

---

## ⚙️ Continuous Integration & Deployment (CI/CD)

The project leverages a modern CI/CD pipeline to guarantee code quality on every integration:

- **[x] Nightly Scheduled Runs (Cron)**: Automated trigger (`cron: '0 3 * * *'`) executing the full test suite every night at 3:00 AM, ensuring daily platform health monitoring.
- **[x] Matrix Strategy**: Parallel execution across multiple browser engines (Chromium, Firefox, WebKit) for guaranteed cross-browser compatibility.
- **[x] Smart Caching**: Playwright browser binary caching configured to significantly reduce pipeline execution time and resource consumption.
- **[x] Consolidated Reporting**: Multi-shard `.blob` files are merged into a single, unified Playwright HTML report via artifact upload/download.
- **[x] Cloud Deployment**: Automated deployment of the generated HTML report to a static Github host for immediate stakeholder visibility. [View latest test report](https://nicolaslage152.github.io/Saucedemo-Playwright-Automation/).
- **[x] Alerting System**: Integrated SMTP email notifications to broadcast workflow status (✅ Success / 🚨 Failure) with direct links to test evidence.

---

## 🚀 How to Run the Tests Locally

**1. Clone the repository:**
```bash
git clone https://github.com/NicolasLage152/Saucedemo-Playwright-Automation.git
cd Saucedemo-Playwright-Automation
```

**2. Install dependencies:**
```bash
npm install
npx playwright install
```

**3. Execute the test suite:**
```bash
# Run all tests in headless mode
npx playwright test

# Run tests with the Playwright UI
npx playwright test --ui
```

---

## 📬 Let's Connect

Ensuring top-tier e-commerce functionality is my specialty. If you need a QA professional to build a reliable automation suite, document precise bug reports, and elevate your platform's quality, let's talk!

- **LinkedIn:** [Nicolas Agustin Lage Calabria](https://www.linkedin.com/in/nicolas-lage-187413346/) 
- **Review my code:** Feel free to explore the `tests` and `POMs` folders in this repository!

<div align="center">
  <i>Engineered with passion for quality.</i>
</div>
