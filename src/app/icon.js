import { renderBrandIcon } from "@/lib/brand-icon";

// favicon.ico stays the primary icon; these PNGs serve Google results & the web manifest
const SIZES = [192, 512];

export function generateImageMetadata() {
  return SIZES.map((s) => ({
    id: String(s),
    size: { width: s, height: s },
    contentType: "image/png",
  }));
}

export default async function Icon({ id }) {
  return renderBrandIcon(Number(await id));
}
