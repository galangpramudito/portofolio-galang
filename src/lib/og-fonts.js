// Google Fonts serves TTF to non-browser user agents, which ImageResponse (satori) can read.
// `text` subsets the font so the download stays tiny.
async function loadGoogleFont(family, text) {
  const url = `https://fonts.googleapis.com/css2?family=${family}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url)).text();
  const resource = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);
  if (!resource) throw new Error(`Font not found: ${family}`);
  const res = await fetch(resource[1]);
  if (!res.ok) throw new Error(`Font download failed: ${family}`);
  return res.arrayBuffer();
}

/**
 * Fonts for ImageResponse. Falls back to the built-in Geist Regular
 * (returns []) when Google Fonts is unreachable at build time.
 */
export async function loadOgFonts({ sansText = "", serifText = "" }) {
  const jobs = [];
  if (sansText) {
    jobs.push(
      loadGoogleFont("Geist:wght@700", sansText).then((data) => ({ name: "Geist", data, weight: 700, style: "normal" }))
    );
  }
  if (serifText) {
    jobs.push(
      loadGoogleFont("Instrument+Serif:ital@1", serifText).then((data) => ({ name: "Instrument Serif", data, weight: 400, style: "italic" }))
    );
  }
  const results = await Promise.allSettled(jobs);
  return results.filter((r) => r.status === "fulfilled").map((r) => r.value);
}
