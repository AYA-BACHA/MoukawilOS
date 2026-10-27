import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.resolve(__dirname, "../frontend/package.json"));
const { chromium } = require("playwright");

const screenshotsDir = path.resolve(__dirname, "../docs/screenshots/mobile");

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

const VIEWPORTS = [
  { name: "mobile-360", width: 360, height: 800, isMobile: true, hasTouch: true },
  { name: "mobile-390", width: 390, height: 844, isMobile: true, hasTouch: true },
  { name: "tablet-768", width: 768, height: 1024, isMobile: false, hasTouch: true },
  { name: "laptop-1024", width: 1024, height: 768, isMobile: false, hasTouch: false },
  { name: "desktop-1440", width: 1440, height: 900, isMobile: false, hasTouch: false },
];

const ROUTES = [
  { path: "/dashboard", name: "dashboard" },
  { path: "/invoices", name: "invoices" },
  { path: "/invoices/new", name: "invoice-builder" },
  { path: "/clients", name: "clients" },
  { path: "/assistant", name: "assistant" },
  { path: "/settings", name: "settings" },
];

async function run() {
  console.log("🚀 Starting Mobile Responsiveness & Overflow Test Suite...\n");

  const browser = await chromium.launch({
    channel: "msedge",
    headless: true,
  });

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  const failures = [];

  for (const vp of VIEWPORTS) {
    console.log(`\n========================================`);
    console.log(`📱 Testing Viewport: ${vp.name} (${vp.width}x${vp.height})`);
    console.log(`========================================`);

    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.isMobile,
      hasTouch: vp.hasTouch,
    });

    const page = await context.newPage();

    for (const route of ROUTES) {
      totalTests++;
      const url = `http://localhost:3000${route.path}`;
      process.stdout.write(`  Checking ${route.path.padEnd(16)} ... `);

      try {
        await page.goto(url, { waitUntil: "networkidle", timeout: 15000 });
        // Extra wait for layout stabilization and dynamic elements
        await page.waitForTimeout(600);

        // Check horizontal overflow invariant
        const metrics = await page.evaluate(() => {
          const scrollWidth = document.documentElement.scrollWidth;
          const innerWidth = window.innerWidth;
          const overflow = scrollWidth - innerWidth;

          // Find offending overflowing elements if any
          const offenders = [];
          if (overflow > 1) {
            for (const el of document.querySelectorAll("*")) {
              const rect = el.getBoundingClientRect();
              if (rect.right > innerWidth + 1.5) {
                offenders.push({
                  tag: el.tagName.toLowerCase(),
                  id: el.id || undefined,
                  className: (el.className || "").toString().slice(0, 70),
                  right: Math.round(rect.right),
                  width: Math.round(rect.width),
                });
              }
            }
          }

          return { scrollWidth, innerWidth, overflow, offenders: offenders.slice(0, 4) };
        });

        if (metrics.overflow <= 1) {
          passedTests++;
          console.log(`✅ PASS (scrollWidth: ${metrics.scrollWidth}px <= innerWidth: ${metrics.innerWidth}px)`);
        } else {
          failedTests++;
          console.log(`❌ FAIL (overflow: +${metrics.overflow}px, scroll: ${metrics.scrollWidth}px, inner: ${metrics.innerWidth}px)`);
          console.log(`     Offenders:`, JSON.stringify(metrics.offenders));
          failures.push({
            viewport: vp.name,
            route: route.path,
            overflow: metrics.overflow,
            offenders: metrics.offenders,
          });
        }

        // Save screenshot
        const screenshotPath = path.join(screenshotsDir, `${vp.name}-${route.name}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: false });

      } catch (err) {
        failedTests++;
        console.log(`❌ ERROR: ${err.message}`);
        failures.push({
          viewport: vp.name,
          route: route.path,
          error: err.message,
        });
      }
    }

    // Special test: on 390px mobile, test opening mobile drawer
    if (vp.name === "mobile-390") {
      try {
        console.log(`  Checking Mobile Drawer Interaction ... `);
        await page.goto("http://localhost:3000/dashboard", { waitUntil: "networkidle" });
        await page.waitForTimeout(400);

        // Click hamburger button
        const hamburger = page.locator("button[aria-label*='navigation'], button[aria-label*='menu'], button:has-text('menu')").first();
        if (await hamburger.isVisible()) {
          await hamburger.click();
          await page.waitForTimeout(400);

          const drawerScreenshot = path.join(screenshotsDir, "mobile-390-drawer-open.png");
          await page.screenshot({ path: drawerScreenshot });
          console.log(`  ✅ Mobile Drawer captured: mobile-390-drawer-open.png`);
        }
      } catch (e) {
        console.log(`  ⚠️ Drawer test note: ${e.message}`);
      }
    }

    await context.close();
  }

  await browser.close();

  console.log(`\n========================================`);
  console.log(`📊 TEST SUITE SUMMARY:`);
  console.log(`   Total Tests:  ${totalTests}`);
  console.log(`   Passed:       ${passedTests} ✅`);
  console.log(`   Failed:       ${failedTests} ${failedTests === 0 ? "🎉" : "❌"}`);
  console.log(`========================================\n`);

  if (failures.length > 0) {
    console.error("FAILURES DETAIL:", JSON.stringify(failures, null, 2));
    process.exit(1);
  } else {
    console.log("🌟 ALL VIEWPORTS AND ROUTES PASSED WITH ZERO HORIZONTAL OVERFLOW!");
    process.exit(0);
  }
}

run().catch((err) => {
  console.error("Fatal test error:", err);
  process.exit(1);
});
