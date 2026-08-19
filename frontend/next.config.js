/** @type {import('next').NextConfig} */
const path = require("path");
const { version } = require("./package.json");

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  skipWaiting: true,
  clientsClaim: true,
  reloadOnOnline: false,
  runtimeCaching: [
    {
      urlPattern: /^\/_next\/data\/.*/,
      handler: "NetworkOnly",
    },
    {
      urlPattern: /^https?.*/,
      handler: "NetworkOnly",
    },
  ],
});

module.exports = withPWA({
  transpilePackages: [
    "@uiw/react-md-editor",
    "@uiw/react-markdown-preview",
    "jose",
    "jwt-decode",
  ],
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname),
  images: {
    unoptimized: true,
  },
  env: {
    VERSION: version,
  },
});
