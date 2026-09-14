import { test, expect } from "@fixtures/baseTest";
import { USERS, PASSWORDS, PRODUCTS } from "@fixtures/testData";

test.describe("Pruebas de Login y Usuarios Específicos - SauceDemo", () => {
  // Isolate login suite from global storageState so it starts with a clean session
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test("Validar login exitoso con usuario estándar", async ({
    page,
    loginPage,
  }) => {
    await loginPage.login(USERS.STANDARD, PASSWORDS.STANDARD);
    await expect(page).toHaveURL("/inventory.html");
  });

  test("Validar bloqueo para locked_out_user", async ({ page, loginPage }) => {
    await loginPage.login(USERS.LOCKED_OUT, PASSWORDS.STANDARD);

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText(
      "Epic sadface: Sorry, this user has been locked out.",
    );
    await expect(page).toHaveURL(/.*saucedemo\.com\//);
  });

  test("Validar fallo de renderizado de imágenes para problem_user", async ({
    page,
    loginPage,
    inventoryPage,
  }) => {
    await loginPage.login(USERS.PROBLEM, PASSWORDS.STANDARD);
    await expect(page).toHaveURL(/.*inventory\.html/);

    const firstProductImg = inventoryPage.inventoryItems.first().locator("img");
    await expect(firstProductImg).toHaveAttribute("src", /.*sl-404.*\.jpg/);
  });

  test("Validar tiempos de respuesta diferidos para performance_glitch_user", async ({
    page,
    loginPage,
  }) => {
    const startTime = Date.now();

    await loginPage.login(USERS.PERFORMANCE_GLITCH, PASSWORDS.STANDARD);
    await expect(page).toHaveURL(/.*inventory\.html/);

    const duration = Date.now() - startTime;
    expect(duration).toBeGreaterThan(3000);
  });

  test("Validar inconsistencia de eventos para error_user", async ({
    page,
    loginPage,
    inventoryPage,
  }) => {
    await loginPage.login(USERS.ERROR, PASSWORDS.STANDARD);
    await expect(page).toHaveURL(/.*inventory\.html/);

    const item = inventoryPage.inventoryItems.filter({
      hasText: PRODUCTS.FLEECE_JACKET,
    });
    const addToCartBtn = item.getByRole("button", { name: "Add to cart" });

    await addToCartBtn.click();

    // In error_user, the button does NOT change to "Remove"
    await expect(addToCartBtn).toBeVisible();
  });

  test("Validar fallos en maquetación/layout para visual_user", async ({
    page,
    loginPage,
    inventoryPage,
  }) => {
    await loginPage.login(USERS.VISUAL, PASSWORDS.STANDARD);
    await expect(page).toHaveURL(/.*inventory\.html/);

    await expect(inventoryPage.navbar.cartLink).toBeVisible();
  });

  test("Validar error con credenciales inválidas", async ({ loginPage }) => {
    await loginPage.login("invalid_user", "wrong_password");

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText(
      "Username and password do not match any user in this service",
    );
  });

  test("Validar campos vacíos", async ({ loginPage }) => {
    await loginPage.login("", "");

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText("Username is required");
  });
});
