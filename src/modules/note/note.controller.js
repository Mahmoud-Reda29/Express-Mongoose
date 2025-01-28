 import { Router } from "express";
import { addNote, deleteAllNotes, deleteNote, getNoteByContent, getNoteById, getNoteWithAggregation, getNoteWithUserInfo, getPaginatedNotes, replaceNote, updateAllNotesTitle, updateNote } from "./note.service.js";
import { authenticateToken } from "../../middleware/authenticate.js";


 const router = Router();

router.post("/", authenticateToken,addNote);
router.get("/paginate-sort",authenticateToken, getPaginatedNotes);
router.patch("/all",authenticateToken, updateAllNotesTitle);
router.get("/note-by-content",authenticateToken, getNoteByContent);
router.get("/note-with-user",authenticateToken, getNoteWithUserInfo);
router.get("/aggregate",authenticateToken, getNoteWithAggregation);
router.patch("/:id",authenticateToken, updateNote);
router.put("/replace/:id",authenticateToken, replaceNote);
router.delete("/:id",authenticateToken, deleteNote);
router.get("/:id",authenticateToken, getNoteById);
router.put("/delete-all",authenticateToken, deleteAllNotes);


 export default router
