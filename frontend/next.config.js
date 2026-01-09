const backendUrl = process.env.NEXT_PUBLIC_API_URL;
let backendPattern = {
  protocol: 'http',
  hostname: 'localhost',
  port: '5000',
  pathname: '/uploads/**',
};

if (backendUrl) {
  try {
    const u = new URL(backendUrl);
    backendPattern = {
      protocol: u.protocol === 'https:' ? 'https' : 'http',
      hostname: u.hostname,
      pathname: '/uploads/**',
      ...(u.port ? { port: u.port } : {}),
    };
  } catch {
    // ignore; keep localhost defaults
  }
}

module.exports = {
  images: {
    remotePatterns: [
      backendPattern,
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
    ],
  },
  // Optimize development server
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Reduce webpack warnings in development
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
      
      // Suppress webpack hot-update warnings
      config.ignoreWarnings = [
        /Failed to parse source map/,
        /webpack\.hot-update\.json/,
      ];
    }
    return config;
  },
  // Suppress specific warnings
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
  // Reduce Fast Refresh warnings
  experimental: {
    optimizeCss: false,
  },
  // Custom headers to handle specific requests
  async headers() {
    return [
      {
        source: '/_next/static/webpack/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/.well-known/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600',
          },
        ],
      },
    ];
  },
};