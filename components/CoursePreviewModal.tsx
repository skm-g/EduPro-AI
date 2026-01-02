
import React from 'react';
import { Course } from '../types';
import Button from './Button';

interface CoursePreviewModalProps {
  course: Course;
  onClose: () => void;
}

const CoursePreviewModal: React.FC<CoursePreviewModalProps> = ({ course, onClose }) => {
  const firstModule = course.modules[0];
  const firstLesson = firstModule?.lessons[0];

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md dark:bg-black/80 transition-opacity duration-300" 
        onClick={onClose}
      ></div>
      
      <div className="relative bg-white dark:bg-slate-900 rounded-[32px] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col transition-all duration-300 transform scale-100 opacity-100">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-20 w-10 h-10 bg-white/90 dark:bg-slate-800/90 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-lg"
        >
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="relative aspect-video sm:aspect-[21/9] w-full">
            <img src={course.thumbnail} className="w-full h-full object-cover" alt={course.title} />
            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 via-transparent to-transparent"></div>
            <div className="absolute bottom-6 left-8 right-8">
               <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-3 inline-block">
                 Course Preview
               </span>
               <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                 {course.title}
               </h2>
            </div>
          </div>

          <div className="p-8 sm:p-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">
              <section>
                <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">About this course</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
                  {course.description}
                </p>
              </section>

              <section className="bg-slate-50 dark:bg-slate-950/50 p-6 sm:p-8 rounded-[24px] border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                    <i className="fa-solid fa-play text-sm"></i>
                  </div>
                  <h3 className="font-black text-slate-900 dark:text-white">Sample Lesson Content</h3>
                </div>
                
                {firstLesson ? (
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold text-slate-800 dark:text-white">
                      Lesson 1: {firstLesson.title}
                    </h4>
                    <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 leading-relaxed">
                      {firstLesson.content || "Welcome to the first module of this course. In this session, we will cover the core fundamentals and set the stage for your learning journey. This lesson is designed to give you a quick win and immediate value."}
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400 italic">No lesson content available for preview.</p>
                )}
              </section>
            </div>

            <div className="space-y-6">
               <div className="p-6 bg-slate-50 dark:bg-slate-950/50 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4">
                  <div className="flex items-center gap-4">
                    <img src={`https://picsum.photos/seed/${course.instructorId}/100`} className="w-12 h-12 rounded-xl" />
                    <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase">Instructor</div>
                      <div className="font-bold text-slate-900 dark:text-white">{course.instructorName}</div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase">Duration</div>
                      <div className="font-bold text-slate-800 dark:text-white text-sm">{course.duration}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase">Rating</div>
                      <div className="font-bold text-amber-500 text-sm">{course.rating} ★</div>
                    </div>
                  </div>
                  <Button className="w-full mt-2" variant="primary" size="lg">Enroll for ${course.price}</Button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePreviewModal;