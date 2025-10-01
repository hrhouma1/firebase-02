import {Request, Response} from "express";
import {db, auth} from "../firebase";
import {UserRole, User} from "../types";

export async function createUser(req: Request, res: Response) {
  const {email, password, role, firstName, lastName} = req.body || {};

  // Validation
  if (!email || typeof email !== "string") {
    return res.status(422).json({error: "email is required (string)"});
  }
  if (!password || typeof password !== "string") {
    return res.status(422).json({error: "password is required (string)"});
  }
  if (!role || !Object.values(UserRole).includes(role)) {
    return res.status(422).json({
      error: "role is required",
      validRoles: Object.values(UserRole),
    });
  }
  if (!firstName || typeof firstName !== "string") {
    return res.status(422).json({error: "firstName is required (string)"});
  }
  if (!lastName || typeof lastName !== "string") {
    return res.status(422).json({error: "lastName is required (string)"});
  }

  try {
    // Créer l'utilisateur dans Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      emailVerified: false,
    });

    // Créer le profil dans Firestore
    const now = Date.now();
    const user: User = {
      uid: userRecord.uid,
      email,
      role,
      firstName,
      lastName,
      createdAt: now,
      updatedAt: now,
    };

    await db.collection("users").doc(userRecord.uid).set(user);

    // Ne pas retourner le password
    return res.status(201).json({
      data: user,
      message: "User created successfully",
    });
  } catch (error: any) {
    return res.status(400).json({
      error: "Failed to create user",
      message: error.message,
    });
  }
}

export async function getUsers(req: Request, res: Response) {
  const {role} = req.query;

  try {
    let query = db.collection("users");

    if (role && Object.values(UserRole).includes(role as UserRole)) {
      query = query.where("role", "==", role) as any;
    }

    const snapshot = await query.get();
    const users = snapshot.docs.map((doc) => doc.data());

    return res.status(200).json({data: users, count: users.length});
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to fetch users",
      message: error.message,
    });
  }
}

export async function getUser(req: Request, res: Response) {
  const {uid} = req.params;

  try {
    const doc = await db.collection("users").doc(uid).get();

    if (!doc.exists) {
      return res.status(404).json({error: "User not found"});
    }

    return res.status(200).json({data: doc.data()});
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to fetch user",
      message: error.message,
    });
  }
}

export async function updateUser(req: Request, res: Response) {
  const {uid} = req.params;
  const {role, firstName, lastName} = req.body || {};

  try {
    const docRef = db.collection("users").doc(uid);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({error: "User not found"});
    }

    const updates: any = {updatedAt: Date.now()};

    if (role && Object.values(UserRole).includes(role)) {
      updates.role = role;
    }
    if (firstName && typeof firstName === "string") {
      updates.firstName = firstName;
    }
    if (lastName && typeof lastName === "string") {
      updates.lastName = lastName;
    }

    await docRef.update(updates);
    const updatedDoc = await docRef.get();

    return res.status(200).json({
      data: updatedDoc.data(),
      message: "User updated successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to update user",
      message: error.message,
    });
  }
}

export async function deleteUser(req: Request, res: Response) {
  const {uid} = req.params;

  try {
    // Supprimer de Auth
    await auth.deleteUser(uid);

    // Supprimer de Firestore
    await db.collection("users").doc(uid).delete();

    return res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to delete user",
      message: error.message,
    });
  }
}

export async function getProfile(req: Request, res: Response) {
  const uid = (req as any).uid as string;

  try {
    const doc = await db.collection("users").doc(uid).get();

    if (!doc.exists) {
      return res.status(404).json({
        error: "Profile not found",
        message: "Please complete your profile",
      });
    }

    return res.status(200).json({data: doc.data()});
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to fetch profile",
      message: error.message,
    });
  }
}

export async function updateProfile(req: Request, res: Response) {
  const uid = (req as any).uid as string;
  const {firstName, lastName} = req.body || {};

  try {
    const docRef = db.collection("users").doc(uid);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({error: "Profile not found"});
    }

    const updates: any = {updatedAt: Date.now()};

    if (firstName && typeof firstName === "string") {
      updates.firstName = firstName;
    }
    if (lastName && typeof lastName === "string") {
      updates.lastName = lastName;
    }

    await docRef.update(updates);
    const updatedDoc = await docRef.get();

    return res.status(200).json({
      data: updatedDoc.data(),
      message: "Profile updated successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to update profile",
      message: error.message,
    });
  }
}

