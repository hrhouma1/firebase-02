import {Request, Response} from "express";
import {db} from "../firebase";
import {Enrollment} from "../types";

export async function enrollInCourse(req: Request, res: Response) {
  const uid = (req as any).uid as string;
  const userData = (req as any).userData;
  const {courseId} = req.body || {};

  if (!courseId || typeof courseId !== "string") {
    return res.status(422).json({error: "courseId is required (string)"});
  }

  try {
    // Vérifier que le cours existe
    const courseDoc = await db.collection("courses").doc(courseId).get();

    if (!courseDoc.exists) {
      return res.status(404).json({error: "Course not found"});
    }

    const course = courseDoc.data();

    // Vérifier qu'il reste de la place
    if (course && course.currentStudents >= course.maxStudents) {
      return res.status(400).json({
        error: "Course is full",
        message: "This course has reached maximum capacity",
      });
    }

    // Vérifier que l'étudiant n'est pas déjà inscrit
    const existingEnrollment = await db.collection("enrollments")
      .where("courseId", "==", courseId)
      .where("studentUid", "==", uid)
      .where("status", "==", "active")
      .get();

    if (!existingEnrollment.empty) {
      return res.status(400).json({
        error: "Already enrolled",
        message: "You are already enrolled in this course",
      });
    }

    // Créer l'inscription
    const doc = db.collection("enrollments").doc();
    const enrollment: Enrollment = {
      id: doc.id,
      courseId,
      studentUid: uid,
      studentName: `${userData.firstName} ${userData.lastName}`,
      enrolledAt: Date.now(),
      status: "active",
    };

    await doc.set(enrollment);

    // Incrémenter le nombre d'étudiants
    await db.collection("courses").doc(courseId).update({
      currentStudents: (course?.currentStudents || 0) + 1,
    });

    return res.status(201).json({
      data: enrollment,
      message: "Successfully enrolled in course",
    });
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to enroll in course",
      message: error.message,
    });
  }
}

export async function getMyEnrollments(req: Request, res: Response) {
  const uid = (req as any).uid as string;

  try {
    const snapshot = await db.collection("enrollments")
      .where("studentUid", "==", uid)
      .orderBy("enrolledAt", "desc")
      .get();

    const enrollments = snapshot.docs.map((doc) => doc.data());

    // Enrichir avec les infos des cours
    const enrichedEnrollments = await Promise.all(
      enrollments.map(async (enrollment: any) => {
        const courseDoc = await db.collection("courses")
          .doc(enrollment.courseId)
          .get();
        return {
          ...enrollment,
          course: courseDoc.data(),
        };
      })
    );

    return res.status(200).json({
      data: enrichedEnrollments,
      count: enrichedEnrollments.length,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to fetch enrollments",
      message: error.message,
    });
  }
}

export async function getCourseEnrollments(req: Request, res: Response) {
  const {courseId} = req.params;

  try {
    const snapshot = await db.collection("enrollments")
      .where("courseId", "==", courseId)
      .where("status", "==", "active")
      .orderBy("enrolledAt", "desc")
      .get();

    const enrollments = snapshot.docs.map((doc) => doc.data());

    return res.status(200).json({
      data: enrollments,
      count: enrollments.length,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to fetch enrollments",
      message: error.message,
    });
  }
}

export async function cancelEnrollment(req: Request, res: Response) {
  const uid = (req as any).uid as string;
  const {id} = req.params;

  try {
    const docRef = db.collection("enrollments").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({error: "Enrollment not found"});
    }

    const enrollment = doc.data();

    if (enrollment?.studentUid !== uid) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You can only cancel your own enrollments",
      });
    }

    if (enrollment?.status !== "active") {
      return res.status(400).json({
        error: "Invalid status",
        message: "This enrollment is not active",
      });
    }

    // Mettre à jour le statut
    await docRef.update({
      status: "cancelled",
    });

    // Décrémenter le nombre d'étudiants
    const courseDoc = await db.collection("courses")
      .doc(enrollment.courseId)
      .get();
    const course = courseDoc.data();

    if (course && course.currentStudents > 0) {
      await db.collection("courses").doc(enrollment.courseId).update({
        currentStudents: course.currentStudents - 1,
      });
    }

    return res.status(200).json({
      message: "Enrollment cancelled successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to cancel enrollment",
      message: error.message,
    });
  }
}

