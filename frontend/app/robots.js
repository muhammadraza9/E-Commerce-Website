export default function robots() {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL || "https://e-commerce-backend-mauve-psi.vercel.app/api";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}