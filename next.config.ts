import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 禁用开发环境指示器
  devIndicators: false,
  // 生产环境配置
  reactStrictMode: true,
};

export default nextConfig;
