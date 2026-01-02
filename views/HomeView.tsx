
import React, { useState } from 'react';
import Button from '../components/Button';
import { Course, Certificate } from '../types';

interface HomeViewProps {
  courses: Course[];
  certificates: Certificate[];
  onLoginClick: () => void;
  onCourseClick: (course: Course) => void;
  onPreviewClick?: (course: Course) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ courses, certificates, onLoginClick, onCourseClick, onPreviewClick }) => {
  const [verifyRollNumber, setVerifyRollNumber] = useState('');
  const [verificationResult, setVerificationResult] = useState<Certificate | null | 'not-found'>(null);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyRollNumber.trim()) return;

    const found = certificates.find(c => c.rollNumber.toUpperCase() === verifyRollNumber.toUpperCase());
    setVerificationResult(found || 'not-found');
  };

  return (
    <div className="min-h-screen bg-white selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navbar */}
      <nav className="fixed w-full z-50 glass py-4 px-6 md:px-12 flex justify-between items-center transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200">
            <i className="fa-solid fa-graduation-cap text-2xl"></i>
          </div>
          <span className="font-black text-2xl text-slate-900 tracking-tight">EduPro <span className="text-indigo-600">AI</span></span>
        </div>
        <div className="hidden lg:flex items-center gap-10 text-slate-500 font-bold text-sm uppercase tracking-widest">
          <a href="#courses" className="hover:text-indigo-600 transition-colors">Courses</a>
          <a href="#verify" className="hover:text-indigo-600 transition-colors">Verify Cert</a>
          <a href="#features" className="hover:text-indigo-600 transition-colors">AI Learning</a>
          <a href="#pricing" className="hover:text-indigo-600 transition-colors">Pricing</a>
        </div>
        <div className="flex gap-4">
          <Button variant="ghost" className="font-bold text-slate-700" onClick={onLoginClick}>Sign In</Button>
          <Button variant="primary" className="hidden sm:inline-flex rounded-xl font-bold" onClick={onLoginClick}>Start For Free</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-32 px-6 md:px-12 max-w-7xl mx-auto overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-10 z-10">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-indigo-50 rounded-full border border-indigo-100">
              <span className="w-3 h-3 bg-indigo-600 rounded-full animate-ping"></span>
              <span className="text-xs font-black text-indigo-700 uppercase tracking-[0.2em]">Next-Gen Learning Platform</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-slate-900 leading-[0.95] tracking-tighter">
              Learning <br/> <span className="gradient-text">Redefined</span> By Intelligence.
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl leading-relaxed font-medium">
              Join the world's most advanced LMS. Master high-demand skills with professional instructors and your personal AI-powered tutor.
            </p>
            <div className="flex flex-wrap gap-5">
              <Button size="lg" className="rounded-2xl px-10 shadow-2xl shadow-indigo-100" onClick={onLoginClick}>Join Now — It's Free</Button>
              <Button size="lg" variant="outline" className="rounded-2xl px-10" onClick={() => document.getElementById('verify')?.scrollIntoView({behavior: 'smooth'})}>Verify a Certificate</Button>
            </div>
            <div className="flex items-center gap-8 pt-6 border-t border-slate-100">
              <div>
                <div className="font-black text-3xl text-slate-900">500+</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Courses</div>
              </div>
              <div className="w-px h-10 bg-slate-100"></div>
              <div>
                <div className="font-black text-3xl text-slate-900">50K+</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Students</div>
              </div>
              <div className="w-px h-10 bg-slate-100"></div>
              <div>
                <div className="font-black text-3xl text-slate-900">4.9/5</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Rating</div>
              </div>
            </div>
          </div>
          <div className="flex-1 relative group">
            <div className="absolute -inset-10 bg-indigo-400/20 rounded-full blur-[100px] animate-pulse"></div>
            <div className="relative bg-slate-900 rounded-[48px] overflow-hidden shadow-[0_50px_100px_-20px_rgba(79,70,229,0.3)] rotate-2 group-hover:rotate-0 transition-transform duration-700 border-8 border-slate-800">
              <img 
                src="https://picsum.photos/seed/dashboard_pro/1200/900" 
                className="w-full h-auto opacity-90 object-cover" 
                alt="Pro Dashboard" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
              <div className="absolute bottom-10 left-10 right-10">
                 <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl flex items-center justify-between">
                    <div className="flex items-center gap-5">
                       <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center text-white text-2xl">
                          <i className="fa-solid fa-chart-line"></i>
                       </div>
                       <div className="text-left">
                          <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest">Real-time Analytics</p>
                          <p className="text-white text-lg font-black tracking-tight">Track Your Mastery</p>
                       </div>
                    </div>
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-900">
                       <i className="fa-solid fa-chevron-right"></i>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section id="courses" className="bg-slate-50 py-32 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-20">
            <div className="space-y-4">
               <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Explore World-Class <br/> Knowledge.</h2>
               <p className="text-slate-500 max-w-lg font-medium">Learn from the best in the industry. From design systems to deep neural networks.</p>
            </div>
            <div className="flex gap-4">
               <button className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors shadow-sm">
                  <i className="fa-solid fa-arrow-left"></i>
               </button>
               <button className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors shadow-sm">
                  <i className="fa-solid fa-arrow-right"></i>
               </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {courses.map(course => (
              <div 
                key={course.id} 
                className="group bg-white rounded-[40px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 flex flex-col cursor-pointer hover:-translate-y-2 p-3"
                onClick={() => onCourseClick(course)}
              >
                <div className="relative overflow-hidden rounded-[32px] aspect-video">
                  <img 
                    src={course.thumbnail} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    alt={course.title} 
                  />
                  <div className="absolute top-6 left-6 flex gap-2">
                    <div className="bg-white/95 backdrop-blur px-4 py-1.5 rounded-full text-[10px] font-black text-indigo-700 shadow-xl uppercase tracking-widest">
                      {course.category}
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
                     <div className="bg-white w-14 h-14 rounded-full flex items-center justify-center text-indigo-600 shadow-2xl">
                        <i className="fa-solid fa-play ml-1"></i>
                     </div>
                     <span className="text-white text-xs font-black uppercase tracking-[0.2em] bg-indigo-600 px-4 py-2 rounded-full shadow-lg">Click to Preview</span>
                  </div>
                </div>
                <div className="p-8 space-y-6 flex-1 flex flex-col">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                      <i className="fa-solid fa-clock text-indigo-500"></i>
                      {course.duration}
                    </div>
                    <div className="flex items-center gap-1.5 text-amber-500 font-black text-sm">
                      <i className="fa-solid fa-star"></i>
                      {course.rating}
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-[1.1] tracking-tight">
                    {course.title}
                  </h3>
                  <div className="flex items-center gap-4 mt-auto pt-6 border-t border-slate-50">
                    <div className="relative">
                      <img src={`https://picsum.photos/seed/${course.instructorId}/100`} className="w-12 h-12 rounded-2xl border-2 border-slate-50" alt={course.instructorName} />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                      <span className="text-sm font-black text-slate-800 block leading-tight">{course.instructorName}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Senior Mentor</span>
                    </div>
                    <div className="ml-auto text-3xl font-black text-indigo-600 tracking-tighter">
                      ${course.price}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certificate Verification Section */}
      <section id="verify" className="py-32 px-6 md:px-12 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="bg-indigo-600 rounded-[64px] p-10 md:p-20 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px'}}></div>
            </div>
            
            <div className="relative z-10 space-y-8">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center text-white mx-auto shadow-inner mb-6">
                <i className="fa-solid fa-award text-4xl"></i>
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tighter">
                Certificate Verification
              </h2>
              <p className="text-indigo-100 text-lg font-medium max-w-xl mx-auto">
                Enter the unique roll number found on your certificate to verify its authenticity and credentials.
              </p>
              
              <form onSubmit={handleVerify} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
                <input 
                  type="text" 
                  placeholder="e.g. EP-2025-ABCD12"
                  value={verifyRollNumber}
                  onChange={(e) => setVerifyRollNumber(e.target.value)}
                  className="flex-1 bg-white border-2 border-white/20 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-white/20 transition-all placeholder:text-slate-400"
                />
                <Button type="submit" variant="secondary" size="lg" className="rounded-2xl">Verify Now</Button>
              </form>

              {verificationResult === 'not-found' && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300 bg-red-500/20 border border-red-500/30 p-4 rounded-2xl text-white font-bold inline-block">
                  <i className="fa-solid fa-circle-exclamation mr-2"></i> No certificate found with this roll number.
                </div>
              )}

              {verificationResult && typeof verificationResult === 'object' && (
                <div className="animate-in fade-in zoom-in duration-500 bg-white rounded-[40px] p-8 text-left border border-white/20 shadow-2xl max-w-2xl mx-auto mt-12">
                   <div className="flex flex-col md:flex-row gap-8 items-center">
                      <div className="w-24 h-24 bg-green-500 rounded-3xl flex items-center justify-center text-white text-4xl flex-shrink-0 shadow-lg shadow-green-500/20">
                        <i className="fa-solid fa-check-double"></i>
                      </div>
                      <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                           Verified Credentials
                        </div>
                        <h4 className="text-2xl font-black text-slate-900 tracking-tight">Valid Certificate for {verificationResult.studentName}</h4>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-4 pt-4 border-t border-slate-100">
                           <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Course Title</p>
                              <p className="text-sm font-bold text-slate-800">{verificationResult.courseTitle}</p>
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completion Date</p>
                              <p className="text-sm font-bold text-slate-800">{verificationResult.completionDate}</p>
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Roll Number</p>
                              <p className="text-sm font-black text-indigo-600 font-mono">{verificationResult.rollNumber}</p>
                           </div>
                        </div>
                      </div>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Highlight */}
      <section id="features" className="py-32 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="bg-slate-900 rounded-[64px] p-10 md:p-24 flex flex-col lg:flex-row items-center gap-20 overflow-hidden relative border-[12px] border-slate-800">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] -mr-64 -mt-64"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] -ml-64 -mb-64"></div>
          
          <div className="flex-1 space-y-10 z-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/5 rounded-full border border-white/10">
               <i className="fa-solid fa-brain text-indigo-400"></i>
               <span className="text-xs font-black text-white uppercase tracking-[0.2em]">Learning Science x AI</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-white leading-[0.9] tracking-tighter">Your Brain's <br/> New <span className="text-indigo-500">Superpower.</span></h2>
            <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Don't just watch. Interact. Our AI tutor understands your course context and helps you solve problems in real-time.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { icon: 'fa-wand-magic-sparkles', title: 'Smart Summaries', desc: 'Convert 1hr videos into 5min notes.' },
                { icon: 'fa-message', title: 'Contextual Chat', desc: 'Ask questions about any lecture frame.' },
                { icon: 'fa-code', title: 'Live Debugging', desc: 'Get instant feedback on your code tasks.' },
                { icon: 'fa-vials', title: 'Auto-Generated Quizzes', desc: 'Test your knowledge as you learn.' }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-5 p-6 rounded-[32px] bg-white/5 border border-white/10 text-left">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xl flex-shrink-0">
                    <i className={`fa-solid ${item.icon}`}></i>
                  </div>
                  <div>
                    <h4 className="text-white font-black mb-1">{item.title}</h4>
                    <p className="text-slate-500 text-xs font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 z-10 w-full lg:w-auto">
             <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[48px] p-8 shadow-2xl relative">
                <div className="flex items-center justify-between mb-10 pb-6 border-b border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-500 rounded-3xl flex items-center justify-center text-white text-2xl shadow-lg shadow-indigo-500/40">
                      <i className="fa-solid fa-robot"></i>
                    </div>
                    <div>
                      <div className="text-white font-black text-xl tracking-tight">EduPro Gemini</div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-indigo-300 text-[10px] font-black uppercase tracking-widest">Active Assistant</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                     <div className="w-2 h-2 bg-white/20 rounded-full"></div>
                     <div className="w-2 h-2 bg-white/20 rounded-full"></div>
                     <div className="w-2 h-2 bg-white/20 rounded-full"></div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="bg-white/5 p-5 rounded-[24px] rounded-tl-none border border-white/5 text-indigo-100 text-sm font-medium leading-relaxed">
                    "I see you're learning about <strong>Prop Drilling</strong> in React. Would you like me to explain how <strong>Context API</strong> solves this?"
                  </div>
                  <div className="bg-indigo-600/80 p-5 rounded-[24px] rounded-tr-none border border-white/10 text-white text-sm font-bold ml-12 text-right shadow-xl">
                    Yes, please! Give me a simple code example.
                  </div>
                  <div className="bg-white/5 p-5 rounded-[24px] rounded-tl-none border border-white/5 text-indigo-100 text-sm italic font-medium">
                    "Thinking... Analyzing React 18 context patterns..."
                  </div>
                </div>
                <div className="mt-10 flex gap-3">
                   <div className="flex-1 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center px-6 text-slate-500 text-sm font-bold italic">Type your question here...</div>
                   <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-xl">
                      <i className="fa-solid fa-paper-plane"></i>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-500 py-32 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16">
          <div className="lg:col-span-2 space-y-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-indigo-600 rounded-[22px] flex items-center justify-center text-white shadow-2xl shadow-indigo-500/20">
                <i className="fa-solid fa-graduation-cap text-3xl"></i>
              </div>
              <span className="font-black text-3xl text-white tracking-tighter">EduPro <span className="text-indigo-500">AI</span></span>
            </div>
            <p className="text-lg leading-relaxed font-medium max-w-sm">
              We're on a mission to democratize elite education using the power of AI and professional mentorship.
            </p>
            <div className="flex gap-4">
              {['twitter', 'linkedin', 'github', 'instagram'].map(platform => (
                <a key={platform} href="#" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-indigo-600 hover:border-indigo-500 transition-all">
                  <i className={`fa-brands fa-${platform} text-xl`}></i>
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-white font-black mb-8 uppercase tracking-widest text-xs">Learning</h4>
            <ul className="space-y-5 text-sm font-bold">
              <li><a href="#" className="hover:text-white transition-colors">Courses Catalog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">AI Learning Suite</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Learning Tracks</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Certifications</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-black mb-8 uppercase tracking-widest text-xs">Community</h4>
            <ul className="space-y-5 text-sm font-bold">
              <li><a href="#" className="hover:text-white transition-colors">Success Stories</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Instructors</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Events</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Scholarships</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-black mb-8 uppercase tracking-widest text-xs">Company</h4>
            <ul className="space-y-5 text-sm font-bold">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms & Privacy</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-20 mt-20 border-t border-white/5 text-center text-xs font-bold uppercase tracking-[0.3em] opacity-30">
          © 2025 EDU PRO AI SYSTEMS. ALL RIGHTS RESERVED.
        </div>
      </footer>
    </div>
  );
};

export default HomeView;
