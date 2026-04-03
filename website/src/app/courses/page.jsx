import CoursesPageClient from "./CoursesPageClient";

export const metadata = {
  title: "Courses | Language Academy — PTE, IELTS & Spoken English Programs",
  description: "Explore premium PTE Academic, IELTS preparation, and Spoken English programs at Language Academy. Expert faculty, small batches, 94% success rate.",
};

async function getCourses() {
  try {
    const res = await fetch("http://localhost:3000/api/public/courses", { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Error fetching courses:", error);
    return [];
  }
}

export default async function CoursesPage() {
  const courses = await getCourses();
  return <CoursesPageClient initialCourses={courses} />;
}
