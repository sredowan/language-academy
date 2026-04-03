import React from "react";
import Link from "next/link";
import {
  ArrowRight, Award, BookOpen, Building2, Calendar, CheckCircle2,
  ChevronDown, Clock3, Globe2, GraduationCap, HeadphonesIcon,
  Laptop, MapPin, Mic, PenTool, Play, ShieldCheck, Sparkles, Star,
  Target, TrendingUp, Users, Zap,
} from "lucide-react";
import HomepageClient from "./HomepageClient";

async function getFeaturedCourses() {
  try {
    const res = await fetch("http://localhost:3000/api/public/courses", { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.slice(0, 6);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return [];
  }
}

async function getRecentBlogs() {
  try {
    const res = await fetch("http://localhost:3000/api/public/blog", { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.slice(0, 3);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return [];
  }
}

export default async function Home() {
  const featuredCourses = await getFeaturedCourses();
  const recentBlogs = await getRecentBlogs();

  return <HomepageClient courses={featuredCourses} blogs={recentBlogs} />;
}
