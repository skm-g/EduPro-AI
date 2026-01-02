
export enum UserRole {
  ADMIN = 'ADMIN',
  INSTRUCTOR = 'INSTRUCTOR',
  STUDENT = 'STUDENT',
  GUEST = 'GUEST'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  bio?: string;
  isVerified?: boolean;
  completedCourseIds?: string[];
  enrolledCourseIds?: string[];
  completedLessonIds?: string[];
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Certificate {
  rollNumber: string;
  courseId: string;
  courseTitle: string;
  studentId: string;
  studentName: string;
  completionDate: string;
  instructorName: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  instructorName: string;
  price: number;
  thumbnail: string;
  category: string;
  rating: number;
  studentsCount: number;
  duration: string;
  modules: Module[];
  reviews?: Review[];
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl?: string;
  content?: string;
}

export interface AppState {
  currentUser: User | null;
  courses: Course[];
  users: User[];
  certificates: Certificate[]; // Track issued certificates
  activeView: string;
}
