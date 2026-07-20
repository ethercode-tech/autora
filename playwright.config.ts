import { defineConfig, devices } from "@playwright/test";

const nodeBinary = "\"C:\\Users\\cecil\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\bin\\node.exe\"";
const useProductionServer = process.env.E2E_USE_PROD_SERVER === "1";
const externalBaseUrl = process.env.E2E_EXTERNAL_BASE_URL;
const port = process.env.PLAYWRIGHT_PORT ?? (useProductionServer ? "3100" : "3000");
const nextCommand = useProductionServer
  ? `${nodeBinary} .\\node_modules\\next\\dist\\bin\\next start --hostname 127.0.0.1 --port ${port}`
  : `${nodeBinary} .\\node_modules\\next\\dist\\bin\\next dev --hostname 127.0.0.1 --port ${port}`;
const baseURL = externalBaseUrl || `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30000,
  workers: 1,
  webServer: externalBaseUrl
    ? undefined
    : {
        command: nextCommand,
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120000
      },
  use: {
    baseURL,
    trace: "on-first-retry"
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
        }
      }
    }
  ]
});
