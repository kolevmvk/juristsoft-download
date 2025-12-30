/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Exclude large APK files from serverless function bundle
  experimental: {
    outputFileTracingIncludes: {
      '/api/apps': ['./private/apk/apps/apps.json'],
      '/api/download': [], // Don't include APK files in bundle
      '/api/public-apk': [], // Don't include APK files in bundle
      '/api/apk': [], // Don't include APK files in bundle
    },
    outputFileTracingExcludes: {
      // Exclude APK files from ALL routes
      '*': [
        './public/apk/**/*.apk',
        './private/apk/**/*.apk',
        './private/apk/apps/**/*.apk',
        './private/apk/apps/jurist_qr_app/**/*.apk',
        './private/apk/apps/worker_app/**/*.apk',
        './public/apk/apps/**/*.apk',
        '**/*.apk',
        '**/*.APK',
      ],
    },
  },
  // Disable static optimization for large files
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Exclude APK directories from static file serving
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude APK files from server bundle
      config.externals = config.externals || [];
      config.externals.push({
        './public/apk': 'commonjs ./public/apk',
        './private/apk': 'commonjs ./private/apk',
      });
    }
    return config;
  },
};

module.exports = nextConfig;
