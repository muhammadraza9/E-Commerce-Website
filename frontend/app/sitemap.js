export default function sitemap() {
  const baseUrl =
   process.env.NEXT_PUBLIC_API_URL || "https://e-commerce-backend-mauve-psi.vercel.app/api";

  const routes = [
    "",
    "/products",
    "/about",
    "/contact",
    "/track-order",
    "/signin",
    "/signup",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.8,
  }));
}