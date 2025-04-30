/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "res.cloudinary.com",
            },
        ],
    },
    async rewrites() {
        return [
            {
                source: "/api/v1/:path*",
                destination: "https://instagram-clone-backend-a9xc.onrender.com/api/v1/:path*", // proxy to Express
            },
        ];
    },
};

export default nextConfig;
