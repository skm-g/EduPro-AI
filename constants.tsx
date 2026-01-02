
import React from 'react';
import { Course, User, UserRole } from './types';

export const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@edupro.ai',
    role: UserRole.ADMIN,
    avatar: 'https://picsum.photos/seed/admin/200'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@edupro.ai',
    role: UserRole.INSTRUCTOR,
    avatar: 'https://picsum.photos/seed/instructor1/200',
    bio: 'Senior Full Stack Developer with 10 years of experience.',
    isVerified: true
  },
  {
    id: '3',
    name: 'Alex Chen',
    email: 'alex.student@gmail.com',
    role: UserRole.STUDENT,
    avatar: 'https://picsum.photos/seed/student/200',
    completedCourseIds: ['c2'],
    enrolledCourseIds: ['c1', 'c2', 'c3'],
    completedLessonIds: ['l1'] // Completed first lesson of course c1
  }
];

export const MOCK_COURSES: Course[] = [
  {
    id: 'c1',
    title: 'Advanced React Architecture',
    description: 'Learn to build scalable enterprise applications with React 18 and Next.js.',
    instructorId: '2',
    instructorName: 'Sarah Johnson',
    price: 49.99,
    thumbnail: 'https://picsum.photos/seed/react/800/450',
    category: 'Development',
    rating: 4.8,
    studentsCount: 1240,
    duration: '12h 30m',
    modules: [
      {
        id: 'm1',
        title: 'Introduction to Architecture',
        lessons: [
          { id: 'l1', title: 'Why Architecture Matters', duration: '10:00' },
          { id: 'l2', title: 'Project Structure', duration: '15:20' }
        ]
      },
      {
        id: 'm2',
        title: 'Advanced Patterns',
        lessons: [
          { id: 'l3', title: 'HOC vs Hooks', duration: '20:00' },
          { id: 'l4', title: 'Compound Components', duration: '18:10' }
        ]
      }
    ],
    reviews: [
      {
        id: 'r1',
        userId: '3',
        userName: 'Alex Chen',
        userAvatar: 'https://picsum.photos/seed/student/200',
        rating: 5,
        comment: 'Absolutely phenomenal course. The architecture patterns are industry standard.',
        date: '2024-03-15'
      }
    ]
  },
  {
    id: 'c2',
    title: 'Modern UI/UX Design Fundamentals',
    description: 'Master Figma and design principles for the modern web.',
    instructorId: '2',
    instructorName: 'Sarah Johnson',
    price: 29.99,
    thumbnail: 'https://picsum.photos/seed/design/800/450',
    category: 'Design',
    rating: 4.9,
    studentsCount: 850,
    duration: '8h 45m',
    modules: [
      {
        id: 'm1',
        title: 'Design Thinking',
        lessons: [
          { id: 'ld1', title: 'Intro to UX', duration: '12:00' }
        ]
      }
    ],
    reviews: []
  },
  {
    id: 'c3',
    title: 'Full Stack Development with AI',
    description: 'Harness the power of LLMs like Gemini to speed up your development workflow.',
    instructorId: '2',
    instructorName: 'Sarah Johnson',
    price: 79.99,
    thumbnail: 'https://picsum.photos/seed/ai/800/450',
    category: 'Development',
    rating: 5.0,
    studentsCount: 3200,
    duration: '20h 15m',
    modules: [
       {
        id: 'm1',
        title: 'AI Basics',
        lessons: [
          { id: 'la1', title: 'What is an LLM?', duration: '05:00' },
          { id: 'la2', title: 'Prompt Engineering', duration: '15:00' }
        ]
      }
    ],
    reviews: []
  }
];
