import React from 'react';
import { notFound } from 'next/navigation';
import { Calendar, User } from 'lucide-react';

async function getBlogDetails(slug) {
  try {
    const res = await fetch(`http://localhost:5000/api/public/blog/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('Failed to fetch data');
    }
    return res.json();
  } catch (error) {
    console.error('Error fetching blog:', error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const blog = await getBlogDetails(params.slug);
  if (!blog) return { title: 'Post Not Found' };
  return {
    title: `${blog.title} | Blog`,
    description: blog.excerpt,
  };
}

export default async function BlogDetailPage({ params }) {
  const blog = await getBlogDetails(params.slug);

  if (!blog) {
    notFound();
  }

  return (
    <div className="bg-slate-50 min-h-screen pt-32 pb-24">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <header className="mb-12 text-center">
          <div className="flex justify-center items-center gap-6 text-sm text-slate-500 font-medium mb-6">
            <span className="flex items-center gap-2"><Calendar size={16} className="text-primary"/> {new Date(blog.published_at || new Date()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span className="flex items-center gap-2"><User size={16} className="text-primary"/> Language Academy</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-8">
            {blog.title}
          </h1>

          <div className="aspect-[21/9] w-full bg-slate-200 rounded-3xl overflow-hidden relative shadow-lg">
            <img src={blog.image_url || '/hero_banner.png'} alt={blog.title} className="object-cover w-full h-full" />
          </div>
        </header>

        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 prose prose-lg prose-slate max-w-none">
          {/* Note: In a real implementation this would parse HTML string */}
          {blog.content ? (
            <div dangerouslySetInnerHTML={{ __html: blog.content }} />
          ) : (
            <p className="text-slate-600 leading-relaxed text-lg">
              Content is pending for this article. Please stay tuned as our editorial team is preparing valuable insights to share here.
            </p>
          )}
        </div>

      </article>
    </div>
  );
}
