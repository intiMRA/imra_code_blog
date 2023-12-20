/** @type {import('next').NextConfig} */
const nextConfig = {
    basePath: "/imra_code_blog",
    output: "export",
    distDir: "out",
    images: {
        unoptimized: true
    }
  }
   
  module.exports = nextConfig