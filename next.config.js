/** @type {import('next').NextConfig} */
const nextConfig = {
  // experimental: {
  //     serverActions: true,
  // },
  // webpack: (config, { isServer }) => {
  //     if (!isServer) {
  //         // Fixes npm packages that depend on `fs` module
  //         config.resolve.fallback = { fs: false };

  //         // Add support for .node files
  //         config.module.rules.push({
  //             test: /\.node$/,
  //             loader: "node-loader",
  //         });
  //     }

  //     return config;
  // },
  typescript: {
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eactStrictMode: false,
  experimental: {
    appDir: true,
    esmExternals: 'loose', // required to make Konva & react-konva work
    serverComponentsExternalPackages: [
      'puppeteer-extra',
      'puppeteer-extra-plugin-stealth', // required to make puppeteer plugins work
      'puppeteer-core',
      '@sparticuz/chromium',
    ],
  },
  webpack: (config) => {
    config.externals = [...config.externals, { canvas: 'canvas' }] // required to make Konva & react-konva work
    return config
  },
}

module.exports = nextConfig
