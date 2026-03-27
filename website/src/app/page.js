"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Star, Users, BookOpen, Clock } from 'lucide-react';

export default function Home() {
  const [courses, setCourses] = useState([]);
  
  // Mock fetch - later this will call the real /api/public/courses
  useEffect(() => {
    setCourses([
      { id: 1, title: 'PTE Academic Masterclass', category: 'PTE', fee: '15,000 BDT', duration: '8 Weeks', image: '/pte_course_thumb.png', slug: 'pte-masterclass' },
      { id: 2, title: 'IELTS Intensive Crash Course', category: 'IELTS', fee: '12,500 BDT', duration: '6 Weeks', image: '/pte_course_thumb.png', slug: 'ielts-crash' },
      { id: 3, title: 'Spoken English Foundation', category: 'Spoken', fee: '8,000 BDT', duration: '12 Weeks', image: '/pte_course_thumb.png', slug: 'spoken-foundation' }
    ]);
  }, []);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="flex flex-col min-h-screen w-full overflow-hidden">
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-slate-50">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 rounded-bl-[100px] -z-10 blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary mb-6 text-sm font-semibold">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Bangladesh's #1 PTE Coaching
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
                Master English. <br />
                Unlock the <span className="text-gradient">World.</span>
              </h1>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-lg">
                Achieve your target score in PTE and IELTS with proven strategies, AI-powered mock tests, and expert guidance.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/courses" className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-full font-semibold text-center transition-all shadow-lg hover:shadow-primary/30 flex items-center justify-center gap-2">
                  Explore Courses <ArrowRight size={20} />
                </Link>
                <Link href="/contact" className="bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 px-8 py-4 rounded-full font-semibold text-center transition-all inline-flex items-center justify-center">
                  Book Free Consultation
                </Link>
              </div>
              
              <div className="mt-10 flex items-center gap-4 text-sm text-slate-500 font-medium">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />
                  ))}
                </div>
                <div>Over <strong className="text-slate-800">5,000+</strong> successful students</div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative"
            >
              <div className="relative w-full aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl">
                {/* Fallback color while image loads */}
                <div className="absolute inset-0 bg-slate-200/50" />
                <img 
                  src="/hero_banner.png" 
                  alt="Language Academy Classroom"
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                
                {/* Floating Badge */}
                <div className="absolute bottom-6 left-6 glass rounded-2xl p-4 flex items-center gap-4 animate-float shadow-lg">
                  <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center text-yellow-900">
                    <Star size={24} fill="currentColor" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white">4.9/5</div>
                    <div className="text-xs text-white/80 font-medium">Google Reviews</div>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-100">
            {[
              { label: 'Enrolled Students', value: '5K+', icon: Users },
              { label: 'Target Score Rate', value: '94%', icon: Star },
              { label: 'Active Courses', value: '12+', icon: BookOpen },
              { label: 'Years Experience', value: '8+', icon: Clock },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center px-4"
              >
                <stat.icon className="mx-auto h-8 w-8 text-primary mb-3 opacity-80" />
                <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">{stat.value}</div>
                <div className="text-sm font-medium text-slate-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Courses */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-base text-primary font-semibold tracking-wide uppercase mb-2">Our Programs</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Find the perfect course for you
            </p>
            <p className="mt-4 max-w-2xl text-lg text-slate-500 mx-auto">
              Expert-led courses designed to help you achieve your desired band score quickly and efficiently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, i) => (
              <motion.div 
                key={course.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100 group"
              >
                <div className="aspect-[4/3] bg-slate-200 relative overflow-hidden">
                  <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-slate-800 shadow-sm">
                    {course.category}
                  </div>
                  <img src={course.image} alt={course.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">{course.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-6 pb-6 border-b border-slate-100">
                    <span className="flex items-center gap-1"><Clock size={16} /> {course.duration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-500 font-medium block">Course Fee</span>
                      <span className="text-lg font-bold text-slate-900">{course.fee}</span>
                    </div>
                    <Link href={`/courses/${course.slug}`} className="text-primary hover:text-primary/80 font-semibold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      View Details <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Link href="/courses" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-primary bg-primary/10 hover:bg-primary/20 transition-colors">
              View All Courses
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeIn}>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl mb-6">
                Why thousands of students trust <span className="text-primary">Language Academy</span>
              </h2>
              <p className="text-lg text-slate-500 mb-8">
                We don't just teach English; we equip you with the exact strategies and confidence needed to ace your exam on the first attempt.
              </p>
              
              <div className="space-y-6">
                {[
                  "Pearson Certified Expert Trainers",
                  "AI-Powered Smart Mock Test Portal",
                  "Small Batch Sizes for Personal Attention",
                  "Flexible Schedule (Weekly & Weekend Datches)"
                ].map((feature, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="shrink-0 mt-1">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle2 size={16} className="text-green-600" />
                      </div>
                    </div>
                    <p className="text-base font-medium text-slate-700">{feature}</p>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative rounded-[2rem] bg-slate-100 p-8 sm:p-12"
            >
              <div className="absolute top-0 right-0 -m-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 -m-4 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />
              
              <div className="relative z-10 glass rounded-2xl p-6 mb-6 shadow-sm border border-white">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
                    <img src="/instructor_avatar.png" alt="Instructor" className="object-cover w-full h-full" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Mr. Ahmed</h4>
                    <p className="text-xs text-slate-500">Lead PTE Instructor (90/90 Scorer)</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 italic">"Our goal is simple: your success. We break down the algorithm so you know exactly what the computer wants."</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-slate-900 py-20 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-b from-primary/20 to-transparent rounded-full blur-3xl opacity-50 transform rotate-12" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl mb-6">
            Ready to achieve your target score?
          </h2>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Join the next batch and get access to our premium materials and AI practice portal immediately.
          </p>
          <div className="flex justify-center gap-4">
             <Link href="/enroll" className="bg-white hover:bg-slate-50 text-slate-900 px-8 py-4 rounded-full font-bold text-lg transition-all shadow-xl hover:shadow-white/20">
              Enroll Now
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
