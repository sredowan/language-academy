"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, Loader2, ShieldCheck } from 'lucide-react';

function CheckoutForm() {
  const searchParams = useSearchParams();
  const initialCourseId = searchParams.get('course') || '';

  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    course_id: initialCourseId,
    batch_id: '',
    name: '',
    email: '',
    phone: '',
    dob: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(searchParams.get('error'));

  // Fetch available courses for the dropdown
  useEffect(() => {
    fetch('http://localhost:5000/api/public/courses')
      .then(res => res.json())
      .then(data => setCourses(data))
      .catch(err => console.error('Failed to load courses', err));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Payment initiation failed');
      }

      // Redirect to SSLCommerz Gateway
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-24 min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Secure Enrollment</h1>
          <p className="mt-2 text-slate-500">Fill out your details to complete your registration.</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-medium text-center">
            {error === 'payment_failed' ? 'The payment process failed or was declined. Please try again.' : 
             error === 'payment_cancelled' ? 'You cancelled the payment process. You can resume below.' : 
             error}
          </div>
        )}

        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 p-6 md:p-10 border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Select Course</label>
                <select 
                  name="course_id" 
                  value={formData.course_id} 
                  onChange={handleChange} 
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-slate-50 text-slate-900"
                >
                  <option value="">-- Choose a course --</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title} - ৳{c.base_fee}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Preferred Batch</label>
                <select 
                  name="batch_id" 
                  value={formData.batch_id} 
                  onChange={handleChange} 
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-slate-50 text-slate-900"
                >
                  <option value="">-- Choose batch --</option>
                  {/* Ideally, load batches dynamically based on selected course, using hardcoded for demo mapping fallback */}
                  <option value="1">Upcoming Weekend (Sat/Sun)</option>
                  <option value="2">Upcoming Weekday (Tue/Thu)</option>
                </select>
              </div>
            </div>

            <hr className="border-slate-100 my-8" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-slate-50 text-slate-900"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required
                  placeholder="e.g. john@email.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-slate-50 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                <input 
                  type="tel" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  required
                  placeholder="01XXXXXXXXX"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-slate-50 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Date of Birth</label>
                <input 
                  type="date" 
                  name="dob" 
                  value={formData.dob} 
                  onChange={handleChange} 
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-slate-50 text-slate-900 cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-6">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-primary/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Proceed to Payment (SSLCommerz)'} 
                {!loading && <ArrowRight size={20} />}
              </button>
            </div>
            
            <div className="flex justify-center items-center gap-2 mt-4 text-xs text-slate-400 font-medium">
              <ShieldCheck size={14} className="text-green-500" />
              <span>256-bit encrypted checkout. We do not store your card details.</span>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}

// Wrap in Suspense for Next.js App Router useSearchParams requirements
export default function EnrollPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center pt-32"><Loader2 className="animate-spin text-primary" size={32} /></div>}>
      <CheckoutForm />
    </Suspense>
  );
}
