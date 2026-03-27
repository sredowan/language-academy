"use client";

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      const res = await fetch('http://localhost:5000/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) throw new Error('Failed to submit form');
      
      setStatus('success');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMessage('There was a problem sending your message. Please try calling us instead.');
    }
  };

  return (
    <div className="pt-32 pb-24 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Get in <span className="text-primary">Touch</span>
          </h1>
          <p className="text-lg text-slate-600">
            Have questions about our courses or need help with enrollment? Our team is here to help you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">Head Office</h3>
                <p className="text-sm text-slate-600">House 42, Road 11, Block F, Banani<br/>Dhaka 1213, Bangladesh</p>
              </div>
            </div>
            
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 shrink-0">
                <Phone size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">Phone Number</h3>
                <p className="text-sm text-slate-600">+880 1711 000 000<br/>+880 1911 000 000</p>
              </div>
            </div>

            <div className="bg-slate-900 rounded-[2rem] p-8 shadow-xl text-white flex items-start gap-4 border border-slate-800">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white shrink-0">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="font-bold mb-1">Email Address</h3>
                <p className="text-sm text-slate-300">support@languageacademy.com<br/>info@languageacademy.com</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Send us a message</h2>
              
              {status === 'success' ? (
                <div className="bg-green-50 rounded-2xl p-8 border border-green-100 text-center">
                  <CheckCircle2 className="mx-auto text-green-500 w-16 h-16 mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Message Sent!</h3>
                  <p className="text-slate-600 mb-6">Thank you for reaching out. We will get back to you within 24 hours.</p>
                  <button onClick={() => setStatus('idle')} className="text-primary font-bold hover:underline">Send another message</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {status === 'error' && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
                      {errorMessage}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Your Name</label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-slate-50" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Your Email</label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-slate-50" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-slate-50" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Subject</label>
                      <input type="text" name="subject" value={formData.subject} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-slate-50" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Message</label>
                    <textarea name="message" value={formData.message} onChange={handleChange} required rows={4} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-slate-50 resize-none"></textarea>
                  </div>

                  <button type="submit" disabled={status === 'loading'} className="bg-primary hover:bg-primary/90 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-primary/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                    {status === 'loading' ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />} 
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
