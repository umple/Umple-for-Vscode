import * as fs from "fs";
import * as https from "https";
import * as child_process from "child_process";
import * as path from "path";
import * as vscode from "vscode";

const UMPLESYNC_JAR_URL = "https://try.umple.org/scripts/umplesync.jar";
const UMPLE_VERSION_URL =
  "https://cruise.umple.org/umpleonline/scripts/versionRunning.txt";

/**
 * Check if Java is available on the system.
 */
export function checkJava(): boolean {
  try {
    child_process.execSync("java -version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

/**
 * Extract semantic version from full Umple version string.
 * "1.35.0.7523.c616a4dce" -> "1.35.0"
 */
function extractSemanticVersion(fullVersion: string): string {
  const parts = fullVersion.split(".");
  if (parts.length >= 3) {
    return parts.slice(0, 3).join(".");
  }
  return fullVersion;
}

/**
 * Get the current version of umplesync.jar.
 */
export function getCurrentVersion(jarPath: string): string | null {
  if (!fs.existsSync(jarPath)) {
    return null;
  }
  try {
    const output = child_process
      .execSync(`java -jar "${jarPath}" -version`, { encoding: "utf8" })
      .trim();
    // Extract version from output like "Version: 1.35.0.7523.c616a4dce"
    const match = output.match(/Version:\s*(.+)/i);
    const fullVersion = match ? match[1].trim() : output;
    return extractSemanticVersion(fullVersion);
  } catch {
    return null;
  }
}

/**
 * Follow redirects and fetch content from an HTTPS URL.
 */
function httpsGet(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        httpsGet(res.headers.location).then(resolve, reject);
        return;
      }
      if (res.statusCode && res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      const chunks: Buffer[] = [];
      res.on("data", (chunk: Buffer) => chunks.push(chunk));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}

/**
 * Get the latest version number from Umple server.
 */
export async function getLatestVersion(): Promise<string | null> {
  try {
    const buf = await httpsGet(UMPLE_VERSION_URL);
    const output = buf.toString("utf8").trim();
    if (!output) return null;
    return extractSemanticVersion(output);
  } catch {
    return null;
  }
}

/**
 * Download umplesync.jar from the Umple server.
 */
export async function downloadUmpleSyncJar(jarPath: string): Promise<boolean> {
  try {
    const buf = await httpsGet(UMPLESYNC_JAR_URL);
    fs.writeFileSync(jarPath, buf);
    return true;
  } catch (error) {
    console.error("Failed to download umplesync.jar:", error);
    return false;
  }
}

/**
 * Update umplesync.jar if a newer version is available.
 */
export async function updateUmpleSyncJar(extensionPath: string): Promise<void> {
  const config = vscode.workspace.getConfiguration("umple");
  if (!config.get("autoUpdate")) {
    return;
  }

  const jarPath = path.join(extensionPath, "umplesync.jar");

  // Check if JAR exists
  if (!fs.existsSync(jarPath)) {
    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "Downloading umplesync.jar...",
        cancellable: false,
      },
      async () => {
        await downloadUmpleSyncJar(jarPath);
      },
    );
    return;
  }

  // Check for updates
  const currentVersion = getCurrentVersion(jarPath);
  const latestVersion = await getLatestVersion();

  if (!latestVersion) {
    return; // Can't check version, skip update
  }

  if (currentVersion !== latestVersion) {
    const result = await vscode.window.showInformationMessage(
      `A new version of Umple is available (${latestVersion}). Update now?`,
      "Update",
      "Later",
    );

    if (result === "Update") {
      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Updating umplesync.jar...",
          cancellable: false,
        },
        async () => {
          await downloadUmpleSyncJar(jarPath);
          vscode.window.showInformationMessage(
            "umplesync.jar updated successfully!",
          );
        },
      );
    }
  }
}
