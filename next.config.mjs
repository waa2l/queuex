/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // يسمح بتحميل الصور من أي مكان (للتسهيل حالياً)
      },
    ],
  },
};

export default nextConfig;
