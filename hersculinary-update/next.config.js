/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' }
    ]
  },
  experimental: {
    // Tanpa ini, Next.js bisa menampilkan halaman /admin, /pos, atau
    // /laporan dari cache navigasi di browser tanpa benar-benar meminta ke
    // server dulu -- akibatnya pengecekan password di middleware.js
    // terlewat saat pindah halaman lewat menu. staleTimes.dynamic = 0
    // memaksa setiap perpindahan halaman selalu dicek ulang ke server.
    staleTimes: {
      dynamic: 0
    }
  }
};

module.exports = nextConfig;
