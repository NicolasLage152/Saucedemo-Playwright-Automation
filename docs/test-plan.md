# Master Test Plan: SauceDemo Playwright Automation

**Versión:** 2.0 (Post-Refactorización)
**Estado:** Aprobado
**Autor:** Nicolas Lage (QA Automation Lead)

---

## 1. Introducción y Objetivos
Este documento define la estrategia, el alcance y la matriz de cobertura de pruebas automatizadas para el proyecto **SauceDemo Playwright Automation**. 

**Objetivo Principal:** 
Garantizar la estabilidad y calidad funcional de la plataforma e-commerce SauceDemo mediante un framework de automatización *End-to-End* (E2E). El framework persigue una cobertura del 100% sobre los flujos críticos de negocio (Happy Paths) y un exhaustivo control de escenarios anómalos (Edge Cases), garantizando resiliencia frente a falsos positivos a través de aserciones *Web-First* y ejecución *Cross-Browser*.

---

## 2. Alcance de las Pruebas (Scope)

### 2.1. Dentro del Alcance (In Scope)
- **Módulo de Autenticación:** Inicio de sesión, validación de estados de cuenta (bloqueado, con fallas de rendimiento, con errores de red) y validación de formularios vacíos/inválidos.
- **Módulo de Catálogo e Inventario:** Visualización de productos, ordenamiento (Sorting) algorítmico y navegación hacia Detalles del Producto (PDP).
- **Gestión del Carrito de Compras:** Adición/eliminación masiva y parcial de productos, persistencia de sesión y cálculo de *badges*.
- **Módulo de Checkout (Pasarela de Pago):** Validación de formularios (espacios en blanco, datos faltantes), cálculo matemático de impuestos/subtotales y prevención de inyección de URLs (Bypass de seguridad).
- **Navegación y UI:** Menú lateral (Hamburger), Footer, redes sociales y pruebas de **Regresión Visual (Pixel-by-Pixel)**.

### 2.2. Fuera del Alcance (Out of Scope)
- Pruebas de Carga y Estrés (Performance Backend).
- Validación directa a Base de Datos (las pruebas operan en la capa de Interfaz de Usuario/Caja Negra).
- Pruebas de Seguridad (Pen-testing avanzado).

---

## 3. Estrategia y Arquitectura de Pruebas

- **Framework Core:** Playwright (TypeScript).
- **Patrón de Diseño:** *Page Object Model* (POM) estricto. Todas las interacciones del DOM están abstraídas en la carpeta `pages/`.
- **Inyección de Dependencias:** Uso avanzado de `Custom Fixtures` (`test.extend`) para aislar el estado y orquestar las páginas sin redundancia en los *specs*.
- **Manejo de Estado (Auth):** Setup global (`auth.setup.ts`) con `storageState` para bypassear el flujo de login en módulos posteriores, reduciendo el tiempo de ejecución en un 60%.
- **Niveles de Aserción:** 
  - *Funcional*: Aserciones asíncronas con reintento automático (`toHaveCount`, `toBeVisible`).
  - *Visual*: `toHaveScreenshot()` configurado para detectar anomalías de CSS/maquetación.
- **Validación Cross-Browser:** Chromium, Firefox y WebKit en paralelo.

---

## 4. Entornos de Ejecución y CI/CD

- **Entorno SUT (System Under Test):** Producción/Staging configurado vía variable de entorno `TEST_ENV` (Por defecto: `https://www.saucedemo.com`).
- **Integración Continua (CI):** 
  - **Plataforma:** GitHub Actions (`playwright.yml`).
  - **Triggers:** Push y Pull Request hacia la rama `main`, y ejecución calendarizada (Cron).
  - **Artefactos:** Consolidación de `blob-reports` mediante `playwright merge-reports` y despliegue a **GitHub Pages**.
  - **Alertas:** Notificación vía Email del resultado del pipeline.
  - **Pre-commit Hook:** Husky + `lint-staged` garantizando código formateado (ESLint/Prettier) e infalible (TS Type Check) antes de tocar el repositorio.

