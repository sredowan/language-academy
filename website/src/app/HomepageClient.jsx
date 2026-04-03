"use client";

import Link from "next/link";
import {
  ArrowRight, BookOpen, Check, CheckCircle2, ChevronDown, Clock3,
  GraduationCap, Mic, PenTool, Target, Users, PhoneCall
} from "lucide-react";
import AnimateOnScroll, { StaggerContainer, StaggerItem } from "@/components/AnimateOnScroll";
import CourseCard from "@/components/CourseCard";
import BookingFormInline from "@/components/BookingFormInline";
import BookingModal from "@/components/BookingModal";
import { useState } from "react";

/* ─── Static Data ─────────────────────────────────────────────── */
const faqs = [
  ["What skills are tested in the PTE Listening section?", "Identifying key information from spoken audio clips, understanding different English accents, accurate note-taking under time pressure, identifying errors in spoken content, writing from dictation, and selecting the most appropriate summary."],
  ["How do I choose the right course?", "Start with a free consultation. Our academic advisors assess your current level, timeline, and target score to recommend the perfect course and batch for you."],
  ["Do you offer flexible schedules?", "Yes. We run weekday morning, afternoon, and weekend batches so you can fit serious preparation into your busy routine."],
  ["Is mock test support included?", "Absolutely. All courses include AI-scored full-length mock tests, detailed analytics, and trainer-led review sessions."],
  ["What is the class size?", "We maintain a maximum of 12 students per cohort to ensure personalized attention, stronger accountability, and faster improvement."],
];

