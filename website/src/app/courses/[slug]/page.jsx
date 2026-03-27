import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PlayCircle, CheckCircle2, Clock, MapPin, Calendar, Star, Users, ArrowRight } from 'lucide-react';

async function getCourseDetails(slug) {
  try {
    const res = await fetch(`http://localhost:5000/api/public/courses/${slug}`, { 
      next: { revalidate: 60 } 
    });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('Failed to fetch data');
    }
    return res.json();
  } catch (error) {
    console.error('Error fetching course:', error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const course = await getCourseDetails(params.slug);
  if (!course) return { title: 'Course Not Found' };
  return {
    title: `${course.title} | Language Academy`,
    description: course.short_description || `Enroll in ${course.title} today.`,
  };
}

export default async function CourseDetailPage({ params }) {
  const course = await getCourseDetails(params.slug);

  if (!course) {
    notFound();
  }

  // Parse JSON data safely
  const whatYouWillLearn = typeof course.what_you_will_learn === 'string' 
    ? JSON.parse(course.what_you_will_learn) 
    : (course.what_you_will_learn || [
        "Master the complete scoring algorithm",
        "Practice with AI-powered mock tests",
        "Personalized feedback on Speaking & Writing",
        "Strategies to boost your score by 10-15 points"
      ]);
      
  const modules = typeof course.modules === 'string'
    ? JSON.parse(course.modules)
    : (course.modules || [
      { title: "Introduction & Strategy", lessons: [{title: "Understanding the Exam Format", duration: "1h 30m"}] },
      { title: "Speaking & Writing", lessons: [{title: "Read Aloud Mastery", duration: "2h"}, {title: "Essay Templates", duration: "1h 45m"}] }
    ]);

  return (
    <div className="bg-slate-50 min-h-screen pt-24 pb-20">
      
      {/* Hero Section */}
      <section className="bg-slate-900 text-white pt-16 pb-24 md:pt-24 md:pb-32 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={course.image_url || '/hero_banner.png'} 
            className="w-full h-full object-cover opacity-20" 
            alt={course.title} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-primary/20 text-primary-foreground text-xs font-bold uppercase tracking-wider rounded-full">
                {course.category}
              </span>
              <span className="px-3 py-1 bg-white/10 text-white text-xs font-bold uppercase tracking-wider rounded-full">
                {course.level || 'Beginner'}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
              {course.title}
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl leading-relaxed">
              {course.short_description || course.description || 'Join thousands of successful students and achieve your target band score with our premium coaching.'}
            </p>
            
            <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-slate-300">
              <div className="flex items-center gap-2">
                <Clock className="text-primary" size={20} />
                <span>{course.duration_weeks ? `${course.duration_weeks} Weeks` : 'Self-paced'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="text-primary" size={20} />
                <span>Small Batch Size</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="text-yellow-400" fill="currentColor" size={20} />
                <span className="text-white font-bold inline-flex items-center gap-1">4.9 <span className="text-slate-400 font-normal">(120+ Reviews)</span></span>
              </div>
            </div>
          </div>

          <div className="hidden lg:block">
            {/* Empty space for desktop layout alignment since sidebar pulls up */}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 md:-mt-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Details & Syllabus */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Instructor / Video */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">About the Course</h2>
              <div className="aspect-video bg-slate-100 rounded-2xl overflow-hidden relative mb-8 flex items-center justify-center group cursor-pointer border shadow-inner">
                {/* Normally an iframe embed for course.instructor_video_url */}
                <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/20 transition-colors" />
                <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-lg z-10">
                  <PlayCircle size={32} />
                </div>
                <img src={course.image_url || '/pte_course_thumb.png'} className="absolute inset-0 w-full h-full object-cover -z-10" alt="Video cover" />
              </div>
              
              <div className="prose prose-slate max-w-none text-slate-600">
                <p>{course.description}</p>
              </div>

              {course.instructor_name && (
                <div className="mt-8 pt-8 border-t border-slate-100 flex items-start gap-4">
                  <img src="/instructor_avatar.png" alt={course.instructor_name} className="w-16 h-16 rounded-full object-cover bg-slate-200" />
                  <div>
                    <h4 className="font-bold text-slate-900">Your Instructor: {course.instructor_name}</h4>
                    <p className="text-sm text-slate-500 mt-1">{course.instructor_bio}</p>
                  </div>
                </div>
              )}
            </div>

            {/* What you'll learn */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">What you'll learn</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {whatYouWillLearn.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={20} />
                    <span className="text-slate-600 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Curriculum */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Course Curriculum</h2>
              <div className="space-y-4">
                {modules.map((mod, i) => (
                  <details key={i} className="group border border-slate-200 rounded-2xl bg-slate-50/50 [&_summary::-webkit-details-marker]:hidden">
                    <summary className="flex items-center justify-between p-4 md:p-5 cursor-pointer font-bold text-slate-800">
                      <span>Module {i + 1}: {mod.title}</span>
                      <span className="transition group-open:rotate-180">
                        <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" w="24"><polyline points="6 9 12 15 18 9"></polyline></svg>
                      </span>
                    </summary>
                    <div className="px-4 pb-4 md:px-5 md:pb-5 text-slate-600 space-y-3 pt-2 border-t border-slate-100">
                      {mod.lessons?.map((lesson, j) => (
                        <div key={j} className="flex items-center justify-between py-2 text-sm bg-white px-4 rounded-xl border border-slate-100 shadow-sm">
                          <div className="flex items-center gap-3">
                            <PlayCircle size={16} className="text-slate-400" />
                            <span className="font-medium">{lesson.title}</span>
                          </div>
                          <span className="text-slate-400 text-xs font-mono">{lesson.duration || '45m'}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Sticky Enrollment Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -z-0" />
                
                <div className="relative z-10">
                  <div className="mb-6">
                    <span className="text-sm font-semibold text-slate-500 block mb-1">Course Fee</span>
                    <div className="flex items-baseline gap-2">
                      <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">৳{Number(course.base_fee).toLocaleString()}</h2>
                      <span className="text-sm text-slate-500 line-through">৳{(Number(course.base_fee) + 2000).toLocaleString()}</span>
                    </div>
                  </div>

                  <Link 
                    href={`/enroll?course=${course.id}`} 
                    className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-primary/30 mb-4"
                  >
                    Enroll Now <ArrowRight size={20} />
                  </Link>

                  <p className="text-xs text-center text-slate-500 mb-8">
                    Secure checkout via SSLCommerz. 14-day money-back guarantee.
                  </p>

                  <div className="border-t border-slate-100 pt-6">
                    <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Upcoming Batches</h4>
                    {course.Batches && course.Batches.length > 0 ? (
                      <div className="space-y-3">
                        {course.Batches.map(batch => (
                          <label key={batch.id} className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:border-primary cursor-pointer transition-colors group">
                            <input type="radio" name="batch" className="mt-1" defaultChecked={course.Batches[0].id === batch.id} />
                            <div>
                              <div className="font-semibold text-sm text-slate-800 group-hover:text-primary">{batch.name}</div>
                              <div className="text-xs text-slate-500 mt-1 flex items-center gap-1"><Calendar size={12}/> Starts: {new Date(batch.start_date).toLocaleDateString()}</div>
                              <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1"><Clock size={12}/> {batch.schedule}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-yellow-600 bg-yellow-50 p-4 rounded-xl">
                        No upcoming batches found. Please contact administration.
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-8 bg-slate-50 rounded-xl p-4 flex items-start gap-3">
                    <MapPin className="text-slate-400 shrink-0 mt-0.5" size={20} />
                    <div>
                      <h5 className="text-sm font-bold text-slate-800">Physical Classes</h5>
                      <p className="text-xs text-slate-500 mt-1">Available at our Banani and Dhanmondi branches.</p>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
