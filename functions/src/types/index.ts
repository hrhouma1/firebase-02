export enum UserRole {
  ADMIN = "admin",
  PROFESSOR = "professor",
  STUDENT = "student"
}

export interface User {
  uid: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  createdAt: number;
  updatedAt: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  professorUid: string;
  professorName: string;
  maxStudents: number;
  currentStudents: number;
  createdAt: number;
  updatedAt: number;
}

export interface Enrollment {
  id: string;
  courseId: string;
  studentUid: string;
  studentName: string;
  enrolledAt: number;
  status: "active" | "completed" | "cancelled";
}

export interface Note {
  id: string;
  title: string;
  content: string;
  ownerUid: string;
  createdAt: number;
  updatedAt: number;
}

