/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /** Required for Docker/App Runner: standalone output for smaller image */
  output: "standalone",
};

module.exports = nextConfig;
