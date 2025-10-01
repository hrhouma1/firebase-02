import {Request, Response} from "express";
import {db} from "../firebase";

export async function createNote(req: Request, res: Response) {
  const uid = (req as any).uid as string;
  const {title, content} = req.body || {};
  if (!title || typeof title !== "string") {
    return res.status(422).json({error: "title is required (string)"});
  }

  const doc = db.collection("notes").doc();
  const now = Date.now();
  const note = {
    id: doc.id,
    title,
    content: typeof content === "string" ? content : "",
    ownerUid: uid,
    createdAt: now,
    updatedAt: now
  };

  await doc.set(note);
  return res.status(201).json({data: note});
}

export async function getNotes(req: Request, res: Response) {
  const uid = (req as any).uid as string;

  const snapshot = await db.collection("notes")
    .where("ownerUid", "==", uid)
    .orderBy("createdAt", "desc")
    .get();

  const notes = snapshot.docs.map((doc) => doc.data());
  return res.status(200).json({data: notes});
}

export async function getNote(req: Request, res: Response) {
  const uid = (req as any).uid as string;
  const {id} = req.params;

  const doc = await db.collection("notes").doc(id).get();
  if (!doc.exists) {
    return res.status(404).json({error: "Note not found"});
  }

  const note = doc.data();
  if (note?.ownerUid !== uid) {
    return res.status(403).json({error: "Forbidden"});
  }

  return res.status(200).json({data: note});
}

export async function updateNote(req: Request, res: Response) {
  const uid = (req as any).uid as string;
  const {id} = req.params;
  const {title, content} = req.body || {};

  const docRef = db.collection("notes").doc(id);
  const doc = await docRef.get();

  if (!doc.exists) {
    return res.status(404).json({error: "Note not found"});
  }

  const note = doc.data();
  if (note?.ownerUid !== uid) {
    return res.status(403).json({error: "Forbidden"});
  }

  const updates: any = {updatedAt: Date.now()};
  if (title && typeof title === "string") {
    updates.title = title;
  }
  if (typeof content === "string") {
    updates.content = content;
  }

  await docRef.update(updates);
  const updatedDoc = await docRef.get();

  return res.status(200).json({data: updatedDoc.data()});
}

export async function deleteNote(req: Request, res: Response) {
  const uid = (req as any).uid as string;
  const {id} = req.params;

  const docRef = db.collection("notes").doc(id);
  const doc = await docRef.get();

  if (!doc.exists) {
    return res.status(404).json({error: "Note not found"});
  }

  const note = doc.data();
  if (note?.ownerUid !== uid) {
    return res.status(403).json({error: "Forbidden"});
  }

  await docRef.delete();
  return res.status(200).json({message: "Note deleted successfully"});
}

