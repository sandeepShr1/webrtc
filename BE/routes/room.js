import express from "express";
import { createRoom } from "../controllers/roomController.js";
const router = express.Router();

router.route("/room/new").post(createRoom)

export default router;