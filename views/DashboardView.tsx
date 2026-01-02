
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import { User, UserRole, Course, Module, Review, Lesson, Certificate } from '../types';
import Button from '../components/Button';
import RichTextEditor from '../components/RichTextEditor';
import { geminiService } from '../services/geminiService';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

// Workaround for react-beautiful-dnd / @hello-pangea/dnd with React Strict Mode
const StrictModeDroppable = ({ children, ...props }: any) => {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);
  if (!enabled) {
    return null;
  }
  return <Droppable {...props}>{children}</Droppable>;
};

// Internal component for smooth progress animations
const AnimatedProgressBar: React.FC<{ progress: number; isFinished: boolean }> = ({ progress, isFinished }) => {
  const [animatedWidth, setAnimatedWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedWidth(progress);
    }, 150);
    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
      <div 
        className={`h-full rounded-full transition-all duration-[1500ms] ease-out shadow-[0_0_10px_rgba(99,102,241,0.3)] ${
          isFinished ? 'bg-green-500 shadow-green-500/20' : 'bg-indigo-600 shadow-indigo-600/20'
        }`} 
        style={{ width: `${animatedWidth}%` }}
      ></div>
    </div>
  );
};

interface DashboardViewProps {
  user: User;
  courses: Course[];
  users: User[];
  certificates: Certificate[];
  onLogout: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  onAddCourse: (course: Course) => void;
  onDeleteCourse?: (courseId: string) => void;
  onOnboardInstructor?: (instructorData: Partial<User>) => void;
  onToggleVerifyInstructor?: (userId: string) => void;
  onMarkCourseComplete?: (courseId: string) => void;
  onViewCertificate?: (cert: Certificate) => void;
  onImportCourses: (importedCourses: Course[]) => void;
  onPreviewCourse?: (course: Course) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ 
  user, 
  courses, 
  users,
  certificates,
  onLogout, 
  darkMode, 
  toggleDarkMode, 
  onAddCourse,
  onDeleteCourse,
  onOnboardInstructor,
  onToggleVerifyInstructor,
  onMarkCourseComplete,
  onViewCertificate,
  onImportCourses,
  onPreviewCourse
}) => {
  const [activeView, setActiveView] = useState('dashboard');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedInstructor, setSelectedInstructor] = useState<User | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Onboarding state
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [onboardData, setOnboardData] = useState({
    name: '',
    email: '',
    bio: '',
    avatar: ''
  });

  // Instructor specific state
  const [newCourseTopic, setNewCourseTopic] = useState('');
  const [isGeneratingCourse, setIsGeneratingCourse] = useState(false);
  const [generatedOutline, setGeneratedOutline] = useState<any>(null);

  // Manual course wizard state
  const [wizardStep, setWizardStep] = useState(1);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [manualCourseData, setManualCourseData] = useState({
    title: '',
    description: '',
    price: '',
    thumbnail: '',
    category: 'Development',
    instructorName: user.name,
    modules: [] as Module[]
  });

  const [activeEditModuleIndex, setActiveEditModuleIndex] = useState<number | null>(null);
  const [activeEditLessonIndex, setActiveEditLessonIndex] = useState<{ moduleIdx: number, lessonIdx: number } | null>(null);

  // Review System State
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const handleAiAsk = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    const response = await geminiService.getLearningAssistant(aiPrompt);
    setAiMessage(response || "Failed to get AI response.");
    setIsAiLoading(false);
    setAiPrompt('');
  };

  const handleGenerateCourse = async () => {
    if (!newCourseTopic.trim()) return;
    setIsGeneratingCourse(true);
    const outline = await geminiService.generateCourseOutline(newCourseTopic);
    setGeneratedOutline(outline);
    setIsGeneratingCourse(false);
  };

  const handleExportJSON = () => {
    const dataToExport = user.role === UserRole.ADMIN 
      ? courses 
      : courses.filter(c => c.instructorId === user.id);
    
    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `edupro_courses_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (Array.isArray(json)) {
          if (json.length > 0 && (!json[0].id || !json[0].title)) {
            throw new Error("Invalid JSON structure. Must be an array of courses.");
          }
          onImportCourses(json);
          alert(`Successfully imported ${json.length} courses!`);
        } else {
          alert("Invalid JSON format. Please upload a course array.");
        }
      } catch (err) {
        console.error("Import Error:", err);
        alert("Failed to parse JSON file. Ensure it is a valid backup.");
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourseId(course.id);
    setWizardStep(1);
    setManualCourseData({
      title: course.title,
      description: course.description,
      price: course.price.toString(),
      thumbnail: course.thumbnail,
      category: course.category,
      instructorName: course.instructorName,
      modules: JSON.parse(JSON.stringify(course.modules))
    });
    setActiveView('manual-course-gen');
  };

  const handleManualCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCourseData.title.trim()) {
      alert("Please enter a course title.");
      return;
    }

    const courseData: Course = {
      id: editingCourseId || `c-${Date.now()}`,
      title: manualCourseData.title,
      description: manualCourseData.description,
      instructorId: user.id,
      instructorName: manualCourseData.instructorName,
      price: parseFloat(manualCourseData.price) || 0,
      thumbnail: manualCourseData.thumbnail || `https://picsum.photos/seed/${Date.now()}/800/450`,
      category: manualCourseData.category,
      rating: editingCourseId ? (courses.find(c => c.id === editingCourseId)?.rating || 5.0) : 5.0,
      studentsCount: editingCourseId ? (courses.find(c => c.id === editingCourseId)?.studentsCount || 0) : 0,
      duration: 'TBD',
      modules: manualCourseData.modules,
      reviews: editingCourseId ? (courses.find(c => c.id === editingCourseId)?.reviews || []) : []
    };

    onAddCourse(courseData);
    setActiveView('manage-courses');
    setEditingCourseId(null);
    setWizardStep(1);
    setManualCourseData({
      title: '',
      description: '',
      price: '',
      thumbnail: '',
      category: 'Development',
      instructorName: user.name,
      modules: []
    });
  };

  const handleOnboardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onOnboardInstructor) {
      onOnboardInstructor(onboardData);
      setIsOnboarding(false);
      setOnboardData({ name: '', email: '', bio: '', avatar: '' });
      alert('Instructor onboarded successfully!');
    }
  };

  const addModule = () => {
    const newModule: Module = {
      id: `m-${Date.now()}`,
      title: 'Untitled Module',
      lessons: []
    };
    setManualCourseData({
      ...manualCourseData,
      modules: [...manualCourseData.modules, newModule]
    });
    setActiveEditModuleIndex(manualCourseData.modules.length);
  };

  const addLesson = (moduleIndex: number) => {
    const newLesson: Lesson = {
      id: `l-${Date.now()}`,
      title: 'Untitled Lesson',
      duration: '5:00',
      content: ''
    };
    const updatedModules = [...manualCourseData.modules];
    updatedModules[moduleIndex].lessons.push(newLesson);
    setManualCourseData({
      ...manualCourseData,
      modules: updatedModules
    });
    setActiveEditLessonIndex({ moduleIdx: moduleIndex, lessonIdx: updatedModules[moduleIndex].lessons.length - 1 });
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, type } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newModules = Array.from(manualCourseData.modules);

    if (type === 'module') {
      const [removed] = newModules.splice(source.index, 1);
      newModules.splice(destination.index, 0, removed);
    } else if (type === 'lesson') {
      const sourceModuleId = source.droppableId.replace('lessons-', '');
      const destModuleId = destination.droppableId.replace('lessons-', '');
      
      const sourceModuleIdx = newModules.findIndex(m => m.id === sourceModuleId);
      const destModuleIdx = newModules.findIndex(m => m.id === destModuleId);

      const sourceLessons = Array.from(newModules[sourceModuleIdx].lessons);
      const [removed] = sourceLessons.splice(source.index, 1);

      if (sourceModuleIdx === destModuleIdx) {
        sourceLessons.splice(destination.index, 0, removed);
        newModules[sourceModuleIdx].lessons = sourceLessons;
      } else {
        const destLessons = Array.from(newModules[destModuleIdx].lessons);
        destLessons.splice(destination.index, 0, removed);
        newModules[sourceModuleIdx].lessons = sourceLessons;
        newModules[destModuleIdx].lessons = destLessons;
      }
    }

    setManualCourseData({ ...manualCourseData, modules: newModules });
  };

  const handleMarkAsComplete = (courseId: string) => {
    if (onMarkCourseComplete) {
      onMarkCourseComplete(courseId);
      setSelectedCourse(null);
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    const newReview: Review = {
      id: `r-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      rating: reviewRating,
      comment: reviewComment,
      date: new Date().toISOString().split('T')[0]
    };

    const updatedReviews = [newReview, ...(selectedCourse.reviews || [])];
    const avgRating = updatedReviews.reduce((acc, r) => acc + r.rating, 0) / updatedReviews.length;

    const updatedCourse = {
      ...selectedCourse,
      reviews: updatedReviews,
      rating: parseFloat(avgRating.toFixed(1))
    };

    const courseIndex = courses.findIndex(c => c.id === selectedCourse.id);
    if (courseIndex > -1) courses[courseIndex] = updatedCourse;

    setSelectedCourse(updatedCourse);
    setReviewComment('');
    setReviewRating(5);
  };

  const handleDeleteCourseWithConfirm = (courseId: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      if (onDeleteCourse) {
        onDeleteCourse(courseId);
      }
    }
  };

  const calculateProgress = (course: Course) => {
    if (!user.completedLessonIds || course.modules.length === 0) {
      return user.completedCourseIds?.includes(course.id) ? 100 : 0;
    }
    
    const allLessons = course.modules.flatMap(m => m.lessons);
    if (allLessons.length === 0) return user.completedCourseIds?.includes(course.id) ? 100 : 0;
    
    const completedCount = allLessons.filter(l => user.completedLessonIds?.includes(l.id)).length;
    return Math.round((completedCount / allLessons.length) * 100);
  };

  const renderStats = () => {
    const stats = {
      [UserRole.STUDENT]: [
        { label: 'Enrolled', value: user.enrolledCourseIds?.length.toString() || '0', icon: 'fa-book', color: 'bg-blue-500' },
        { label: 'Completed', value: user.completedCourseIds?.length.toString() || '0', icon: 'fa-check-double', color: 'bg-green-500' },
        { label: 'Watch Time', value: '12h 45m', icon: 'fa-clock', color: 'bg-purple-500' },
        { label: 'Certificates', value: user.completedCourseIds?.length.toString() || '0', icon: 'fa-award', color: 'bg-amber-500' },
      ],
      [UserRole.INSTRUCTOR]: [
        { label: 'Total Students', value: '4,200', icon: 'fa-users', color: 'bg-indigo-500' },
        { label: 'Active Courses', value: '8', icon: 'fa-book-open', color: 'bg-emerald-500' },
        { label: 'Total Revenue', value: '$12,450', icon: 'fa-wallet', color: 'bg-pink-500' },
        { label: 'Avg Rating', value: '4.9', icon: 'fa-star', color: 'bg-yellow-500' },
      ],
      [UserRole.ADMIN]: [
        { label: 'Total Users', value: users.length.toString(), icon: 'fa-users', color: 'bg-indigo-500' },
        { label: 'Active Courses', value: courses.length.toString(), icon: 'fa-laptop-code', color: 'bg-cyan-500' },
        { label: 'Monthly Growth', value: '+12.5%', icon: 'fa-chart-line', color: 'bg-green-500' },
        { label: 'Pending Payouts', value: '$4,100', icon: 'fa-receipt', color: 'bg-rose-500' },
      ]
    }[user.role as keyof typeof UserRole] || [];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${stat.color} group-hover:scale-110 transition-transform`}>
                <i className={`fa-solid ${stat.icon} text-2xl`}></i>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{stat.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderViewContent = () => {
    if (selectedCourse) {
      const isCompleted = user.completedCourseIds?.includes(selectedCourse.id);
      const hasReviewed = selectedCourse.reviews?.some(r => r.userId === user.id);

      return (
        <div className="space-y-8 transition-opacity duration-500">
          <button onClick={() => setSelectedCourse(null)} className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold hover:gap-3 transition-all">
            <i className="fa-solid fa-arrow-left"></i> Back
          </button>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-xl">
                <div className="relative aspect-video">
                  <img src={selectedCourse.thumbnail} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                    <button className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-indigo-600 shadow-2xl hover:scale-110 transition-transform">
                      <i className="fa-solid fa-play ml-1"></i>
                    </button>
                  </div>
                </div>
                <div className="p-8 space-y-6">
                  <div className="flex justify-between items-start">
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white">{selectedCourse.title}</h2>
                    <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-2xl border border-amber-100 dark:border-amber-800">
                      <i className="fa-solid fa-star text-amber-500"></i>
                      <span className="font-black text-amber-700 dark:text-amber-500">{selectedCourse.rating}</span>
                    </div>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-lg">{selectedCourse.description}</p>
                  
                  {user.role === UserRole.STUDENT && (
                    <div className="pt-6 border-t border-slate-50 dark:border-slate-800">
                      {!isCompleted ? (
                        <Button variant="primary" size="lg" onClick={() => handleMarkAsComplete(selectedCourse.id)}>
                          <i className="fa-solid fa-check mr-2"></i> Mark Course as Complete
                        </Button>
                      ) : (
                        <div className="space-y-4">
                           <div className="bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 p-4 rounded-2xl border border-green-100 dark:border-green-800 flex items-center gap-3 font-bold">
                              <i className="fa-solid fa-circle-check text-xl"></i>
                              Course Completed Successfully!
                           </div>
                           <Button variant="outline" onClick={() => {
                              const cert = certificates.find(c => c.courseId === selectedCourse.id && c.studentId === user.id);
                              if (cert) onViewCertificate?.(cert);
                           }}>
                              <i className="fa-solid fa-award mr-2"></i> View Certificate
                           </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">Student Reviews</h3>
                  <span className="text-slate-400 font-bold">{selectedCourse.reviews?.length || 0} Reviews</span>
                </div>

                {isCompleted && !hasReviewed && user.role === UserRole.STUDENT && (
                  <form onSubmit={handleSubmitReview} className="p-6 bg-slate-50 dark:bg-slate-950/50 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4">
                    <div className="font-bold text-slate-900 dark:text-white">Share your experience</div>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button 
                          key={s} 
                          type="button" 
                          onClick={() => setReviewRating(s)}
                          className={`text-2xl transition-colors ${reviewRating >= s ? 'text-amber-400' : 'text-slate-200 dark:text-slate-800'}`}
                        >
                          <i className="fa-solid fa-star"></i>
                        </button>
                      ))}
                    </div>
                    <textarea 
                      required
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="What did you think of this course?"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                      rows={3}
                    />
                    <Button type="submit">Post Review</Button>
                  </form>
                )}

                <div className="space-y-6">
                  {selectedCourse.reviews?.map((review) => (
                    <div key={review.id} className="p-6 border-b border-slate-50 dark:border-slate-800 last:border-0">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <img src={review.userAvatar} className="w-10 h-10 rounded-full" alt={review.userName} />
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{review.userName}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{review.date}</div>
                          </div>
                        </div>
                        <div className="flex gap-1 text-amber-400 text-xs">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <i key={i} className="fa-solid fa-star"></i>
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed italic">"{review.comment}"</p>
                    </div>
                  ))}
                  {(!selectedCourse.reviews || selectedCourse.reviews.length === 0) && (
                    <div className="text-center py-12 text-slate-400 font-medium">No reviews yet. Be the first to leave one!</div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
               <div className="bg-slate-50 dark:bg-slate-950/50 rounded-3xl p-6 space-y-6 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-4">
                    <img src={`https://picsum.photos/seed/${selectedCourse.instructorId}/100`} className="w-16 h-16 rounded-2xl object-cover" />
                    <div>
                      <div className="text-sm font-bold text-slate-400 uppercase">Instructor</div>
                      <div className="text-lg font-black text-slate-900 dark:text-white">{selectedCourse.instructorName}</div>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                    <div className="flex justify-between"><span>Duration</span><span className="text-slate-900 dark:text-white font-bold">{selectedCourse.duration}</span></div>
                    <div className="flex justify-between"><span>Students</span><span className="text-slate-900 dark:text-white font-bold">{selectedCourse.studentsCount.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>Price</span><span className="text-indigo-600 dark:text-indigo-400 font-black">${selectedCourse.price}</span></div>
                  </div>
                  <Button className="w-full" size="lg">Enroll Now</Button>
               </div>
            </div>
          </div>
        </div>
      );
    }

    if (selectedInstructor && user.role === UserRole.ADMIN) {
      const instructorCourses = courses.filter(c => c.instructorId === selectedInstructor.id);
      const totalStudents = instructorCourses.reduce((acc, curr) => acc + curr.studentsCount, 0);
      const avgRating = instructorCourses.length > 0 
        ? (instructorCourses.reduce((acc, curr) => acc + curr.rating, 0) / instructorCourses.length).toFixed(1)
        : 'N/A';

      return (
        <div className="space-y-8 transition-opacity duration-500">
          <button onClick={() => setSelectedInstructor(null)} className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold hover:gap-3 transition-all mb-4">
            <i className="fa-solid fa-arrow-left"></i> Back to Instructors
          </button>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm text-center">
                <div className="relative inline-block mb-6">
                  <img src={selectedInstructor.avatar} className="w-32 h-32 rounded-[40px] mx-auto border-4 border-slate-50 dark:border-slate-800 shadow-xl" alt={selectedInstructor.name} />
                  {selectedInstructor.isVerified && (
                    <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white w-10 h-10 rounded-2xl flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-lg" title="Verified Instructor">
                      <i className="fa-solid fa-check text-sm"></i>
                    </div>
                  )}
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">{selectedInstructor.name}</h2>
                <p className="text-indigo-600 dark:text-indigo-400 text-sm font-bold uppercase tracking-widest mb-6">Expert Instructor</p>
                <div className="flex flex-col gap-3">
                  <Button variant={selectedInstructor.isVerified ? "outline" : "primary"} onClick={() => onToggleVerifyInstructor?.(selectedInstructor.id)}>
                    {selectedInstructor.isVerified ? "Revoke Verification" : "Verify Instructor"}
                  </Button>
                  <Button variant="ghost">Message</Button>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                <h3 className="font-black text-slate-900 dark:text-white mb-4">Performance Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950/50 rounded-2xl">
                    <span className="text-slate-500 dark:text-slate-400 text-sm">Total Students</span>
                    <span className="font-black text-slate-900 dark:text-white">{totalStudents.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950/50 rounded-2xl">
                    <span className="text-slate-500 dark:text-slate-400 text-sm">Average Rating</span>
                    <span className="font-black text-amber-500">{avgRating} ★</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950/50 rounded-2xl">
                    <span className="text-slate-500 dark:text-slate-400 text-sm">Courses Published</span>
                    <span className="font-black text-slate-900 dark:text-white">{instructorCourses.length}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4">Biography</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {selectedInstructor.bio || `${selectedInstructor.name} is a seasoned professional dedicated to delivering high-quality education in their field. With years of industry experience, they bring practical insights and academic rigor to every lesson.`}
                </p>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Active Courses</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {instructorCourses.map(course => (
                    <div key={course.id} className="bg-white dark:bg-slate-900 rounded-[28px] p-2 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col group transition-all hover:shadow-md">
                      <img src={course.thumbnail} className="aspect-video w-full rounded-[22px] object-cover mb-4" />
                      <div className="px-4 pb-4">
                        <h4 className="font-black text-slate-900 dark:text-white line-clamp-1 mb-2">{course.title}</h4>
                        <div className="flex justify-between text-xs font-bold text-slate-400 uppercase">
                          <span>{course.studentsCount} Students</span>
                          <span className="text-indigo-600 dark:text-indigo-400">${course.price}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {instructorCourses.length === 0 && (
                    <div className="col-span-2 p-12 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[32px] text-slate-400 font-medium">
                      No courses published yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    switch (activeView) {
      case 'dashboard':
        return (
          <div className="space-y-10 opacity-100 transition-opacity duration-300">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-1">
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Howdy, {user.name.split(' ')[0]}! 🚀</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Here's what's happening in your digital campus today.</p>
              </div>
              <div className="flex gap-4">
                <Button variant="primary" size="md" className="relative" onClick={() => {
                   setEditingCourseId(null);
                   setWizardStep(1);
                   setManualCourseData({
                      title: '', description: '', price: '', thumbnail: '', category: 'Development', instructorName: user.name, modules: []
                   });
                   setActiveView('manual-course-gen');
                }}>
                  <i className="fa-solid fa-plus mr-2"></i> Create Course
                </Button>
              </div>
            </header>

            {renderStats()}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-8 space-y-10">
                <section>
                  <div className="flex justify-between items-end mb-6">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 dark:text-white">Recommended for You</h2>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">Expand your skill set with these top picks.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {courses.slice(0, 4).map(course => {
                      const instructorCourses = courses.filter(c => c.instructorId === course.instructorId);
                      return (
                        <div key={course.id} onClick={() => onPreviewCourse ? onPreviewCourse(course) : setSelectedCourse(course)} className="bg-white dark:bg-slate-900 rounded-[28px] p-2 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group cursor-pointer overflow-hidden relative">
                          <div className="relative aspect-video rounded-[22px] overflow-hidden">
                            <img src={course.thumbnail} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
                            <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/95 dark:bg-slate-900/95 px-2.5 py-1 rounded-full text-[10px] font-black shadow-lg">
                              <i className="fa-solid fa-star text-amber-500"></i>
                              <span className="text-slate-800 dark:text-slate-100">{course.rating}</span>
                            </div>
                            <div className="absolute inset-0 bg-indigo-900/80 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white p-4">
                               <img src={`https://picsum.photos/seed/${course.instructorId}/100`} className="w-12 h-12 rounded-full mb-2 border-2 border-white/20 shadow-lg" />
                               <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-2">{course.instructorName}</p>
                               <div className="flex gap-4 text-[10px] font-bold">
                                  <div className="text-center">
                                    <span className="block">{instructorCourses.length}</span>
                                    <span className="text-white/60">Courses</span>
                                  </div>
                                  <div className="text-center">
                                    <span className="block">4.9 ★</span>
                                    <span className="text-white/60">Rating</span>
                                  </div>
                               </div>
                               <div className="mt-4 px-3 py-1 bg-white/10 rounded-full text-[8px] font-black uppercase tracking-widest">Preview Now</div>
                            </div>
                          </div>
                          <div className="p-5">
                            <h4 className="font-black text-slate-800 dark:text-white mb-2 line-clamp-1">{course.title}</h4>
                            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                               <span>{course.category}</span>
                               <span className="text-indigo-600 dark:text-indigo-400">${course.price}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>
              <div className="lg:col-span-4 space-y-10">
                 <div className="bg-indigo-600 rounded-[32px] p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                    <h3 className="font-black text-lg mb-4 relative z-10">Gemini Assistant</h3>
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-sm mb-4 min-h-[100px] relative z-10">
                        {aiMessage || "Ask me anything about your current learning path!"}
                    </div>
                    <div className="relative z-10">
                        <input 
                            type="text" 
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAiAsk()}
                            placeholder="Type a question..."
                            className="w-full bg-white/20 border border-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:bg-white/30 transition-all placeholder:text-white/50"
                        />
                        <button onClick={handleAiAsk} disabled={isAiLoading} className="absolute right-3 top-1/2 -translate-y-1/2 text-white">
                          {isAiLoading ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
                        </button>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        );

      case 'my-courses':
        const enrolledCourses = courses.filter(c => user.enrolledCourseIds?.includes(c.id));
        return (
          <div className="space-y-8 opacity-100 transition-opacity duration-500">
            <header>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white">My Enrolled Courses</h1>
              <p className="text-slate-500 dark:text-slate-400">Track your progress and pick up where you left off.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {enrolledCourses.map(course => {
                const progress = calculateProgress(course);
                const isFinished = progress === 100;
                
                return (
                  <div 
                    key={course.id} 
                    onClick={() => setSelectedCourse(course)}
                    className="bg-white dark:bg-slate-900 rounded-[32px] p-2 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group cursor-pointer flex flex-col"
                  >
                    <div className="relative aspect-video rounded-[26px] overflow-hidden mb-5">
                      <img src={course.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      {isFinished && (
                        <div className="absolute inset-0 bg-green-500/20 backdrop-blur-[2px] flex items-center justify-center">
                          <div className="bg-white dark:bg-slate-900 px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 font-black text-green-600 dark:text-green-400 text-xs uppercase tracking-widest">
                            <i className="fa-solid fa-award text-lg"></i>
                            Course Finished
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="px-5 pb-5 flex-1 flex flex-col">
                      <div className="flex justify-between items-center mb-3">
                         <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">{course.category}</span>
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{course.instructorName}</span>
                      </div>
                      <h3 className="font-black text-slate-900 dark:text-white text-lg line-clamp-2 leading-tight mb-6">{course.title}</h3>
                      
                      <div className="mt-auto space-y-3">
                        <div className="flex justify-between items-center">
                           <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Completion</span>
                           <span className={`text-xs font-black ${isFinished ? 'text-green-600 dark:text-green-400' : 'text-indigo-600 dark:text-indigo-400'}`}>{progress}%</span>
                        </div>
                        <AnimatedProgressBar progress={progress} isFinished={isFinished} />
                        <div className="pt-4 flex justify-between items-center gap-2">
                           {isFinished ? (
                             <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full border-green-200 text-green-600 dark:border-green-800 dark:text-green-400"
                              onClick={(e) => {
                                e.stopPropagation();
                                const cert = certificates.find(c => c.courseId === course.id && c.studentId === user.id);
                                if (cert) onViewCertificate?.(cert);
                              }}
                            >
                               <i className="fa-solid fa-award mr-2"></i> Certificate
                             </Button>
                           ) : (
                             <>
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                  {course.modules.flatMap(m => m.lessons).length} Lessons Total
                              </span>
                              <Button variant="outline" size="sm">Continue</Button>
                             </>
                           )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {enrolledCourses.length === 0 && (
                <div className="col-span-full py-20 bg-white dark:bg-slate-900/50 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
                    <i className="fa-solid fa-book-open text-2xl"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">No Courses Enrolled</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto text-sm mt-1">Visit the course catalog to start your learning journey.</p>
                  </div>
                  <Button variant="primary" onClick={() => setActiveView('dashboard')}>Browse Catalog</Button>
                </div>
              )}
            </div>
          </div>
        );

      case 'instructors':
        const instructors = users.filter(u => u.role === UserRole.INSTRUCTOR);
        return (
          <div className="space-y-8 transition-opacity duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white">Instructor Management</h1>
                <p className="text-slate-500 dark:text-slate-400">Review, onboard, and manage your teaching staff.</p>
              </div>
              <Button variant="primary" onClick={() => setIsOnboarding(true)}>
                <i className="fa-solid fa-user-plus mr-2"></i> Add Instructor
              </Button>
            </header>

            {/* Onboarding Modal */}
            {isOnboarding && (
              <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm dark:bg-black/80" onClick={() => setIsOnboarding(false)}></div>
                <div className="relative bg-white dark:bg-slate-900 rounded-[32px] w-full max-w-lg p-8 md:p-10 shadow-2xl transition-all duration-300 border border-slate-100 dark:border-slate-800">
                  <button onClick={() => setIsOnboarding(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <i className="fa-solid fa-xmark text-2xl"></i>
                  </button>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Onboard Instructor</h2>
                  <form onSubmit={handleOnboardSubmit} className="space-y-5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                      <input 
                        required
                        type="text" 
                        value={onboardData.name}
                        onChange={(e) => setOnboardData({...onboardData, name: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                      <input 
                        required
                        type="email" 
                        value={onboardData.email}
                        onChange={(e) => setOnboardData({...onboardData, email: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bio / Expertise</label>
                      <textarea 
                        rows={3}
                        value={onboardData.bio}
                        onChange={(e) => setOnboardData({...onboardData, bio: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white resize-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avatar URL (Optional)</label>
                      <input 
                        type="url" 
                        value={onboardData.avatar}
                        onChange={(e) => setOnboardData({...onboardData, avatar: e.target.value})}
                        placeholder="https://picsum.photos/200"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                      />
                    </div>
                    <Button type="submit" size="lg" className="w-full">Create Instructor Account</Button>
                  </form>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {instructors.map(instr => {
                const instructorCourses = courses.filter(c => c.instructorId === instr.id);
                return (
                  <div 
                    key={instr.id} 
                    onClick={() => user.role === UserRole.ADMIN && setSelectedInstructor(instr)}
                    className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group cursor-pointer overflow-hidden relative"
                  >
                    {instr.isVerified && (
                      <div className="absolute top-4 right-4 z-20 bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg">
                        <i className="fa-solid fa-circle-check"></i> Verified
                      </div>
                    )}

                    <div className="absolute inset-0 bg-indigo-600 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white p-8 z-10">
                       <h4 className="font-black text-xl mb-6">Expertise Overview</h4>
                       <div className="grid grid-cols-2 gap-8 w-full">
                          <div className="text-center">
                             <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-1">Courses</p>
                             <p className="text-3xl font-black">{instructorCourses.length}</p>
                          </div>
                          <div className="text-center">
                             <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-1">Students</p>
                             <p className="text-3xl font-black">{instructorCourses.reduce((acc, c) => acc + c.studentsCount, 0)}</p>
                          </div>
                          <div className="text-center">
                             <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-1">Avg Rating</p>
                             <p className="text-3xl font-black">4.9 ★</p>
                          </div>
                          <div className="text-center">
                             <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-1">Years exp.</p>
                             <p className="text-3xl font-black">8+</p>
                          </div>
                       </div>
                       <div className="mt-8 px-4 py-2 border border-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white/10">Click for details</div>
                    </div>

                    <div className="flex items-center gap-5 mb-6">
                      <img src={instr.avatar} className="w-20 h-20 rounded-[24px] object-cover border-4 border-slate-50 dark:border-slate-800 shadow-lg" alt={instr.name} />
                      <div>
                        <h3 className="font-black text-xl text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{instr.name}</h3>
                        <p className="text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest">Master Instructor</p>
                      </div>
                    </div>
                    <div className="space-y-4 mb-8">
                      <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 leading-relaxed">{instr.bio || "Passionate about sharing knowledge and empowering the next generation of creators."}</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                          <div className="text-[10px] font-black text-slate-400 uppercase">Courses</div>
                          <div className="font-black text-slate-900 dark:text-white">{instructorCourses.length}</div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                          <div className="text-[10px] font-black text-slate-400 uppercase">Verification</div>
                          <div className={`font-black ${instr.isVerified ? 'text-green-500' : 'text-slate-400'}`}>
                            {instr.isVerified ? 'Verified' : 'Pending'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              <div 
                onClick={() => setIsOnboarding(true)}
                className="bg-white dark:bg-slate-900/50 rounded-[32px] p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-4 group hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors cursor-pointer"
              >
                <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/40 group-hover:text-indigo-600 transition-all">
                  <i className="fa-solid fa-plus text-2xl"></i>
                </div>
                <div>
                   <h4 className="font-black text-slate-900 dark:text-white">Invite Expert</h4>
                   <p className="text-slate-400 text-xs">Send onboard invitation</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'students':
        const students = users.filter(u => u.role === UserRole.STUDENT);
        return (
          <div className="space-y-8 opacity-100 transition-opacity duration-500">
            <header>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white">Student Directory</h1>
              <p className="text-slate-500 dark:text-slate-400">Track student progress and performance across your campus.</p>
            </header>

            <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800">
                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Student</th>
                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Email</th>
                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {students.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/30 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <img src={s.avatar} className="w-10 h-10 rounded-xl" alt={s.name} />
                          <span className="font-bold text-slate-900 dark:text-white">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-slate-500 dark:text-slate-400 text-sm">{s.email}</td>
                      <td className="px-8 py-5">
                        <span className="px-3 py-1 bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 text-[10px] font-black uppercase rounded-full">Active</span>
                      </td>
                      <td className="px-8 py-5">
                        <button className="text-slate-400 hover:text-indigo-600 transition-colors"><i className="fa-solid fa-ellipsis-vertical"></i></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="max-w-4xl mx-auto space-y-10 opacity-100 transition-opacity duration-500">
            <header>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">System Settings</h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Customize your EduPro AI experience.</p>
            </header>

            <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
              <div className="p-8 md:p-12 space-y-10">
                <section className="space-y-6 pb-10 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">Appearance</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">Toggle between light and dark theme.</p>
                    </div>
                    <button 
                      onClick={toggleDarkMode}
                      className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none ${darkMode ? 'bg-indigo-600' : 'bg-slate-200'}`}
                    >
                      <span className="sr-only">Toggle Dark Mode</span>
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${darkMode ? 'translate-x-9' : 'translate-x-1'} flex items-center justify-center`}
                      >
                        <i className={`fa-solid ${darkMode ? 'fa-moon text-indigo-600' : 'fa-sun text-amber-500'} text-[10px]`}></i>
                      </span>
                    </button>
                  </div>
                </section>
                <div className="pt-6 flex justify-end gap-4">
                   <Button variant="primary">Save Preferences</Button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'manage-courses':
        return (
          <div className="space-y-12 transition-opacity duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">Course Management</h1>
                <p className="text-slate-500 dark:text-slate-400">Create and curate world-class content with AI or manually.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => {
                   setEditingCourseId(null);
                   setWizardStep(1);
                   setManualCourseData({
                      title: '', description: '', price: '', thumbnail: '', category: 'Development', instructorName: user.name, modules: []
                   });
                   setActiveView('manual-course-gen');
                }}>
                  <i className="fa-solid fa-pen-to-square mr-2"></i> Create Manual
                </Button>
                <Button variant="primary" onClick={() => setActiveView('ai-course-gen')}>
                  <i className="fa-solid fa-wand-magic-sparkles mr-2"></i> AI Architect
                </Button>
              </div>
            </header>

            <section className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                   <i className="fa-solid fa-database text-xl"></i>
                </div>
                <div>
                   <h2 className="text-xl font-black text-slate-900 dark:text-white">Data Management</h2>
                   <p className="text-sm text-slate-500 dark:text-slate-400">Import or export your course library as JSON files.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  onClick={handleExportJSON}
                  className="group p-6 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer flex items-center gap-4"
                >
                   <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center shadow-sm text-slate-400 group-hover:text-indigo-600 transition-colors">
                      <i className="fa-solid fa-download"></i>
                   </div>
                   <div className="flex-1">
                      <h4 className="font-bold text-slate-900 dark:text-white">Export Library</h4>
                      <p className="text-xs text-slate-500">Download courses as JSON</p>
                   </div>
                </div>

                <div 
                  onClick={handleImportClick}
                  className="group p-6 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer flex items-center gap-4"
                >
                   <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center shadow-sm text-slate-400 group-hover:text-indigo-600 transition-colors">
                      <i className="fa-solid fa-upload"></i>
                   </div>
                   <div className="flex-1">
                      <h4 className="font-bold text-slate-900 dark:text-white">Import Library</h4>
                      <p className="text-xs text-slate-500">Upload JSON course file</p>
                   </div>
                   <input 
                      type="file" 
                      accept=".json" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      className="hidden" 
                   />
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.filter(c => user.role === UserRole.ADMIN || c.instructorId === user.id).map(course => (
                <div key={course.id} className="bg-white dark:bg-slate-900 rounded-[32px] p-2 border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300">
                  <div className="relative aspect-video rounded-[26px] overflow-hidden mb-4">
                    <img src={course.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-4 left-4 bg-white/95 dark:bg-slate-900/95 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 shadow-lg">
                      {course.category}
                    </div>
                  </div>
                  <div className="px-5 pb-5 space-y-4 flex-1 flex flex-col">
                    <h3 className="font-black text-slate-900 dark:text-white text-lg line-clamp-2 leading-tight">{course.title}</h3>
                    <div className="flex justify-between items-center text-sm font-bold mt-auto mb-4">
                       <span className="text-slate-400">{course.studentsCount} Students</span>
                       <span className="text-indigo-600 dark:text-indigo-400">${course.price}</span>
                    </div>
                    <div className="flex gap-2 pt-4 border-t border-slate-50 dark:border-slate-800">
                       <Button 
                        variant="outline" 
                        className="flex-1" 
                        size="sm"
                        onClick={() => handleEditCourse(course)}
                       >
                         Edit
                       </Button>
                       <Button 
                         variant="danger" 
                         className="flex-1" 
                         size="sm"
                         onClick={() => handleDeleteCourseWithConfirm(course.id, course.title)}
                        >
                         <i className="fa-solid fa-trash-can mr-2"></i> Delete
                       </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'manual-course-gen':
        const wizardSteps = [
          { step: 1, label: 'Essentials', icon: 'fa-info-circle' },
          { step: 2, label: 'Structure', icon: 'fa-layer-group' },
          { step: 3, label: 'Content', icon: 'fa-file-lines' }
        ];

        return (
          <div className="max-w-5xl mx-auto space-y-8 pb-20 opacity-100 transition-opacity duration-300">
            <header className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-center md:text-left">
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                   {editingCourseId ? 'Update Curriculum' : 'Course Wizard'}
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                   Follow the steps to build your educational experience.
                </p>
              </div>
              
              {/* Wizard Nav */}
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-[20px] border border-slate-200 dark:border-slate-800">
                {wizardSteps.map((s) => (
                  <div key={s.step} className="flex items-center">
                    <div 
                      className={`flex items-center gap-2 px-4 py-2 rounded-[14px] transition-all ${
                        wizardStep === s.step 
                          ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm font-black' 
                          : wizardStep > s.step ? 'text-green-500 opacity-60' : 'text-slate-400 opacity-40 font-bold'
                      }`}
                    >
                      <i className={`fa-solid ${wizardStep > s.step ? 'fa-circle-check' : s.icon}`}></i>
                      <span className="text-[10px] uppercase tracking-widest hidden sm:inline">{s.label}</span>
                    </div>
                    {s.step < 3 && <div className="w-4 h-px bg-slate-300 dark:bg-slate-700 mx-1"></div>}
                  </div>
                ))}
              </div>

              <Button variant="ghost" size="sm" onClick={() => {
                 setActiveView('manage-courses');
                 setEditingCourseId(null);
                 setWizardStep(1);
              }}>
                <i className="fa-solid fa-xmark mr-2"></i> Exit Wizard
              </Button>
            </header>

            <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
              <div className="p-8 sm:p-12">
                {/* Step 1: Essentials */}
                {wizardStep === 1 && (
                  <div className="space-y-10 transition-opacity duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                      <div className="space-y-6">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white">Basic Information</h3>
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Course Title</label>
                            <input 
                              required
                              type="text" 
                              placeholder="e.g. Master React in 30 Days"
                              value={manualCourseData.title}
                              onChange={(e) => setManualCourseData({...manualCourseData, title: e.target.value})}
                              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white transition-all"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subtitle / Short Description</label>
                            <textarea 
                              rows={3}
                              placeholder="Describe the value of this course..."
                              value={manualCourseData.description}
                              onChange={(e) => setManualCourseData({...manualCourseData, description: e.target.value})}
                              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white transition-all resize-none"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white">Pricing & Categorization</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Price ($)</label>
                            <input 
                              required
                              type="number" 
                              step="0.01"
                              placeholder="49.99"
                              value={manualCourseData.price}
                              onChange={(e) => setManualCourseData({...manualCourseData, price: e.target.value})}
                              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white transition-all"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                            <select 
                              value={manualCourseData.category}
                              onChange={(e) => setManualCourseData({...manualCourseData, category: e.target.value})}
                              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white transition-all appearance-none cursor-pointer"
                            >
                              <option>Development</option>
                              <option>Design</option>
                              <option>Business</option>
                              <option>Artificial Intelligence</option>
                            </select>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Thumbnail Image URL</label>
                          <input 
                            type="url" 
                            placeholder="https://images.unsplash.com/photo..."
                            value={manualCourseData.thumbnail}
                            onChange={(e) => setManualCourseData({...manualCourseData, thumbnail: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white transition-all"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end border-t border-slate-50 dark:border-slate-800 pt-8">
                      <Button size="lg" className="px-12" onClick={() => setWizardStep(2)}>
                        Next Step: Curriculum <i className="fa-solid fa-arrow-right ml-2"></i>
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 2: Curriculum Structure */}
                {wizardStep === 2 && (
                  <div className="space-y-10 transition-opacity duration-500">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white">Curriculum Skeleton</h3>
                        <p className="text-sm text-slate-400">Drag and drop to reorder modules and lessons. Changes are reflected immediately.</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={addModule}>
                        <i className="fa-solid fa-plus mr-2"></i> Add Module
                      </Button>
                    </div>

                    <DragDropContext onDragEnd={handleDragEnd}>
                      <StrictModeDroppable droppableId="modules" type="module">
                        {(provided: any) => (
                          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-6">
                            {manualCourseData.modules.map((module, mIdx) => (
                              <Draggable key={module.id} draggableId={module.id} index={mIdx}>
                                {(provided: any) => (
                                  <div 
                                    ref={provided.innerRef} 
                                    {...provided.draggableProps} 
                                    className="border border-slate-100 dark:border-slate-800 rounded-[28px] overflow-hidden bg-slate-50/30 dark:bg-slate-950/30 shadow-sm"
                                  >
                                    <div className="p-5 flex items-center justify-between gap-4">
                                      <div className="flex items-center gap-3 flex-1">
                                        <div {...provided.dragHandleProps} className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-lg cursor-grab active:cursor-grabbing">
                                          <i className="fa-solid fa-grip-vertical text-white/50 text-[10px] mr-1"></i>
                                          {mIdx + 1}
                                        </div>
                                        <input 
                                          type="text" 
                                          placeholder="Module Title"
                                          value={module.title}
                                          onChange={(e) => {
                                            const updatedModules = [...manualCourseData.modules];
                                            updatedModules[mIdx].title = e.target.value;
                                            setManualCourseData({ ...manualCourseData, modules: updatedModules });
                                          }}
                                          className="flex-1 bg-transparent font-black text-lg text-slate-900 dark:text-white focus:outline-none focus:ring-b focus:ring-indigo-500 px-1"
                                        />
                                      </div>
                                      <button 
                                        onClick={() => {
                                          const updatedModules = [...manualCourseData.modules];
                                          updatedModules.splice(mIdx, 1);
                                          setManualCourseData({...manualCourseData, modules: updatedModules});
                                        }}
                                        className="text-slate-300 hover:text-red-500 transition-colors"
                                      >
                                         <i className="fa-solid fa-trash-can"></i>
                                      </button>
                                    </div>

                                    {/* Lessons Droppable within Module */}
                                    <StrictModeDroppable droppableId={`lessons-${module.id}`} type="lesson">
                                      {(lessonProvided: any) => (
                                        <div 
                                          {...lessonProvided.droppableProps} 
                                          ref={lessonProvided.innerRef} 
                                          className="px-5 pb-5 space-y-3 min-h-[20px]"
                                        >
                                          {module.lessons.map((lesson, lIdx) => (
                                            <Draggable key={lesson.id} draggableId={lesson.id} index={lIdx}>
                                              {(lProvided: any) => (
                                                <div 
                                                  ref={lProvided.innerRef}
                                                  {...lProvided.draggableProps}
                                                  className="flex items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 group transition-shadow hover:shadow-md"
                                                >
                                                  <div {...lProvided.dragHandleProps} className="text-slate-200 dark:text-slate-700 cursor-grab active:cursor-grabbing hover:text-indigo-400 transition-colors">
                                                    <i className="fa-solid fa-grip-vertical"></i>
                                                  </div>
                                                  <span className="text-[10px] font-black text-slate-400 w-12">L{lIdx + 1}</span>
                                                  <input 
                                                    type="text" 
                                                    placeholder="Lesson Title"
                                                    value={lesson.title}
                                                    onChange={(e) => {
                                                      const updatedModules = [...manualCourseData.modules];
                                                      updatedModules[mIdx].lessons[lIdx].title = e.target.value;
                                                      setManualCourseData({ ...manualCourseData, modules: updatedModules });
                                                    }}
                                                    className="flex-1 bg-transparent font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
                                                  />
                                                  <button 
                                                    onClick={() => {
                                                      const updatedModules = [...manualCourseData.modules];
                                                      updatedModules[mIdx].lessons.splice(lIdx, 1);
                                                      setManualCourseData({...manualCourseData, modules: updatedModules});
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-all"
                                                  >
                                                    <i className="fa-solid fa-xmark"></i>
                                                  </button>
                                                </div>
                                              )}
                                            </Draggable>
                                          ))}
                                          {lessonProvided.placeholder}
                                          <button 
                                            onClick={() => addLesson(mIdx)}
                                            className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 hover:text-indigo-600 hover:border-indigo-400 transition-all text-xs font-black uppercase tracking-widest bg-white/50 dark:bg-slate-900/50"
                                          >
                                            <i className="fa-solid fa-plus mr-2"></i> Add Lesson Structure
                                          </button>
                                        </div>
                                      )}
                                    </StrictModeDroppable>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </StrictModeDroppable>
                    </DragDropContext>

                    {manualCourseData.modules.length === 0 && (
                      <div className="py-20 text-center border-4 border-dashed border-slate-50 dark:border-slate-950 rounded-[40px] flex flex-col items-center gap-4">
                         <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300">
                           <i className="fa-solid fa-diagram-project text-2xl"></i>
                         </div>
                         <div className="space-y-1">
                            <p className="font-black text-slate-900 dark:text-white">Curriculum is Empty</p>
                            <p className="text-sm text-slate-400">Add your first module to get started.</p>
                         </div>
                         <Button variant="outline" size="sm" onClick={addModule}>Begin Designing</Button>
                      </div>
                    )}

                    <div className="flex justify-between border-t border-slate-50 dark:border-slate-800 pt-8">
                      <Button variant="outline" size="lg" onClick={() => setWizardStep(1)}>
                        <i className="fa-solid fa-arrow-left mr-2"></i> Back
                      </Button>
                      <Button size="lg" className="px-12" onClick={() => setWizardStep(3)} disabled={manualCourseData.modules.length === 0}>
                        Next Step: Detailed Content <i className="fa-solid fa-arrow-right ml-2"></i>
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Detailed Content */}
                {wizardStep === 3 && (
                  <div className="space-y-10 transition-opacity duration-500">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white">Lesson Content Authoring</h3>
                        <p className="text-sm text-slate-400">Select a lesson to add text, media, and instructional details.</p>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                        <i className="fa-solid fa-wand-magic-sparkles"></i> AI Refine Enabled
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      {/* Sub-nav for lessons */}
                      <div className="lg:col-span-3 space-y-6 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
                         {manualCourseData.modules.map((m, mIdx) => (
                           <div key={m.id} className="space-y-2">
                             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">M{mIdx + 1}: {m.title}</h4>
                             {m.lessons.map((l, lIdx) => {
                               const isActive = activeEditLessonIndex?.moduleIdx === mIdx && activeEditLessonIndex?.lessonIdx === lIdx;
                               const hasContent = l.content && l.content.length > 20;
                               return (
                                 <button 
                                   key={l.id}
                                   onClick={() => setActiveEditLessonIndex({ moduleIdx: mIdx, lessonIdx: lIdx })}
                                   className={`w-full text-left p-4 rounded-2xl text-sm transition-all flex items-center justify-between gap-3 ${
                                     isActive 
                                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none font-black' 
                                      : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800'
                                   }`}
                                 >
                                   <div className="flex items-center gap-3 overflow-hidden">
                                     {isActive ? <i className="fa-solid fa-pen-nib"></i> : <i className="fa-solid fa-play text-[10px]"></i>}
                                     <span className="truncate">{l.title}</span>
                                   </div>
                                   {hasContent && !isActive && <i className="fa-solid fa-circle-check text-green-500"></i>}
                                 </button>
                               )
                             })}
                           </div>
                         ))}
                      </div>

                      {/* Main Editor Area */}
                      <div className="lg:col-span-9">
                        {activeEditLessonIndex ? (
                          <div className="space-y-6 transition-opacity duration-300">
                             <div className="space-y-1">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lesson Video URL (Optional)</label>
                               <input 
                                 type="text" 
                                 placeholder="Paste YouTube or Vimeo link..."
                                 value={manualCourseData.modules[activeEditLessonIndex.moduleIdx].lessons[activeEditLessonIndex.lessonIdx].videoUrl || ''}
                                 onChange={(e) => {
                                   const updatedModules = [...manualCourseData.modules];
                                   updatedModules[activeEditLessonIndex.moduleIdx].lessons[activeEditLessonIndex.lessonIdx].videoUrl = e.target.value;
                                   setManualCourseData({...manualCourseData, modules: updatedModules});
                                 }}
                                 className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                               />
                             </div>
                             <div className="space-y-1">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lesson Body</label>
                               <RichTextEditor 
                                 value={manualCourseData.modules[activeEditLessonIndex.moduleIdx].lessons[activeEditLessonIndex.lessonIdx].content || ''}
                                 placeholder="Build your lecture notes here. Use the AI Refine tool to polish your teaching style..."
                                 onChange={(val) => {
                                   const updatedModules = [...manualCourseData.modules];
                                   updatedModules[activeEditLessonIndex.moduleIdx].lessons[activeEditLessonIndex.lessonIdx].content = val;
                                   setManualCourseData({...manualCourseData, modules: updatedModules});
                                 }}
                               />
                             </div>
                          </div>
                        ) : (
                          <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-12 bg-slate-50/50 dark:bg-slate-950/50 rounded-[40px] border-2 border-dashed border-slate-100 dark:border-slate-800">
                             <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-3xl flex items-center justify-center text-slate-200 dark:text-slate-800 mb-6 shadow-sm">
                               <i className="fa-solid fa-i-cursor text-4xl"></i>
                             </div>
                             <h4 className="text-xl font-black text-slate-900 dark:text-white">Editor is Ready</h4>
                             <p className="text-slate-400 max-w-sm mt-2">Select a lesson from the sidebar to begin building your instructional content.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between border-t border-slate-50 dark:border-slate-800 pt-8">
                      <Button variant="outline" size="lg" onClick={() => setWizardStep(2)}>
                        <i className="fa-solid fa-arrow-left mr-2"></i> Back
                      </Button>
                      <Button variant="primary" size="lg" className="px-16" onClick={handleManualCourseSubmit}>
                        {editingCourseId ? 'Finish & Save Changes' : 'Finalize & Publish Course'} <i className="fa-solid fa-check-double ml-2"></i>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'ai-course-gen':
        return (
          <div className="max-w-4xl mx-auto space-y-8 transition-opacity duration-500 text-center">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white">AI Course Architect</h1>
            <div className="bg-white dark:bg-slate-900 rounded-[40px] p-10 border border-slate-100 dark:border-slate-800 shadow-xl space-y-8">
               <input 
                  type="text" 
                  value={newCourseTopic}
                  onChange={(e) => setNewCourseTopic(e.target.value)}
                  placeholder="Enter a topic (e.g. Mastering Python for Data Science)..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                />
                <Button 
                  size="lg" 
                  isLoading={isGeneratingCourse}
                  onClick={handleGenerateCourse}
                  className="w-full"
                >
                  Generate Professional Outline
                </Button>

                {generatedOutline && (
                  <div className="mt-8 p-8 bg-indigo-50 dark:bg-indigo-950/20 rounded-[32px] text-left border border-indigo-100 dark:border-indigo-900/50">
                    <h2 className="text-2xl font-black mb-2 text-indigo-900 dark:text-indigo-100">{generatedOutline.title}</h2>
                    <p className="text-indigo-700 dark:text-indigo-300 mb-6 text-sm">{generatedOutline.description}</p>
                    <Button variant="primary" onClick={() => {
                        const newCourse: Course = {
                          id: `c-ai-${Date.now()}`,
                          title: generatedOutline.title,
                          description: generatedOutline.description,
                          instructorId: user.id,
                          instructorName: user.name,
                          price: 99.99,
                          thumbnail: `https://picsum.photos/seed/${Date.now()}/800/450`,
                          category: 'Artificial Intelligence',
                          rating: 5.0,
                          studentsCount: 0,
                          duration: 'AI Generated',
                          modules: generatedOutline.modules.map((m: any, idx: number) => ({
                             id: `m-ai-${idx}-${Date.now()}`,
                             title: m.title,
                             lessons: m.lessons.map((l: string, lidx: number) => ({
                                id: `l-ai-${idx}-${lidx}-${Date.now()}`,
                                title: l,
                                duration: '10:00',
                                content: `<p>Auto-generated draft for <strong>${l}</strong>. Edit this content to provide more details.</p>`
                             }))
                          })),
                          reviews: []
                        };
                        onAddCourse(newCourse);
                        setActiveView('manage-courses');
                    }}>Approve & Load into Editor</Button>
                  </div>
                )}
            </div>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-700">
              <i className="fa-solid fa-compass-drafting text-4xl"></i>
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">Feature Coming Soon</h2>
            <Button variant="outline" size="lg" onClick={() => setActiveView('dashboard')}>Return Home</Button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Sidebar 
        role={user.role} 
        activeView={activeView} 
        onViewChange={(v) => {
          setActiveView(v);
          setSelectedCourse(null);
          setSelectedInstructor(null);
          setEditingCourseId(null);
          setWizardStep(1);
        }} 
        onLogout={onLogout} 
      />
      
      <main className="md:ml-64 p-6 md:p-12 pt-24 md:pt-12 min-h-screen">
        <div className="max-w-7xl mx-auto pb-12">
          {renderViewContent()}
        </div>
      </main>

      <div className="md:hidden fixed top-0 left-0 right-0 h-20 glass z-20 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
              <i className="fa-solid fa-graduation-cap"></i>
            </div>
            <span className="font-black text-lg dark:text-white">EduPro AI</span>
         </div>
         <button className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-900 dark:text-white">
            <i className="fa-solid fa-bars"></i>
         </button>
      </div>
    </div>
  );
};

export default DashboardView;