export default function HomepageClient({ courses, blogs }) {
  const [openFaq, setOpenFaq] = useState(0);
  const [openFormatFaq, setOpenFormatFaq] = useState(0);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingInterest, setBookingInterest] = useState("");

  const handleBook = (interest = "") => {
    setBookingInterest(interest);
    setIsBookingOpen(true);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* ═══════ 1. HERO SECTION (IMG 1) ═══════ */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden bg-slate-50/50">
        <div className="container-shell">
          <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr] items-center">
            <AnimateOnScroll variant="slide-left">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-blue-100/60 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary shadow-sm mb-6">
                  BANGLADESH&apos;S TRUSTED LANGUAGE INSTITUTE
                </span>
                
                <h1 className="text-balance text-4xl font-extrabold leading-[1.15] text-slate-900 sm:text-5xl lg:text-[3.5rem] tracking-tight">
                  Best IELTS, PTE & <br className="hidden md:block"/>
                  Spoken English <br className="hidden md:block"/>
                  Classes in Bangladesh
                </h1>
                
                <p className="mt-6 text-lg leading-relaxed text-slate-600 max-w-xl">
                  Language Academy Bangladesh helps students and professionals improve their English proficiency for higher education, migration, career growth, and global opportunities. Learn from expert instructors through structured classes, mock tests, and practical speaking sessions.
                </p>
                
                {/* Topic Pills */}
                <div className="mt-8 flex flex-wrap gap-3">
                  {["IELTS Preparation", "PTE Coaching", "Spoken English", "Study Abroad Support"].map(pill => (
                    <span key={pill} className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-primary shadow-sm">
                      {pill}
                    </span>
                  ))}
                </div>

                <div className="mt-10 flex flex-col sm:flex-row gap-4">
                  <button onClick={() => handleBook()} className="primary-btn px-8 py-4 shadow-xl shadow-primary/20 bg-primary">
                    Book a Free Consultation
                  </button>
                  <Link href="/courses" className="secondary-btn border-primary text-primary hover:bg-primary/5 px-8 py-4">
                    Explore Courses
                  </Link>
                </div>
              </div>
            </AnimateOnScroll>
            
            <AnimateOnScroll variant="scale">
              <div className="rounded-[40px] bg-white p-2.5 sm:p-4 shadow-2xl shadow-primary/10 border border-slate-100 shrink-0">
                <div className="rounded-[32px] bg-primary p-8 sm:p-12 text-white h-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/10 blur-3xl mix-blend-overlay"></div>
                  
                  <p className="text-sm font-medium text-white/80 tracking-wide mb-4">Language Academy Bangladesh</p>
                  <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-10 text-balance">
                    Achieve your<br/>target score<br/>with confidence
                  </h2>
                  
                  <div className="space-y-4 relative z-10">
                    {["Small batch interactive classes", "Experienced trainers and mock tests", "Dhaka-focused, Bangladesh-friendly support"].map((item, i) => (
                      <div key={i} className="flex items-center gap-4 rounded-2xl bg-white/10 p-4 border border-white/5 backdrop-blur-sm">
                        <Check size={20} className="text-white shrink-0" strokeWidth={3} />
                        <span className="font-medium text-sm sm:text-base">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* ═══════ 2. FEATURED LIVE COURSES ═══════ */}
      <section className="py-20 bg-white">
        <div className="container-shell">
          <div className="mb-12 text-center max-w-2xl mx-auto">
            <span className="text-sm font-bold uppercase tracking-widest text-primary mb-3 block">Upcoming Batches</span>
            <h2 className="text-3xl font-extrabold text-slate-900 md:text-4xl">Premium tracks ready for enrollment.</h2>
            <p className="mt-4 text-slate-500">Secure your seat in our upcoming small-batch intakes.</p>
          </div>
          
          {courses.length > 0 ? (
            <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.slice(0, 3).map((course) => (
                <StaggerItem key={course.id}>
                  <CourseCard course={course} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          ) : (
            <div className="rounded-3xl border border-slate-100 bg-white p-12 text-center text-slate-500">
              Courses are being updated. Check back shortly.
            </div>
          )}
          {courses.length > 3 && (
            <AnimateOnScroll variant="fade" className="mt-12 flex justify-center">
              <Link href="/courses" className="secondary-btn bg-white">View All Courses <ArrowRight size={16} /></Link>
            </AnimateOnScroll>
          )}
        </div>
      </section>

      {/* ═══════ 3. BEST PTE CLASSES (IMG 2) ═══════ */}
      <section className="py-20 bg-slate-50">
        <div className="container-shell">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <AnimateOnScroll variant="slide-left">
              <div className="rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-200/50">
                <img src="/hero_banner.png" alt="Student studying" className="w-full h-[400px] object-cover" />
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll variant="slide-right">
              <div>
                <h2 className="text-3xl font-extrabold text-primary md:text-4xl leading-tight mb-6">
                  Best PTE Classes in Dhaka –<br className="hidden md:block"/>
                  Language Academy Bangladesh
                </h2>
                <div className="space-y-6 text-slate-600 leading-relaxed">
                  <p>
                    Are you looking for the best PTE classes in Dhaka? Language Academy Bangladesh provides top-quality PTE exam preparation, helping you achieve your desired scores quickly and confidently. Our expert trainers, interactive classes, and proven teaching techniques make us the leading provider of PTE coaching in Bangladesh.
                  </p>
                  <p>
                    PTE (Pearson Test of English) is an internationally recognized English proficiency test trusted by universities, employers, and immigration authorities worldwide. It evaluates your listening, reading, writing, and speaking skills. PTE is computer-based, quick, fair, and delivers fast results — typically within 48 hours.
                  </p>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
          <AnimateOnScroll variant="fade-up" className="mt-14 flex items-center justify-center gap-4 flex-wrap">
            <button onClick={() => handleBook("PTE")} className="bg-primary text-white hover:bg-primary/90 px-6 py-4 rounded-xl font-bold shadow-xl shadow-primary/20 transition-all text-sm sm:text-base">
              Want to Study PTE? Book Now for PTE Classes
            </button>
            <button onClick={() => handleBook("")} className="bg-amber-500 text-slate-900 hover:bg-amber-400 px-6 py-4 rounded-xl font-bold shadow-xl shadow-amber-500/20 transition-all flex items-center gap-2 text-sm sm:text-base">
              <PhoneCall size={18} /> Free Counselling
            </button>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ═══════ 4 & 5. PTE FORMAT & SCORE SCALE (IMG 3 & 4) ═══════ */}
      <section className="py-24 bg-accent text-white page-shell overflow-hidden">
        <div className="container-shell relative z-10">
          
          {/* Top Half: PTE Format */}
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center mb-32">
            <AnimateOnScroll variant="slide-left">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-wide mb-8">PTE Format</h2>
                <div className="space-y-4">
                  {[
                    "Speaking and Writing",
                    "Reading",
                    "Listening"
                  ].map((title, i) => (
                    <div 
                      key={i} 
                      className={`cursor-pointer rounded-xl border transition-all ${openFormatFaq === i ? 'border-amber-400/50 bg-white/10' : 'border-white/20 bg-white/5 hover:bg-white/10'}`}
                      onClick={() => setOpenFormatFaq(openFormatFaq === i ? null : i)}
                    >
                      <div className="flex items-center justify-between p-5 font-bold text-lg">
                        {title}
                        <span className="text-xl font-light">{openFormatFaq === i ? '−' : '+'}</span>
                      </div>
                      {openFormatFaq === i && (
                        <div className="px-5 pb-5 pt-0 text-white/80 leading-relaxed text-sm">
                          {title === "Speaking and Writing" ? "This section assesses your ability to produce spoken and written English in an academic environment." :
                           title === "Reading" ? "Evaluates your ability to understand, analyze, and interpret written academic texts." :
                           "Tests your ability to understand spoken English in various accents and speeds."}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </AnimateOnScroll>
            
            <AnimateOnScroll variant="slide-right">
              <div className="rounded-[2rem] overflow-hidden shadow-2xl relative group">
                <img src="/pte_course.png" alt="PTE Format" className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-accent/20 mix-blend-overlay"></div>
              </div>
            </AnimateOnScroll>
          </div>

          {/* Bottom Half: Score Scale */}
          <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
            <AnimateOnScroll variant="slide-left">
              <h3 className="text-2xl font-bold mb-8 text-balance">What skills are tested in the PTE Listening section?</h3>
              <ul className="space-y-4 text-white/70">
                {[
                  "Identifying key information from spoken audio clips",
                  "Understanding different English accents (Australian, British, American)",
                  "Accurate note-taking and recall under time pressure",
                  "Identifying errors and inconsistencies in spoken content",
                  "Writing from dictation with correct spelling and grammar",
                  "Selecting the most appropriate summary for a spoken passage"
                ].map((item, i) => (
                  <li key={i} className="flex gap-4 items-start">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400"></span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </AnimateOnScroll>
            
            <AnimateOnScroll variant="slide-right">
              <h3 className="text-2xl font-bold mb-8">PTE Score Scale</h3>
              <div className="overflow-x-auto rounded-xl border border-white/20 bg-white/5 backdrop-blur-md">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/20 bg-white/10 text-white">
                      <th className="p-4 font-semibold text-center w-1/3">PTE Score</th>
                      <th className="p-4 font-semibold text-center border-l border-white/10 w-1/3">CEFR Level</th>
                      <th className="p-4 font-semibold text-center border-l border-white/10 w-1/3">IELTS Equivalent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {[
                      { pte: "85-90", cefr: "C2", ielts: "9.0" },
                      { pte: "76-84", cefr: "C1", ielts: "8.0-8.5" },
                      { pte: "68-75", cefr: "B2", ielts: "7.0-7.5" },
                      { pte: "59-67", cefr: "B2", ielts: "6.0-6.5" },
                      { pte: "50-58", cefr: "B1", ielts: "5.0-5.5" },
                      { pte: "43-49", cefr: "B1", ielts: "Modest" },
                      { pte: "30-42", cefr: "A2", ielts: "Limited" },
                      { pte: "10-29", cefr: "A1", ielts: "Very Limited" }
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 text-center font-medium">{row.pte}</td>
                        <td className="p-4 text-center border-l border-white/10 text-white/80">{row.cefr}</td>
                        <td className="p-4 text-center border-l border-white/10 text-white/80">{row.ielts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* ═══════ 6. WHY ACADEMY STANDS OUT (IMG 5) ═══════ */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-blue-100/50 blur-3xl mix-blend-multiply opacity-60"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-64 w-64 rounded-full bg-amber-100/50 blur-3xl mix-blend-multiply opacity-60"></div>
        
        <div className="container-shell relative z-10">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <AnimateOnScroll variant="slide-left">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-blue-100/60 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary shadow-sm mb-6">
                  WHY US
                </span>
                
                <h2 className="text-4xl font-extrabold text-slate-900 md:text-5xl tracking-tight mb-6">
                  Why Language Academy<br/>Bangladesh stands out
                </h2>
                
                <p className="text-lg leading-relaxed text-slate-600 mb-8 max-w-lg">
                  Our approach combines practical learning, score-focused training, and a supportive classroom environment.
                </p>
                
                <ul className="space-y-4">
                  {[
                    "Diagnostic evaluation before class placement",
                    "Structured syllabus with measurable progress",
                    "One-to-one feedback sessions",
                    "Updated materials for IELTS and PTE preparation",
                    "Ideal for students planning to study abroad from Bangladesh"
                  ].map((item, i) => (
                    <li key={i} className="flex gap-4 items-center">
                      <div className="flex h-2 w-2 shrink-0 items-center justify-center rounded-full bg-primary shadow-sm mt-0.5" />
                      <span className="text-slate-700 font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimateOnScroll>
            
            <AnimateOnScroll variant="scale">
              <div className="rounded-[2.5rem] bg-primary text-white shadow-2xl shadow-primary/20 p-8 sm:p-12 relative overflow-hidden flex flex-col md:flex-row items-center gap-8 justify-between">
                {/* Gloss effect */}
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                
                <div className="relative z-10 text-center md:text-left flex-1">
                  <h3 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight">Ready to improve your English?</h3>
                  <p className="text-white/80 text-sm sm:text-base">Join a professional course built for Bangladeshi learners.</p>
                </div>
                
                <div className="relative z-10 shrink-0">
                  <button onClick={() => handleBook()} className="bg-white text-primary hover:bg-slate-50 hover:scale-105 px-8 py-5 sm:px-12 sm:py-6 rounded-full font-bold shadow-lg shadow-black/10 transition-all">
                    Enroll<br/>Today
                  </button>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* ═══════ 7. UNLIMITED PRACTICE PROMO ═══════ */}
      <section className="py-24 bg-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 fine-grid mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-black/20 to-transparent"></div>
        <div className="container-shell relative z-10 text-center">
          <AnimateOnScroll variant="scale">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 shadow-[0_0_40px_rgba(255,255,255,0.2)] mb-8 border border-white/20 backdrop-blur-sm">
               <Target size={40} className="text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6">
              Get Enrolled & Enjoy <br className="hidden md:block"/>
              <span className="text-amber-300">Unlimited Practice</span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg md:text-xl text-white/90 leading-relaxed mb-10">
              Your success is our priority. Get unlimited access to comprehensive study materials, trainer-led sessions, and AI-scored mock tests until you reach your target score. Don't settle for less!
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
               <button onClick={() => handleBook()} className="bg-white text-primary hover:bg-slate-50 hover:scale-105 px-8 py-4 sm:px-10 sm:py-5 font-extrabold shadow-xl shadow-black/10 transition-all rounded-full text-base sm:text-lg w-full sm:w-auto">
                 Unlock Unlimited Access
               </button>
               <Link href="/courses" className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 px-8 py-4 sm:px-10 sm:py-5 font-bold transition-all rounded-full text-base sm:text-lg w-full sm:w-auto inline-block">
                 Explore Course Features
               </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ═══════ 8. FAQ & BOOKING FORM (2 COLUMN) ═══════ */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="container-shell">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] items-start">
            
            {/* Left: FAQs */}
            <AnimateOnScroll variant="slide-left">
              <div>
                <span className="text-sm font-bold uppercase tracking-widest text-primary mb-3 block">Got Questions?</span>
                <h2 className="text-3xl font-extrabold text-slate-900 md:text-4xl mb-8">Frequently Asked <br className="hidden md:block"/>Questions</h2>
                
                <div className="space-y-4">
                  {faqs.map(([q, a], i) => (
                    <div 
                      key={i} 
                      className={`group rounded-2xl border transition-all cursor-pointer ${openFaq === i ? 'border-primary/30 bg-primary/5 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                      open={openFaq === i}
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    >
                      <div className="flex items-center justify-between p-6 outline-none">
                        <span className="font-bold text-slate-900 pr-4">{q}</span>
                        <ChevronDown size={20} className={`shrink-0 text-slate-400 transition-transform ${openFaq === i ? 'rotate-180 text-primary' : ''}`} />
                      </div>
                      {openFaq === i && (
                        <div className="px-6 pb-6 pt-0 text-slate-600 leading-relaxed text-sm border-t border-slate-100 mt-2">
                          <p className="pt-4">{a}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </AnimateOnScroll>
            
            {/* Right: Inline Booking Form */}
            <AnimateOnScroll variant="slide-right">
              <BookingFormInline />
            </AnimateOnScroll>
            
          </div>
        </div>
      </section>

      {/* ══════ GLOBAL BOOKING MODAL ══════ */}
      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        defaultInterest={bookingInterest}
      />
    </div>
  );
}