---

## 5. Matriz de Cobertura de Pruebas (Test Coverage)

La siguiente matriz refleja el 100% de los escenarios implementados actualmente en la suite:

### 5.1. Módulo de Autenticación (`tests/auth/login/login.spec.ts`)
| ID | Escenario de Prueba | Tipo de Prueba | Estado |
| :-- | :--- | :--- | :---: |
| AUTH-01 | Validar login exitoso con usuario estándar. | Happy Path | ✅ |
| AUTH-02 | Validar bloqueo y mensaje de error para `locked_out_user`. | Edge Case | ✅ |
| AUTH-03 | Validar fallo de renderizado de imágenes (404) para `problem_user`. | UI / Edge Case | ✅ |
| AUTH-04 | Validar retardo de respuesta (>3000ms) para `performance_glitch_user`. | Performance UX | ✅ |
| AUTH-05 | Validar persistencia de errores lógicos (botones rotos) para `error_user`. | Funcional Negativa | ✅ |
| AUTH-06 | Validar fallos de maquetación de Layout para `visual_user`. | UI | ✅ |
| AUTH-07 | Validar error al ingresar credenciales inválidas. | Negativa | ✅ |
| AUTH-08 | Validar validación del formulario con campos vacíos. | Negativa | ✅ |

### 5.2. Catálogo y Ordenamiento (`tests/catalog/`)
| ID | Escenario de Prueba | Tipo de Prueba | Estado |
| :-- | :--- | :--- | :---: |
| CAT-01 | Flujo E2E: Renderizado correcto del catálogo tras autenticación. | Happy Path | ✅ |
| CAT-02 | Agregar y remover producto directamente desde la vista de detalle (PDP). | Happy Path | ✅ |
| CAT-03 | Flujo E2E Completo: PDP -> Carrito -> Cálculo de impuestos -> Orden. | Happy Path E2E | ✅ |
| CAT-04 | Validación algorítmica: Ordenamiento alfabético ascendente (A-Z). | Funcional | ✅ |
| CAT-05 | Validación algorítmica: Ordenamiento alfabético descendente (Z-A). | Funcional | ✅ |
| CAT-06 | Validación algorítmica: Ordenamiento por precio (Low to High). | Funcional | ✅ |
| CAT-07 | Validación algorítmica: Ordenamiento por precio (High to Low). | Funcional | ✅ |

### 5.3. Gestión de Carrito de Compras (`tests/cart/cart-management.spec.ts`)
| ID | Escenario de Prueba | Tipo de Prueba | Estado |
| :-- | :--- | :--- | :---: |
| CART-01 | Comprobar interfaz gráfica y estado inicial de un carrito vacío. | Funcional | ✅ |
| CART-02 | Botón "Continue Shopping" retorna al catálogo manteniendo el estado. | Funcional | ✅ |
| CART-03 | Persistencia del carrito tras recargar la página (Refresh/F5). | Edge Case | ✅ |
| CART-04 | Adición masiva (Bulk) de todo el catálogo (6/6) y validación del badge. | Funcional | ✅ |
| CART-05 | Eliminación parcial de múltiples productos; actualización de lista y contador. | Funcional | ✅ |
| CART-06 | Coherencia de Datos: Los detalles en carrito hacen *match* con el catálogo. | Funcional | ✅ |
| CART-07 | Interbloqueo rápido (Quick Add/Remove Toggle): Stress test de interfaz. | Edge Case / Stress | ✅ |
| CART-08 | Persistencia de carrito a través de Logout e inicio de sesión subsecuente. | Funcional | ✅ |

