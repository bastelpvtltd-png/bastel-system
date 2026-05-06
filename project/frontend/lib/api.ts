// ================================================================
// API URL Helper — Local සහ Render Production auto-detect කරනවා
// ================================================================
//
// ⚠️  RENDER BACKEND URL මෙතන ONLY edit කරන්න:
const RENDER_BACKEND_URL = "https://your-backend.onrender.com";
//
// Local run  (npm run dev / python app.py) → http://localhost:5000
// Render run (npm run build / npm start)  → RENDER_BACKEND_URL
// ================================================================

export function getApiUrl(): string {
  if (typeof window === "undefined") {
    // Server-side (Next.js build/SSR)
    return process.env.NODE_ENV === "production"
      ? RENDER_BACKEND_URL
      : "http://localhost:5000";
  }
  // Client-side — hostname බලලා decide
  const h = window.location.hostname;
  if (h === "localhost" || h === "127.0.0.1") {
    return "http://localhost:5000";
  }
  return RENDER_BACKEND_URL;
}
