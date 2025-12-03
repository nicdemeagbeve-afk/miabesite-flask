/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Enable static HTML export for Capacitor
  reactStrictMode: true, // Recommended for production
  webpack: (config) => {
    if (process.env.NODE_ENV === "development") {
      config.module.rules.push({
        test: /\.(jsx|tsx)$/,
        exclude: /node_modules/,
        enforce: "pre",
        use: "@dyad-sh/nextjs-webpack-component-tagger",
      });
    }
    return config;
  },
};

export default nextConfig;