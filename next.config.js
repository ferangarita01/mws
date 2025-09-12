const path = require("path")

module.exports = {
  webpack: (config) => {
    config.resolve.alias["@"] = path.resolve(__dirname, "src")
    return config
  },
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
    ],
  },
}

module.exports = nextConfig