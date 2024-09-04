import { promises as fs } from "fs";
import * as tc from "@actions/tool-cache";
export async function updateChecksums(
  filePath: string,
  downloadUrls: string[],
): Promise<void> {
  await fs.rm(filePath);
  await fs.appendFile(
    filePath,
    "// AUTOGENERATED_DO_NOT_EDIT\nexport const KNOWN_CHECKSUMS: {[key: string]: string} = {\n",
  );
  let firstLine = true;
  for (const downloadUrl of downloadUrls) {
    const content = await downloadAssetContent(downloadUrl);
    const checksum = content.split(" ")[0].trim();
    const key = getKey(downloadUrl);
    if (!firstLine) {
      await fs.appendFile(filePath, ",\n");
    }
    await fs.appendFile(filePath, `  '${key}':\n    '${checksum}'`);
    firstLine = false;
  }
  await fs.appendFile(filePath, "}\n");
}

function getKey(downloadUrl: string): string {
  // https://github.com/astral-sh/uv/releases/download/0.3.2/uv-aarch64-apple-darwin.tar.gz.sha256
  const parts = downloadUrl.split("/");
  const fileName = parts[parts.length - 1];
  const name = fileName.split(".")[0].split("uv-")[1];
  const version = parts[parts.length - 2];
  return `${name}-${version}`;
}

async function downloadAssetContent(downloadUrl: string): Promise<string> {
  const downloadPath = await tc.downloadTool(downloadUrl);
  const content = await fs.readFile(downloadPath, "utf8");
  return content;
}
