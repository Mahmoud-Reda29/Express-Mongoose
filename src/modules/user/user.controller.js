import { Router } from "express";
import { authenticateToken } from "../../middleware/authenticate.js";
import { addUser, deleteUser, getUser, signIn, updateUser } from "./user.service.js";

const router = Router();

// Define routes
router.post("/signup", addUser);
router.post("/login", signIn);
router.patch("/", authenticateToken, updateUser); 
router.delete("/", authenticateToken, deleteUser);
router.get("/", authenticateToken, getUser);

export default router;
