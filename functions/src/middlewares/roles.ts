import {Request, Response, NextFunction} from "express";
import {db} from "../firebase";
import {UserRole} from "../types";

export function requireRole(...allowedRoles: UserRole[]) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const uid = (req as any).uid as string;

    if (!uid) {
      res.status(401).json({error: "Unauthorized"});
      return;
    }

    try {
      const userDoc = await db.collection("users").doc(uid).get();

      if (!userDoc.exists) {
        res.status(403).json({error: "User profile not found"});
        return;
      }

      const userData = userDoc.data();
      const userRole = userData?.role as UserRole;

      if (!allowedRoles.includes(userRole)) {
        res.status(403).json({
          error: "Forbidden",
          message: `Required role: ${allowedRoles.join(" or ")}`,
        });
        return;
      }

      (req as any).userRole = userRole;
      (req as any).userData = userData;
      next();
    } catch (error) {
      res.status(500).json({error: "Internal server error"});
      return;
    }
  };
}

export const requireAdmin = requireRole(UserRole.ADMIN);
export const requireProfessor = requireRole(
  UserRole.ADMIN,
  UserRole.PROFESSOR
);
export const requireStudent = requireRole(
  UserRole.ADMIN,
  UserRole.STUDENT
);

