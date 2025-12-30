/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Exclude large APK files from serverless function bundle
  experimental: {
    outputFileTracingIncludes: {
      '/api/apps': ['./private/apk/apps.json'],
      '/api/download': [], // Don't include APK files in bundle
    },
    outputFileTracingExcludes: {
      '*': [
        './public/apk/**/*.apk',
        './private/apk/**/*.apk',
        '**/*.apk',
      ],
    },
  },
  // Disable static optimization for large files
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

module.exports = nextConfig;
