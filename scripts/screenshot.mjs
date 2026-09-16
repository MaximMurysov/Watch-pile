#!/usr/bin/env node
// Личный dev-инструмент: не часть pnpm test/CI/чек-листа перед PR.
// Открывает страницу в headless Chromium и сохраняет скриншот — чтобы
// проверять, как выглядит и работает функциональность, без ручного
// запуска браузера.
import { mkdir } from "node:fs/promises";
import path from "node:path";

import { chromium } from "playwright";

const DEFAULT_VIEWPORT = { width: 1280, height: 800 };
const DEFAULT_OUTPUT_DIR = "screenshots";

async function main() {
  const [, , url, outputPathArg] = process.argv;

  if (!url) {
    console.error(
      "Использование: pnpm screenshot <url> [путь-к-файлу.png]\n" +
        "Пример: pnpm screenshot http://127.0.0.1:5173/",
    );
    process.exitCode = 1;
    return;
  }

  const outputPath = outputPathArg ?? path.join(DEFAULT_OUTPUT_DIR, `${Date.now()}.png`);
  await mkdir(path.dirname(outputPath), { recursive: true });

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: DEFAULT_VIEWPORT });
    await page.goto(url, { waitUntil: "networkidle" });
    await page.screenshot({ path: outputPath, fullPage: true });
    console.log(`Скриншот сохранён: ${outputPath}`);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
