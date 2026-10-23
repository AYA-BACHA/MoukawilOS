import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.resolve(__dirname, "../frontend/package.json"));
const { chromium } = require("playwright");

const screenshotsDir = path.resolve(__dirname, "../docs/screenshots");

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function capture() {
  console.log("📸 Launching browser to capture updated screenshots for README...");

  const browser = await chromium.launch({
    channel: "msedge",
    headless: true,
  });

  const targets = [
    {
      name: "dashboard",
      path: "/dashboard",
      width: 1280,
      height: 820,
    },
    {
      name: "invoices-ledger",
      path: "/invoices",
      width: 1280,
      height: 900,
    },
    {
      name: "invoice-editor",
      path: "/invoices/new",
      width: 1280,
      height: 900,
    },
    {
      name: "assistant",
      path: "/assistant",
      width: 1280,
      height: 900,
    },
    {
      name: "clients",
      path: "/clients",
      width: 1280,
      height: 900,
    },
    {
      name: "compliance",
      path: "/settings",
      width: 1280,
      height: 900,
    },
  ];

  for (const target of targets) {
    console.log(`Capturing ${target.name} at ${target.path} (${target.width}x${target.height})...`);
    const context = await browser.newContext({
      viewport: { width: target.width, height: target.height },
      deviceScaleFactor: 1,
      colorScheme: "light",
    });

    const page = await context.newPage();

    // Ensure localStorage boots in light mode, English, and dismiss judge hint callout popup
    await page.addInitScript(() => {
      localStorage.setItem("moukawil_theme", "light");
      localStorage.setItem("moukawil_lang", "en");
      sessionStorage.setItem("moukawil_judge_hint_dismissed", "true");
    });

    try {
      await page.goto(`http://localhost:3000${target.path}`, {
        waitUntil: "networkidle",
        timeout: 20000,
      });

      // Extra wait for fonts, layout, and chart animations
      await page.waitForTimeout(1400);

      const filePath = path.join(screenshotsDir, `${target.name}.png`);
      await page.screenshot({ path: filePath, fullPage: false });
      console.log(`✅ Saved: ${filePath}`);

      if (target.name === "dashboard") {
        const heroPath = path.join(screenshotsDir, "hero.png");
        fs.copyFileSync(filePath, heroPath);
        console.log(`✅ Copied dashboard to hero: ${heroPath}`);
      }

      if (target.name === "compliance") {
        const settingsPath = path.join(screenshotsDir, "settings.png");
        fs.copyFileSync(filePath, settingsPath);
        console.log(`✅ Copied compliance to settings: ${settingsPath}`);
      }
    } catch (err) {
      console.error(`❌ Error capturing ${target.name}:`, err);
    } finally {
      await context.close();
    }
  }

  await browser.close();
  console.log("🎉 All README screenshots successfully captured!");
}

capture().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
