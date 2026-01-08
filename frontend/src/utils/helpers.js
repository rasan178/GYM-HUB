export const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const formatTime = (time) => time || 'N/A';

export const calculateDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  return (eh * 60 + em) - (sh * 60 + sm);
};

export const getInitials = (title) => {
  if (!title) return "";

  const words = title.split(" ");
  let initials = "";

  for (let i = 0; i < Math.min(words.length, 2); i++) {
    initials += words[i][0];
  }

  return initials.toUpperCase();
};

// Returns YYYY-MM-DD in local time (no timezone shift)
export const getISODate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Add this to your utils/helpers.js file

/**
 * Check if a testimonial can be edited (within 10 days of creation)
 * @param {string|Date} createdAt - The creation date of the testimonial
 * @returns {boolean} - True if can edit, false otherwise
 */
export const canEditTestimonial = (createdAt) => {
  if (!createdAt) return false;
  
  const now = new Date();
  const created = new Date(createdAt);
  const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
  
  return diffDays <= 10;
};

/**
 * Get days remaining to edit a testimonial
 * @param {string|Date} createdAt - The creation date of the testimonial
 * @returns {number} - Days remaining (0 if expired)
 */
export const getDaysRemainingToEdit = (createdAt) => {
  if (!createdAt) return 0;
  
  const now = new Date();
  const created = new Date(createdAt);
  const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
  const remaining = 10 - diffDays;
  
  return remaining > 0 ? remaining : 0;
};

/**
 * Normalize image URLs coming from the API.
 * - Fixes stale/incorrect localhost URLs (common when data was created in dev)
 * - Optionally prefixes relative /uploads paths with NEXT_PUBLIC_API_URL
 */
export const normalizeImageUrl = (url) => {
  if (!url || typeof url !== "string") return url;

  // Local static assets served by Next.js
  if (url.startsWith("/images/")) return url;
  if (url.startsWith("data:") || url.startsWith("blob:")) return url;

  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) return url;

  // Relative uploads -> absolute
  if (url.startsWith("/uploads/")) return `${base}${url}`;
  if (url.startsWith("uploads/")) return `${base}/${url}`;

  // Replace localhost origin with the configured backend
  if (url.startsWith("http://localhost:5000/") || url.startsWith("http://127.0.0.1:5000/")) {
    return `${base}${url.replace(/^http:\/\/(localhost|127\.0\.0\.1):5000/, "")}`;
  }

  // Mixed content: if backend is https, upgrade obvious http URLs for same host
  if (base.startsWith("https://") && url.startsWith("http://")) {
    try {
      const u = new URL(url);
      const b = new URL(base);
      if (u.host === b.host || u.hostname.endsWith("onrender.com")) {
        u.protocol = "https:";
        return u.toString();
      }
    } catch {
      // ignore
    }
  }

  return url;
};