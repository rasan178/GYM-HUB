// Handle Chrome DevTools requests
export default function handler(req, res) {
  res.status(200).json({
    "version": "1.0",
    "name": "GYM-HUB DevTools",
    "description": "Development tools for GYM-HUB application",
    "capabilities": ["debugging", "profiling", "network-monitoring"]
  });
}
