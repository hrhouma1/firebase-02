import {Request, Response} from "express";
import {db} from "../firebase";
import {Course, UserRole} from "../types";

export async function createCourse(req: Request, res: Response) {
  const uid = (req as any).uid as string;
  const userData = (req as any).userData;
  const {title, description, maxStudents} = req.body || {};

  if (!title || typeof title !== "string") {
    return res.status(422).json({error: "title is required (string)"});
  }
  if (!description || typeof description !== "string") {
    return res.status(422).json({error: "description is required (string)"});
  }
  if (!maxStudents || typeof maxStudents !== "number") {
    return res.status(422).json({
      error: "maxStudents is required (number)",
    });
  }

  try {
    const doc = db.collection("courses").doc();
    const now = Date.now();

    const course: Course = {
      id: doc.id,
      title,
      description,
      professorUid: uid,
      professorName: `${userData.firstName} ${userData.lastName}`,
      maxStudents,
      currentStudents: 0,
      createdAt: now,
      updatedAt: now,
    };

    await doc.set(course);
    return res.status(201).json({
      data: course,
      message: "Course created successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to create course",
      message: error.message,
    });
  }
}

export async function getCourses(req: Request, res: Response) {
  try {
    const snapshot = await db.collection("courses")
      .orderBy("createdAt", "desc")
      .get();

    const courses = snapshot.docs.map((doc) => doc.data());

    return res.status(200).json({data: courses, count: courses.length});
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to fetch courses",
      message: error.message,
    });
  }
}

export async function getCourse(req: Request, res: Response) {
  const {id} = req.params;

  try {
    const doc = await db.collection("courses").doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({error: "Course not found"});
    }

    return res.status(200).json({data: doc.data()});
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to fetch course",
      message: error.message,
    });
  }
}

export async function updateCourse(req: Request, res: Response) {
  const uid = (req as any).uid as string;
  const userRole = (req as any).userRole as UserRole;
  const {id} = req.params;
  const {title, description, maxStudents} = req.body || {};

  try {
    const docRef = db.collection("courses").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({error: "Course not found"});
    }

    const course = doc.data();

    // Seul le professeur propriétaire ou un admin peut modifier
    if (course?.professorUid !== uid && userRole !== UserRole.ADMIN) {
      return res.status(403).json({
        error: "Forbidden",
        message: "Only the course professor or admin can update this course",
      });
    }

    const updates: any = {updatedAt: Date.now()};

    if (title && typeof title === "string") {
      updates.title = title;
    }
    if (description && typeof description === "string") {
      updates.description = description;
    }
    if (maxStudents && typeof maxStudents === "number") {
      updates.maxStudents = maxStudents;
    }

    await docRef.update(updates);
    const updatedDoc = await docRef.get();

    return res.status(200).json({
      data: updatedDoc.data(),
      message: "Course updated successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to update course",
      message: error.message,
    });
  }
}

export async function deleteCourse(req: Request, res: Response) {
  const uid = (req as any).uid as string;
  const userRole = (req as any).userRole as UserRole;
  const {id} = req.params;

  try {
    const docRef = db.collection("courses").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({error: "Course not found"});
    }

    const course = doc.data();

    // Seul le professeur propriétaire ou un admin peut supprimer
    if (course?.professorUid !== uid && userRole !== UserRole.ADMIN) {
      return res.status(403).json({
        error: "Forbidden",
        message: "Only the course professor or admin can delete this course",
      });
    }

    await docRef.delete();

    return res.status(200).json({
      message: "Course deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to delete course",
      message: error.message,
    });
  }
}

export async function getMyCourses(req: Request, res: Response) {
  const uid = (req as any).uid as string;

  try {
    const snapshot = await db.collection("courses")
      .where("professorUid", "==", uid)
      .orderBy("createdAt", "desc")
      .get();

    const courses = snapshot.docs.map((doc) => doc.data());

    return res.status(200).json({data: courses, count: courses.length});
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to fetch courses",
      message: error.message,
    });
  }
}

