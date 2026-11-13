import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export interface GalleryImage {
  file: string;
  src: string;
  alt: string;
}

const IMAGE = /\.(jpe?g|png|webp)$/i;
const FOLDER = "public/images/gallery";
const URL_BASE = "/images/gallery";

// Turns a list of file names (and optional captions) into carousel images.
// Hidden files, notes, and non-image files are ignored. Names sort naturally
// (photo-2 before photo-10). The caption becomes the image's alt text;
// without one, the file name is made readable.
export function buildGallery(files: string[], captions: Record<string, string>): GalleryImage[] {
  return files
    .filter((f) => !f.startsWith(".") && IMAGE.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }))
    .map((file) => ({
      file,
      src: `${URL_BASE}/${encodeURIComponent(file)}`,
      alt:
        captions[file]?.trim() ||
        file.replace(IMAGE, "").replace(/[-_]+/g, " ").trim() ||
        "Chapter photo",
    }));
}

// Reads the gallery folder on the server. Returns [] if the folder is missing.
export function listGalleryImages(): GalleryImage[] {
  try {
    const dir = join(process.cwd(), FOLDER);
    let captions: Record<string, string> = {};
    try {
      const parsed = JSON.parse(readFileSync(join(dir, "captions.json"), "utf8"));
      if (parsed && typeof parsed === "object") captions = parsed as Record<string, string>;
    } catch {
      // No captions file, or it is not valid JSON: fall back to file names.
    }
    return buildGallery(readdirSync(dir), captions);
  } catch {
    return [];
  }
}
