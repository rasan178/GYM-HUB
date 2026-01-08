// backend/utils/publicUrl.js
// Helpers for generating/normalizing public URLs (esp. behind Render/Vercel proxies)

const stripTrailingSlashes = (s) => (s || "").replace(/\/+$/, "");

/**
 * Best-effort public base URL for this backend.
 * Priority:
 *  - PUBLIC_BASE_URL (recommended)
 *  - BASE_URL (legacy)
 *  - RENDER_EXTERNAL_URL (Render-provided, if available)
 *  - derived from request protocol/host
 */
function getPublicBaseUrl(req) {
  const env =
    process.env.PUBLIC_BASE_URL ||
    process.env.BASE_URL ||
    process.env.RENDER_EXTERNAL_URL;

  if (env) return stripTrailingSlashes(env);

  const forwardedProto = req?.headers?.["x-forwarded-proto"];
  const proto = (forwardedProto ? String(forwardedProto).split(",")[0] : req?.protocol || "http").trim();
  const host = req?.get?.("host");
  return stripTrailingSlashes(`${proto}://${host}`);
}

function makeUploadsUrl(req, uploadsPath) {
  const base = getPublicBaseUrl(req);
  const p = uploadsPath.startsWith("/") ? uploadsPath : `/${uploadsPath}`;
  return `${base}${p}`;
}

function normalizePublicUrl(value, req) {
  if (!value || typeof value !== "string") return value;

  // Data/blob URLs should pass through untouched
  if (value.startsWith("data:") || value.startsWith("blob:")) return value;

  // Frontend-local assets are expected to be relative
  if (value.startsWith("/images/")) return value;

  const base = getPublicBaseUrl(req);

  // Relative upload paths -> absolute
  if (value.startsWith("/uploads/")) return `${base}${value}`;
  if (value.startsWith("uploads/")) return `${base}/${value}`;

  // Absolute URL: try to fix common bad origins/protocols
  try {
    const url = new URL(value);

    // Replace localhost/127.0.0.1 with the real public base URL
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
      return `${base}${url.pathname}${url.search}${url.hash}`;
    }

    // Upgrade http -> https when backend is https (common mixed-content cause)
    if (url.protocol === "http:" && base.startsWith("https://")) {
      // If it's the same host as our public base URL, upgrade safely
      try {
        const baseHost = new URL(base).host;
        if (url.host === baseHost) {
          url.protocol = "https:";
          return url.toString();
        }
      } catch {
        // ignore
      }

      // Render domains support https; upgrade to avoid mixed content
      if (url.hostname.endsWith("onrender.com")) {
        url.protocol = "https:";
        return url.toString();
      }
    }

    return value;
  } catch {
    return value;
  }
}

function normalizePublicUrls(values, req) {
  if (!Array.isArray(values)) return values;
  return values.map((v) => normalizePublicUrl(v, req));
}

module.exports = {
  getPublicBaseUrl,
  makeUploadsUrl,
  normalizePublicUrl,
  normalizePublicUrls,
};

