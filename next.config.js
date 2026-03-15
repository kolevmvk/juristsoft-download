/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Exclude large APK files from serverless function bundle
  experimental: {
    outputFileTracingIncludes: {
      '/api/apps': ['./private/apk/apps/apps.json'],
      '/api/download': [],
      '/api/public-apk': [],
    },
    outputFileTracingExcludes: {
      '*': ['./private/apk/**/*.apk', './private/apk/**/*.APK'],
    },
    turbopack: {},
  },
  // Disable static optimization for large files
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Exclude APK directories from server bundle (but allow static serving from public/)
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude private APK files from server bundle
      // public/apk/** is served statically, so don't externalize it
      config.externals = config.externals || [];
      config.externals.push({
        './private/apk': 'commonjs ./private/apk',
      });
    }
    return config;
  },
};

module.exports = nextConfig;
