const SITE_URL = "https://languageacademy.com.bd";

async function getCourses() {
  try {
    const res = await fetch("http://localhost:3000/api/public/courses", { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

async function getBlogs() {
  try {
    const res = await fetch("http://localhost:3000/api/public/blog", { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

export default async function sitemap() {
  const courses = await getCourses();
  const blogs = await getBlogs();

  const staticRoutes = [
    { url: `${SITE_URL}`, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/courses`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/enroll`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/materials`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  const courseRoutes = courses.map((course) => ({
    url: `${SITE_URL}/courses/${course.slug}`,
    lastModified: course.updated_at ? new Date(course.updated_at) : new Date(),
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  const blogRoutes = blogs.map((blog) => ({
    url: `${SITE_URL}/blog/${blog.slug}`,
    lastModified: blog.updated_at ? new Date(blog.updated_at) : new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...courseRoutes, ...blogRoutes];
}
