import {Request, Response} from "express";
import {auth, db} from "../firebase";
import {UserRole, User} from "../types";

export async function signup(req: Request, res: Response) {
  const {email, password, role, firstName, lastName} = req.body || {};

  // Validation
  if (!email || typeof email !== "string") {
    return res.status(422).json({error: "email is required (string)"});
  }
  if (!password || typeof password !== "string" || password.length < 6) {
    return res.status(422).json({
      error: "password is required (string, min 6 characters)",
    });
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

    // Retourner les infos (sans le password)
    return res.status(201).json({
      data: user,
      message: "Account created successfully. You can now login.",
    });
  } catch (error: any) {
    // Gestion des erreurs Firebase Auth
    if (error.code === "auth/email-already-exists") {
      return res.status(400).json({
        error: "Email already exists",
        message: "This email is already registered",
      });
    }
    if (error.code === "auth/invalid-email") {
      return res.status(400).json({
        error: "Invalid email",
        message: "Please provide a valid email address",
      });
    }
    if (error.code === "auth/weak-password") {
      return res.status(400).json({
        error: "Weak password",
        message: "Password must be at least 6 characters",
      });
    }

    return res.status(500).json({
      error: "Failed to create account",
      message: error.message,
    });
  }
}

export async function signin(req: Request, res: Response) {
  const {email, password} = req.body || {};

  if (!email || typeof email !== "string") {
    return res.status(422).json({error: "email is required (string)"});
  }
  if (!password || typeof password !== "string") {
    return res.status(422).json({error: "password is required (string)"});
  }

  // Note: Pour l'émulateur, on ne peut pas vérifier le password côté serveur
  // On retourne juste un message pour utiliser l'Auth Emulator REST API
  return res.status(200).json({
    message: "Use Firebase Auth REST API to sign in",
    instructions: {
      method: "POST",
      url: "http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=anything",
      body: {
        email,
        password,
        returnSecureToken: true,
      },
      powershell: `$login = Invoke-RestMethod -Method Post -Uri "http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=anything" -ContentType "application/json" -Body '{"email":"${email}","password":"${password}","returnSecureToken":true}'; $login.idToken`,
    },
  });
}

