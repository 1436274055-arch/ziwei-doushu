/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['lunar-javascript'],
  // Cloudflare Pages 兼容
  output: 'standalone',
  experimental: {
    // 禁用 Turbopack（Cloudflare Pages 不支持）
  },
};

module.exports = nextConfig;
