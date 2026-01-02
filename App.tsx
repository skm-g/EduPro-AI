
import React, { useState, useEffect } from 'react';
import { AppState, User, UserRole, Course, Certificate } from './types';
import { MOCK_COURSES, MOCK_USERS } from './constants';
import HomeView from './views/HomeView';
import DashboardView from './views/DashboardView';
import AuthView from './views/AuthView';
import Button from './components/Button';
import CoursePreviewModal from './components/CoursePreviewModal';
import CertificateModal from './components/CertificateModal';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    currentUser: null,
    courses: MOCK_COURSES,
    users: MOCK_USERS,
    certificates: [],
    activeView: 'home'
  });

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('edupro_dark_mode');
    return saved === 'true';
  });

  const [previewCourse, setPreviewCourse] = useState<Course | null>(null);
  const [viewingCertificate, setViewingCertificate] = useState<Certificate | null>(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('edupro_dark_mode', String(darkMode));
  }, [darkMode]);

  // Persistence (Simulated)
  useEffect(() => {
    const savedUser = localStorage.getItem('edupro_user');
    const savedCerts = localStorage.getItem('edupro_certificates');
    
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setState(prev => ({ 
        ...prev, 
        currentUser: user, 
        activeView: 'dashboard',
        certificates: savedCerts ? JSON.parse(savedCerts) : []
      }));
    }
  }, []);

  const handleLogin = (user: User) => {
    localStorage.setItem('edupro_user', JSON.stringify(user));
    setState(prev => ({ ...prev, currentUser: user, activeView: 'dashboard' }));
  };

  const handleLogout = () => {
    localStorage.removeItem('edupro_user');
    setState(prev => ({ ...prev, currentUser: null, activeView: 'home' }));
  };

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const handleAddCourse = (newCourse: Course) => {
    setState(prev => ({
      ...prev,
      courses: [newCourse, ...prev.courses]
    }));
  };

  const handleDeleteCourse = (courseId: string) => {
    setState(prev => ({
      ...prev,
      courses: prev.courses.filter(c => c.id !== courseId)
    }));
  };

  const handleOnboardInstructor = (instructorData: Partial<User>) => {
    const newUser: User = {
      id: `u-${Date.now()}`,
      name: instructorData.name || 'New Instructor',
      email: instructorData.email || '',
      role: UserRole.INSTRUCTOR,
      avatar: instructorData.avatar || `https://picsum.photos/seed/${Date.now()}/200`,
      bio: instructorData.bio || '',
      isVerified: false,
      completedCourseIds: [],
      enrolledCourseIds: [],
      completedLessonIds: []
    };
    
    setState(prev => ({
      ...prev,
      users: [...prev.users, newUser]
    }));
  };

  const handleToggleVerifyInstructor = (userId: string) => {
    setState(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === userId ? { ...u, isVerified: !u.isVerified } : u)
    }));
  };

  const handleMarkCourseComplete = (courseId: string) => {
    if (!state.currentUser) return;

    const course = state.courses.find(c => c.id === courseId);
    if (!course) return;

    // Generate Roll Number: EP-YEAR-RANDOM
    const rollNumber = `EP-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    const newCert: Certificate = {
      rollNumber,
      courseId: course.id,
      courseTitle: course.title,
      studentId: state.currentUser.id,
      studentName: state.currentUser.name,
      completionDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      instructorName: course.instructorName
    };

    const updatedUser = {
      ...state.currentUser,
      completedCourseIds: [...(state.currentUser.completedCourseIds || []), courseId]
    };

    const updatedCerts = [...state.certificates, newCert];
    
    localStorage.setItem('edupro_user', JSON.stringify(updatedUser));
    localStorage.setItem('edupro_certificates', JSON.stringify(updatedCerts));

    setState(prev => ({
      ...prev,
      currentUser: updatedUser,
      certificates: updatedCerts
    }));

    setViewingCertificate(newCert);
  };

  const handleImportCourses = (importedCourses: Course[]) => {
    setState(prev => {
      const courseMap = new Map(prev.courses.map(c => [c.id, c]));
      importedCourses.forEach(c => courseMap.set(c.id, c));
      
      return {
        ...prev,
        courses: Array.from(courseMap.values())
      };
    });
  };

  const renderView = () => {
    if (state.activeView === 'auth') {
      return (
        <AuthView 
          onLogin={handleLogin} 
          onBack={() => setState(prev => ({ ...prev, activeView: 'home' }))} 
        />
      );
    }

    if (state.activeView === 'home' || !state.currentUser) {
      return (
        <HomeView 
          courses={state.courses} 
          certificates={state.certificates}
          onLoginClick={() => setState(prev => ({ ...prev, activeView: 'auth' }))}
          onCourseClick={(course) => setPreviewCourse(course)}
          onPreviewClick={(course) => setPreviewCourse(course)}
        />
      );
    }

    return (
      <DashboardView 
        user={state.currentUser} 
        courses={state.courses}
        users={state.users}
        certificates={state.certificates}
        onLogout={handleLogout}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        onAddCourse={handleAddCourse}
        onDeleteCourse={handleDeleteCourse}
        onOnboardInstructor={handleOnboardInstructor}
        onToggleVerifyInstructor={handleToggleVerifyInstructor}
        onMarkCourseComplete={handleMarkCourseComplete}
        onViewCertificate={(cert) => setViewingCertificate(cert)}
        onImportCourses={handleImportCourses}
        onPreviewCourse={(course) => setPreviewCourse(course)}
      />
    );
  };

  return (
    <div className="antialiased font-sans transition-colors duration-300">
      {renderView()}

      {/* Global Preview Modal */}
      {previewCourse && (
        <CoursePreviewModal 
          course={previewCourse} 
          onClose={() => setPreviewCourse(null)} 
        />
      )}

      {/* Certificate Modal */}
      {viewingCertificate && (
        <CertificateModal
          certificate={viewingCertificate}
          onClose={() => setViewingCertificate(null)}
        />
      )}
    </div>
  );
};

export default App;
