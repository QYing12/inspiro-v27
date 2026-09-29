// Frontend-only mock metadata for pasted URLs.
//
// parseLinkPreview("https://www.youtube.com/watch?v=…")
//   → { url, sourceName, domain, pageTitle, description, previewImage,
//       contentType, accent }
//
// No network calls, no backend — we inspect the URL string and infer a
// platform from the hostname, then synthesize believable metadata so the
// Input page preview and homepage link card feel "alive" even though the
// data is mocked locally.
//
// Consumers should treat every field as optional and fall back gracefully.

const PLATFORMS = [
  {
    id: "youtube",
    match: (h) => /(^|\.)youtube\.com$/.test(h) || h === "youtu.be",
    build: (parsed, h) => {
      let videoId = null;
      if (h === "youtu.be") videoId = parsed.pathname.replace(/^\//, "");
      else if (parsed.pathname.startsWith("/watch"))
        videoId = parsed.searchParams.get("v");
      else if (parsed.pathname.startsWith("/shorts/"))
        videoId = parsed.pathname.split("/")[2];
      else if (parsed.pathname.startsWith("/embed/"))
        videoId = parsed.pathname.split("/")[2];
      // "/watch", "/shorts", "/embed" are uninteresting slugs — prefer the
      // more human "YouTube video" label when that's all we have.
      const raw = slugFromPath(parsed.pathname);
      const usable = raw && !/^(Watch|Shorts|Embed)$/i.test(raw);
      return {
        sourceName: "YouTube",
        contentType: "Video",
        pageTitle: usable ? raw : "YouTube video",
        description:
          "Video saved from YouTube — tap the card to open it in a new tab.",
        previewImage: null,
        accent: "#FF2E45",
        extra: { videoId },
      };
    },
  },
  {
    id: "instagram",
    match: (h) => /(^|\.)instagram\.com$/.test(h),
    build: () => ({
      sourceName: "Instagram",
      contentType: "Social Post",
      pageTitle: "Instagram reference",
      description: "Visual inspiration saved from Instagram.",
      previewImage: null,
      accent: "#E1306C",
    }),
  },
  {
    id: "twitter",
    match: (h) =>
      /(^|\.)twitter\.com$/.test(h) || /(^|\.)x\.com$/.test(h),
    build: () => ({
      sourceName: "X",
      contentType: "Post",
      pageTitle: "Post on X",
      description: "Short-form thought thread saved from X.",
      previewImage: null,
      accent: "#1D9BF0",
    }),
  },
  {
    id: "behance",
    match: (h) => /(^|\.)behance\.net$/.test(h),
    build: (parsed) => ({
      sourceName: "Behance",
      contentType: "Design Reference",
      pageTitle: slugFromPath(parsed.pathname) || "Behance project",
      description: "Portfolio project saved from Behance.",
      previewImage: null,
      accent: "#1769FF",
    }),
  },
  {
    id: "dribbble",
    match: (h) => /(^|\.)dribbble\.com$/.test(h),
    build: (parsed) => ({
      sourceName: "Dribbble",
      contentType: "Design Reference",
      pageTitle: slugFromPath(parsed.pathname) || "Dribbble shot",
      description: "Design shot saved from Dribbble.",
      previewImage: null,
      accent: "#EA4C89",
    }),
  },
  {
    id: "pinterest",
    match: (h) => /(^|\.)pinterest\.com$/.test(h),
    build: () => ({
      sourceName: "Pinterest",
      contentType: "Moodboard",
      pageTitle: "Pinterest pin",
      description: "Visual reference saved from Pinterest.",
      previewImage: null,
      accent: "#E60023",
    }),
  },
  {
    id: "figma",
    match: (h) => /(^|\.)figma\.com$/.test(h),
    build: (parsed) => ({
      sourceName: "Figma",
      contentType: "Design File",
      pageTitle: slugFromPath(parsed.pathname) || "Figma file",
      description: "Figma file reference.",
      previewImage: null,
      accent: "#F24E1E",
    }),
  },
  {
    id: "medium",
    match: (h) =>
      /(^|\.)medium\.com$/.test(h) || /(^|\.)substack\.com$/.test(h),
    build: (parsed, h) => ({
      sourceName: /substack/.test(h) ? "Substack" : "Medium",
      contentType: "Article",
      pageTitle: slugFromPath(parsed.pathname) || "Read from the web",
      description: "Long-form article saved for later.",
      previewImage: null,
      accent: "#12100E",
    }),
  },
  {
    id: "github",
    match: (h) => /(^|\.)github\.com$/.test(h),
    build: (parsed) => ({
      sourceName: "GitHub",
      contentType: "Repository",
      pageTitle: slugFromPath(parsed.pathname) || "GitHub repo",
      description: "Code repository reference.",
      previewImage: null,
      accent: "#8B5CF6",
    }),
  },
  {
    id: "vimeo",
    match: (h) => /(^|\.)vimeo\.com$/.test(h),
    build: (parsed) => ({
      sourceName: "Vimeo",
      contentType: "Video",
      pageTitle: slugFromPath(parsed.pathname) || "Vimeo video",
      description: "Video reference saved from Vimeo.",
      previewImage: null,
      accent: "#1AB7EA",
    }),
  },
];

// Heuristic: treat domains with blog-ish hostnames or article-shaped
// paths as "Article" rather than "Reference".
function looksLikeArticle(parsed) {
  const h = parsed.hostname;
  if (/\bblog\b/.test(h) || /\bnews\b/.test(h) || /\bjournal\b/.test(h)) return true;
  const segs = parsed.pathname.split("/").filter(Boolean);
  // e.g. /2024/03/15/why-typography-matters
  if (segs.length >= 2 && /^\d{4}$/.test(segs[0])) return true;
  // e.g. /articles/xyz
  if (segs[0] === "articles" || segs[0] === "article" || segs[0] === "posts") return true;
  return false;
}

function slugFromPath(pathname) {
  const segs = (pathname || "")
    .split("/")
    .filter(Boolean)
    .filter((s) => !/^\d+$/.test(s)); // skip pure-numeric ids
  const last = segs.pop() || "";
  return last
    .replace(/\.(html?|php|aspx?|md)$/i, "")
    .replace(/[-_+]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

export function isLikelyUrl(str) {
  if (!str || typeof str !== "string") return false;
  const s = str.trim();
  if (!s) return false;
  // accept explicit scheme, //host, or a bare hostname.path
  if (/^https?:\/\//i.test(s)) return true;
  // bare "domain.tld[/...]" — require a dot and no spaces
  return /^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}(\/.*)?$/i.test(s) && !/\s/.test(s);
}

export function parseLinkPreview(raw) {
  if (!isLikelyUrl(raw)) return null;
  let parsed;
  try {
    const needsScheme = !/^https?:\/\//i.test(raw.trim());
    parsed = new URL(needsScheme ? `https://${raw.trim()}` : raw.trim());
  } catch {
    return null;
  }

  const hostname = parsed.hostname.replace(/^www\./, "").toLowerCase();
  const domain = hostname;

  const matched = PLATFORMS.find((p) => p.match(hostname));
  if (matched) {
    const meta = matched.build(parsed, hostname);
    return {
      url: parsed.toString(),
      domain,
      sourceName: meta.sourceName,
      contentType: meta.contentType,
      pageTitle: meta.pageTitle,
      description: meta.description,
      previewImage: meta.previewImage || null,
      accent: meta.accent || null,
      platform: matched.id,
      ...(meta.extra || {}),
    };
  }

  // Generic fallback — article-ish vs. plain reference
  const article = looksLikeArticle(parsed);
  return {
    url: parsed.toString(),
    domain,
    sourceName: article ? "Article" : "Link",
    contentType: article ? "Article" : "Reference",
    pageTitle: slugFromPath(parsed.pathname) || domain,
    description: article
      ? `Article saved from ${domain}.`
      : `Saved reference from ${domain}.`,
    previewImage: null,
    accent: null,
    platform: article ? "article" : "generic",
  };
}

// Convenience: a soft gradient preview string based on the accent, so the
// card has a branded-looking backdrop when no previewImage exists.
export function gradientForPreview(preview) {
  if (!preview) return "linear-gradient(150deg, #1c1d24 0%, #0F1012 100%)";
  const { accent, platform } = preview;
  if (!accent) return "linear-gradient(150deg, #1c1d24 0%, #0F1012 100%)";
  // Blend the accent into a near-black base so cards stay dark-premium.
  return `linear-gradient(150deg, ${accent}22 0%, #14151b 70%, #0F1012 100%)`;
}
