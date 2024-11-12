/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@radix-ui/react-select', '@radix-ui/react-tabs', 'recharts'],
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
  experimental: {
    optimizeCss: true, // Enable CSS optimization
    optimizePackageImports: ['@radix-ui/react-select', '@radix-ui/react-tabs']
  }
};

export default nextConfig;