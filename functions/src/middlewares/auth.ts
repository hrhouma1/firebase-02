import {Request, Response, NextFunction} from "express";
import {auth} from "../firebase";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token) {
    res.status(401).json({error: "Missing Bearer token"});
    return;
  }

  try {
    const decoded = await auth.verifyIdToken(token);
    (req as any).uid = decoded.uid;
    next();
    return;
  } catch {
    res.status(401).json({error: "Invalid or expired token"});
    return;
  }
}