### 5.4. Flujo de Checkout (`tests/checkout/`)
| ID | Escenario de Prueba | Tipo de Prueba | Estado |
| :-- | :--- | :--- | :---: |
| CHK-01 | Step 1: Completar formulario con información válida y continuar. | Happy Path | ✅ |
| CHK-02 | Step 1: Formulario vacío, validación de mensajes de error. | Negativa | ✅ |
| CHK-03 | Step 1: Validaciones granulares (Falta de apellido, Falta código postal). | Negativa | ✅ |
| CHK-04 | Step 1: Inyección de espacios en blanco (Bypass de seguridad en inputs). | Edge Case / Sec | ✅ |
| CHK-05 | Step 2 (Overview): Verificación estática de método de pago e información de envío. | Funcional | ✅ |
| CHK-06 | Step 2 (Overview): **Cálculo Matemático Dinámico** (Subtotal = Suma real de ítems). | Funcional Core | ✅ |
| CHK-07 | Step 2 (Overview): Comportamiento de plataforma al intentar checkout con carrito vacío. | Edge Case | ✅ |
| CHK-08 | Step 2 (Overview): **Inyección de URL sin sesión** (Rechazo automático). | Seguridad | ✅ |
| CHK-09 | Complete: Pantalla de confirmación, visibilidad de logo "Pony Express". | UI Funcional | ✅ |
| CHK-10 | Complete: Interacción y cierre del flujo con el botón "Back Home". | Funcional | ✅ |

### 5.5. Regresión Visual (`tests/catalog/visual-regression.spec.ts`)
| ID | Escenario de Prueba | Tipo de Prueba | Estado |
| :-- | :--- | :--- | :---: |
| VIS-01 | El layout completo de la página de inventario coincide con el snapshot base. | Visual (Pixel) | ✅ |
| VIS-02 | La tarjeta de producto individual (`Product Card`) coincide con el snapshot base. | Visual (Pixel) | ✅ |
| VIS-03 | Alteración visual correcta del botón (Add to Cart -> Remove) capturada. | Visual (Pixel) | ✅ |

### 5.6. Navegación, Menú y Footer (`tests/navigation/`)
| ID | Escenario de Prueba | Tipo de Prueba | Estado |
| :-- | :--- | :--- | :---: |
| NAV-01 | Apertura, transformaciones CSS y cierre correcto del Menú Hamburguesa. | UI Funcional | ✅ |
| NAV-02 | Navegación de links internos y externos ("All Items", "About"). | Funcional | ✅ |
| NAV-03 | Función "Reset App State" borra efectivamente el carrito de compras. | Funcional | ✅ |
| NAV-04 | Validaciones estáticas de "Copyright" y enlaces sociales (Twitter, FB, LinkedIn). | UI Funcional | ✅ |

---

## 6. Riesgos y Mitigación

| Riesgo Detectado | Impacto | Estrategia de Mitigación |
| :--- | :---: | :--- |
| **Flakiness por latencia de red en CI** | Alto | Uso estricto de esperas automáticas (auto-wait) de Playwright (`toHaveCount`, `toBeVisible`). Nunca se usan pausas fijas (`waitForTimeout`). |
| **Cambios de UI quebrando Visual Tests** | Medio | Ejecución en local con el *flag* `--update-snapshots` ante cambios intencionados de diseño para recibrar el *baseline* antes de aprobar la PR. |
| **Fallo en páginas de terceros (Redes Sociales)** | Bajo | Los tests se enfocan en validar la correcta estructuración del atributo `href` o capturan la navegación sin depender de la carga del DOM externo. |

---

## 7. Criterios de Aceptación y "Definition of Done"

Para que una nueva funcionalidad o refactorización de código se considere **DONE** en el contexto de QA Automation, debe cumplir:
1. Pasa el 100% de los linters localmente y en CI (`eslint`, `tsc`, `prettier`).
2. El pipeline en **GitHub Actions finaliza en VERDE** bajo los tres navegadores (Chromium, Firefox, WebKit).
3. Todas las aserciones de prueba utilizan la filosofía *Web-First*. Ningún selector expuesto (Fugas de abstracción) dentro de los *specs*.
4. Existe trazabilidad en los reportes generados (HTML desplegado en Pages) con evidencia de captura (Screenshots/Videos) ante eventuales fallos.