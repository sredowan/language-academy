import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Calendar, CheckCircle2, Clock3, Globe2, MapPin, ShieldCheck, Sparkles, Star, TrendingUp, Users, Zap } from "lucide-react";
import BookingModalTrigger from "@/components/BookingModalTrigger";
import JsonLd, { courseSchema, breadcrumbSchema } from "@/components/JsonLd";
import { getApiBase } from "@/lib/api";

async function getCourseDetails(slug) {
  try {
    const res = await fetch(`${getApiBase()}/api/public/courses/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) { if (res.status === 404) return null; throw new Error("Failed"); }
    return res.json();
  } catch (error) { console.error("Error:", error); return null; }
}

function safeParse(value, fallback) {
  if (!value) return fallback;
  if (Array.isArray(value)) return value;
  try { return JSON.parse(value); } catch { return fallback; }
}

const thumbnails = { PTE: "/pte_course.png", IELTS: "/ielts_course.png", "Spoken English": "/hero_banner.png" };

export async function generateMetadata({ params }) {
  const course = await getCourseDetails(params.slug);
  if (!course) return { title: "Course Not Found" };

  const title = `${course.title} — Best ${course.category || "Language"} Course in Dhaka`;
  const description = course.short_description || course.description ||
    `Enroll in ${course.title} at Language Academy, the best PTE coaching centre in Bangladesh. Expert faculty, small batches, AI mock tests.`;

  return {
    title,
    description,
    alternates: { canonical: `https://languageacademy.com.bd/courses/${params.slug}` },
    openGraph: {
      title,
      description,
      url: `https://languageacademy.com.bd/courses/${params.slug}`,
      images: [{
        url: course.image_url || thumbnails[course.category] || "/hero_banner.png",
        width: 1200, height: 630,
        alt: `${course.title} at Language Academy Bangladesh`,
      }],
    },
  };
}

export default async function CourseDetailPage({ params }) {
  const course = await getCourseDetails(params.slug);
  if (!course) notFound();

  const outcomes = safeParse(course.what_you_will_learn, [
    "Master a clearer exam or communication strategy",
    "Practice with AI-scored mock tests and feedback loops",
    "Build confidence through structured, trainer-led learning",
    "Prepare with stronger accountability and support",
    "Develop time management and exam techniques",
    "Access premium study materials and practice banks",
  ]);

  const modules = safeParse(course.modules, [
    { title: "Orientation & Foundation", lessons: [{ title: "Program kickoff & assessment", duration: "60m" }, { title: "Core strategy setup", duration: "45m" }] },
    { title: "Core Skills Development", lessons: [{ title: "Targeted skill drills", duration: "90m" }, { title: "Practice sessions", duration: "60m" }] },
    { title: "Mock Tests & Review", lessons: [{ title: "Full-length mock test", duration: "120m" }, { title: "1-on-1 review session", duration: "45m" }] },
  ]);

  const courseImage = course.image_url || thumbnails[course.category] || "/hero_banner.png";

  const features = [
    { icon: Users, label: "Small Batch", desc: "Max 12 students" },
    { icon: Zap, label: "AI Mock Tests", desc: "Full-length practice" },
    { icon: ShieldCheck, label: "Certified Faculty", desc: "Pearson certified" },
    { icon: TrendingUp, label: "Progress Tracking", desc: "Weekly reports" },
    { icon: Globe2, label: "Online + Offline", desc: "Hybrid learning" },
    { icon: Star, label: "Premium Materials", desc: "Curated resources" },
  ];

  return (
    <>
      {/* Course schema — this is how AI search discovers and recommends individual courses */}
      <JsonLd data={courseSchema(course)} />
      <JsonLd data={breadcrumbSchema([
        { name: "Home", url: "https://languageacademy.com.bd" },
        { name: "Courses", url: "https://languageacademy.com.bd/courses" },
        { name: course.title, url: `https://languageacademy.com.bd/courses/${course.slug}` },
      ])} />
    <div className="pb-24">
      {/* Minimalistic Hero */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-16 md:pb-24 bg-slate-50 border-b border-slate-100">
        <div className="container-shell relative z-10">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-12 items-center">
            <div>
              <div className="flex flex-wrap gap-3 text-xs font-bold uppercase tracking-[0.2em] mb-6">
                <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-500 shadow-sm">{course.category}</span>
                <span className="rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-emerald-600 shadow-sm">{course.level || "All Levels"}</span>
              </div>
              <h1 className="text-balance text-4xl font-extrabold leading-[1.1] md:text-5xl lg:text-6xl text-slate-900 tracking-tight">{course.title}</h1>
              <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">{course.short_description || course.description || "A premium course designed for measurable improvement."}</p>
              <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-500 font-medium">
                <span className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm"><Clock3 size={18} className="text-emerald-500" />{course.duration_weeks ? `${course.duration_weeks} Weeks` : "Flexible"}</span>
                <span className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm"><Users size={18} className="text-emerald-500" />Max 12 per batch</span>
                <span className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm"><Star size={18} className="text-amber-400" fill="currentColor" />Premium Track</span>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="overflow-hidden rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 bg-white p-2">
                <img src={courseImage} alt={course.title} className="w-full aspect-[4/3] object-cover rounded-[1.5rem]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Grid */}
      <section>
        <div className="container-shell grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left Column */}
          <div className="space-y-8">
            {/* What's Included */}
            <div className="premium-panel p-8 md:p-10">
              <h2 className="text-2xl font-extrabold text-slate-900">What&apos;s Included</h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {features.map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="subtle-panel flex items-center gap-3 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon size={18} /></div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{label}</p>
                      <p className="text-xs text-slate-500">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Outcomes */}
            <div className="premium-panel p-8 md:p-10">
              <h2 className="text-2xl font-extrabold text-slate-900">What You&apos;ll Achieve</h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {outcomes.map((item, index) => (
                  <div key={`${item}-${index}`} className="subtle-panel flex items-start gap-3 p-4">
                    <CheckCircle2 className="mt-0.5 text-accent shrink-0" size={18} />
                    <span className="text-sm leading-7 text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Curriculum */}
            <div className="premium-panel p-8 md:p-10">
              <h2 className="text-2xl font-extrabold text-slate-900">Curriculum</h2>
              <div className="mt-6 space-y-3">
                {modules.map((module, index) => (
                  <details key={`${module.title}-${index}`} className="subtle-panel group overflow-hidden">
                    <summary className="flex cursor-pointer list-none items-center justify-between p-5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">{index + 1}</span>
                        <span className="text-base font-bold text-slate-900">{module.title}</span>
                      </div>
                      <span className="text-xs text-slate-400">{module.lessons?.length || 0} lessons</span>
                    </summary>
                    <div className="space-y-2 border-t border-slate-200 px-5 pb-5 pt-4">
                      {module.lessons?.map((lesson, li) => (
                        <div key={`${lesson.title}-${li}`} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                          <span>{lesson.title}</span>
                          <span className="text-xs text-slate-400">{lesson.duration || "45m"}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </div>

            {/* Trust */}
            <div className="premium-panel p-8 md:p-10">
              <h2 className="text-2xl font-extrabold text-slate-900">Why Students Trust This Course</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {["94% target score success rate", "Certified expert-led sessions", "AI-powered practice + feedback"].map((item) => (
                  <div key={item} className="subtle-panel p-5 text-center">
                    <CheckCircle2 className="mx-auto mb-3 text-accent" size={24} />
                    <p className="text-sm font-semibold leading-7 text-slate-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar (Sticky) */}
          <div className="space-y-6 lg:sticky lg:top-28 lg:self-start pt-10">
            {/* Pricing Card */}
            <div className="rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
              <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-6 -mt-6 h-24 w-24 rounded-full bg-white/10 blur-xl" />
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">One-Time Fee</p>
                <p className="mt-2 text-5xl font-extrabold tracking-tight">৳{Number(course.base_fee || 0).toLocaleString()}</p>
                <p className="mt-3 text-sm text-white/60">Includes all materials and mock tests</p>
              </div>
              <div className="p-8">
                <div className="flex flex-col gap-3">
                  <Link href={`/enroll?course=${course.slug}`} className="primary-btn w-full justify-center">Enroll Now <ArrowRight size={18} /></Link>
                  <BookingModalTrigger courseInterest={course.id} />
                </div>
                <div className="mt-8 space-y-4 border-t border-slate-100 pt-6 text-sm font-medium text-slate-600">
                  <div className="flex items-center gap-3"><ShieldCheck size={18} className="text-emerald-500" />Secure enrollment online</div>
                  <div className="flex items-center gap-3"><Sparkles size={18} className="text-emerald-500" />Premium faculty support</div>
                  <div className="flex items-center gap-3"><TrendingUp size={18} className="text-emerald-500" />Progress tracking dashboard</div>
                </div>
              </div>
            </div>

            {/* Batches */}
            <div className="premium-panel p-7">
              <h3 className="text-xl font-extrabold text-slate-900">Upcoming Batches</h3>
              <div className="mt-5 space-y-3">
                {course.Batches && course.Batches.length > 0 ? (
                  course.Batches.map((batch) => (
                    <div key={batch.id} className="subtle-panel p-4">
                      <p className="font-bold text-slate-900">{batch.name}</p>
                      <div className="mt-2 space-y-1.5 text-sm text-slate-600">
                        <div className="flex items-center gap-2"><Calendar size={14} className="text-primary" />Starts: {new Date(batch.start_date).toLocaleDateString()}</div>
                        <div className="flex items-center gap-2"><Clock3 size={14} className="text-primary" />{batch.schedule}</div>
                        {batch.capacity && batch.enrolled !== undefined && (
                          <div className="mt-2">
                            <div className="flex justify-between text-xs mb-1">
                              <span>{batch.capacity - (batch.enrolled || 0)} seats left</span>
                              <span>{batch.enrolled || 0}/{batch.capacity}</span>
                            </div>
                            <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                              <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${((batch.enrolled || 0) / batch.capacity) * 100}%` }} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="subtle-panel p-4 text-sm leading-7 text-slate-600">No upcoming batches listed. Contact us for the latest admission window.</div>
                )}
              </div>
            </div>

            {/* Faculty */}
            <div className="premium-panel p-7">
              <h3 className="text-xl font-extrabold text-slate-900">Faculty</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {course.instructor_name ? `${course.instructor_name} leads this track with guided strategy and focused support.` : "Delivered by our certified academic faculty with premium coaching support."}
              </p>
              {course.instructor_bio && <p className="mt-2 text-sm leading-7 text-slate-500">{course.instructor_bio}</p>}
            </div>

            {/* Campus */}
            <div className="premium-panel p-7">
              <h3 className="text-xl font-extrabold text-slate-900">Campus & Mode</h3>
              <div className="mt-3 flex items-start gap-3 text-sm leading-7 text-slate-600">
                <MapPin size={18} className="mt-1 text-emerald-500 shrink-0" />
                <span>Available at our Dhanmondi campus (SEL SUFI SQUARE), with online support options.</span>
              </div>
              <BookingModalTrigger buttonText="Talk to an Advisor" className="secondary-btn mt-5 w-full justify-center" courseInterest={course.id} />
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
