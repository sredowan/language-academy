import Link from 'next/link';
import { ArrowRight, Calendar, User } from 'lucide-react';

export const metadata = {
  title: "Blog | Language Academy",
  description: "Read the latest tips, tricks, and success stories for PTE and IELTS.",
};

async function getBlogs() {
  try {
    const res = await fetch('http://localhost:5000/api/public/blog', { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return [];
  }
}

export default async function BlogListingPage() {
  const blogs = await getBlogs();

  return (
    <div className="pt-32 pb-24 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Language Academy <span className="text-primary">Blog</span>
          </h1>
          <p className="text-lg text-slate-600">
            Insights, strategies, and updates to help you ace your English proficiency exams.
          </p>
        </div>

        {blogs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
            <h3 className="text-lg font-medium text-slate-900">No articles published yet</h3>
            <p className="text-slate-500">Check back soon for expert tips and tricks.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <div key={blog.id} className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100 flex flex-col h-full group">
                <div className="aspect-[16/9] bg-slate-200 relative overflow-hidden shrink-0">
                  <img src={blog.image_url || '/pte_course_thumb.png'} alt={blog.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6 md:p-8 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-primary transition-colors line-clamp-2">
                    <Link href={`/blog/${blog.slug}`}>{blog.title}</Link>
                  </h3>
                  <p className="text-slate-600 mb-6 line-clamp-3 text-sm flex-1">
                    {blog.excerpt || 'Read this article to discover valuable insights and strategies.'}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium pt-6 border-t border-slate-100 shrink-0">
                    <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(blog.published_at || new Date()).toLocaleDateString()}</span>
                    <Link href={`/blog/${blog.slug}`} className="text-primary hover:text-primary/80 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Read More <ArrowRight size={14} />
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
