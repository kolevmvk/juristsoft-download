/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    outputFileTracingIncludes: {
      '/api/apps': ['./private/apk/**'],
      '/api/download': ['./private/apk/**'],
    },
  },
};

module.exports = nextConfig;
