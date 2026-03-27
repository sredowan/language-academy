import Link from 'next/link';
import { ArrowRight, Clock, BookOpen, Star } from 'lucide-react';

export const metadata = {
  title: "Courses | Language Academy",
  description: "Browse our premium IELTS, PTE, and Spoken English courses.",
};

async function getCourses() {
  try {
    const res = await fetch('http://localhost:5000/api/public/courses', { 
      next: { revalidate: 60 } // Revalidate every 60 seconds (ISR)
    });
    if (!res.ok) {
      console.error('Failed to fetch courses:', res.statusText);
      return [];
    }
    return res.json();
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
}

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <div className="pt-32 pb-24 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Our Premium <span className="text-primary">Programs</span>
          </h1>
          <p className="text-lg text-slate-600">
            Expertly crafted courses designed to guarantee your success in PTE, IELTS, and Spoken English.
          </p>
        </div>

        {/* Filter Bar (Static for now) */}
        <div className="flex flex-wrap gap-4 justify-center mb-12">
          {['All Courses', 'PTE', 'IELTS', 'Spoken English'].map((filter, i) => (
            <button 
              key={filter} 
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${i === 0 ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-primary hover:text-primary'}`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Course Grid */}
        {courses.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
            <BookOpen className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No courses available right now</h3>
            <p className="text-slate-500">Please check back later or contact support.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100 group flex flex-col h-full">
                <div className="aspect-[4/3] bg-slate-200 relative overflow-hidden shrink-0">
                  <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-slate-800 uppercase tracking-wider shadow-sm">
                    {course.category}
                  </div>
                  <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-slate-900/80 backdrop-blur-sm rounded-full text-xs font-bold text-white uppercase shadow-sm">
                    {course.level || 'Beginner'}
                  </div>
                  <img 
                    src={course.image_url || '/pte_course_thumb.png'} 
                    alt={course.title} 
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" 
                  />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-slate-500 mb-6 line-clamp-3 flex-1">
                    {course.short_description || 'Join our expert-led course and achieve your target band score with dedicated support.'}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-slate-600 font-medium mb-6 pb-6 border-b border-slate-100 shrink-0">
                    <span className="flex items-center gap-1.5"><Clock size={16} className="text-primary/70" /> {course.duration_weeks ? `${course.duration_weeks} Weeks` : 'Self-paced'}</span>
                    <span className="flex items-center gap-1.5"><Star size={16} className="text-yellow-500" fill="currentColor" /> Premium</span>
                  </div>
                  
                  <div className="flex items-center justify-between shrink-0 mt-auto">
                    <div>
                      <span className="text-xs text-slate-500 font-medium block mb-0.5">Course Fee</span>
                      <span className="text-xl font-extrabold text-slate-900">৳{Number(course.base_fee).toLocaleString()}</span>
                    </div>
                    <Link 
                      href={`/courses/${course.slug || course.id}`} 
                      className="bg-primary/10 text-primary hover:bg-primary hover:text-white px-5 py-2.5 rounded-full font-semibold text-sm transition-colors flex items-center gap-2"
                    >
                      Details <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
