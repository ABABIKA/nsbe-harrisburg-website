import { describe, expect, it } from "vitest";
import { buildGallery } from "./gallery";

describe("buildGallery", () => {
  it("keeps only image files and ignores hidden files and notes", () => {
    const g = buildGallery(["a.jpg", "b.PNG", "c.webp", "d.jpeg", ".DS_Store", "README.md", "captions.json", "e.gif", "notes.txt"], {});
    expect(g.map((i) => i.file)).toEqual(["a.jpg", "b.PNG", "c.webp", "d.jpeg"]);
  });

  it("sorts names naturally so photo-2 comes before photo-10", () => {
    const g = buildGallery(["photo-10.jpg", "photo-2.jpg", "photo-1.jpg"], {});
    expect(g.map((i) => i.file)).toEqual(["photo-1.jpg", "photo-2.jpg", "photo-10.jpg"]);
  });

  it("builds the public address from the folder name", () => {
    const [g] = buildGallery(["gbm one.jpg"], {});
    expect(g.src).toBe("/images/gallery/gbm%20one.jpg");
  });

  it("uses a caption when given, otherwise a readable name from the file name", () => {
    const g = buildGallery(["fall-gbm_2026.jpg", "x.jpg"], { "x.jpg": "Members at the volunteer event" });
    expect(g[0].alt).toBe("fall gbm 2026");
    expect(g[1].alt).toBe("Members at the volunteer event");
  });

  it("returns an empty list when there are no images", () => {
    expect(buildGallery([], {})).toEqual([]);
    expect(buildGallery(["README.md"], {})).toEqual([]);
  });
});
