import React from 'react';
import { Target, Award, Users, Globe2 } from 'lucide-react';

export const metadata = {
  title: "About Us | Language Academy",
  description: "Learn more about Bangladesh's premier English language coaching center.",
};

export default function AboutPage() {
  return (
    <div className="pt-32 pb-24 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Our <span className="text-primary">Journey</span>
          </h1>
          <p className="text-lg text-slate-600">
            Founded with a vision to empower students, we have become the trusted name for PTE and IELTS preparation across Bangladesh.
          </p>
        </div>

        {/* Vision & Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
              <Target size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Mission</h2>
            <p className="text-slate-600 leading-relaxed">
              To provide world-class language training combining expert instruction, cutting-edge AI technology, and personalized support, enabling every student to achieve their dream score on the first attempt.
            </p>
          </div>
          
          <div className="bg-slate-900 p-8 md:p-12 rounded-[2rem] shadow-xl text-center text-white flex flex-col items-center">
            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary mb-6">
              <Globe2 size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
            <p className="text-slate-300 leading-relaxed">
              To be the premier gateway for international education and global career opportunities by breaking down language barriers and fostering global citizens.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-primary/5 rounded-[3rem] p-12 mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-primary/10">
            {[
              { label: 'Successful Students', value: '5,000+', icon: Users },
              { label: 'Pearson Certified Trainers', value: '25+', icon: Award },
              { label: 'Success Rate', value: '94%', icon: Target },
              { label: 'Global Campuses', value: '3', icon: Globe2 },
            ].map((stat, i) => (
               <div key={i} className="text-center px-4">
                <stat.icon className="mx-auto h-8 w-8 text-primary mb-3 opacity-80" />
                <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">{stat.value}</div>
                <div className="text-sm font-medium text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
