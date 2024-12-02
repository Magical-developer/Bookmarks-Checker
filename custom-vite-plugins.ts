import fs from "fs";
import { resolve } from "path";
import type { PluginOption } from "vite";
export function crxI18n(options: {
  localize: boolean;
  src: string;
}): PluginOption {
  if (!options.localize) return null;

  const getJsonFiles = (dir: string): Array<string> => {
    const files = fs.readdirSync(dir, { recursive: true }) as string[];
    return files.filter((file) => !!file && file.endsWith(".json"));
  };
  const entry = resolve(__dirname, options.src);
  const localeFiles = getJsonFiles(entry);
  const files = localeFiles.map((file) => {
    return {
      id: "",
      fileName: file,
      source: fs.readFileSync(resolve(entry, file)),
    };
  });
  return {
    name: "crx-i18n",
    enforce: "pre",
    buildStart: {
      order: "post",
      handler() {
        files.forEach((file) => {
          const refId = this.emitFile({
            type: "asset",
            source: file.source,
            fileName: "_locales/" + file.fileName,
          });
          file.id = refId;
        });
      },
    },
  };
}
