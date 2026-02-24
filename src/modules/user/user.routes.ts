import express, { Request, Response } from "express";
import { pool } from "../../config/db";
import { usersControllers } from "./user.controller";

const router = express.Router()

router.post("/", usersControllers.createUser)


router.get("/", usersControllers.getUser)

router.get("/:id", usersControllers.getSingleUser)

router.put("/:id", usersControllers.updateUser)

router.delete("/:id", usersControllers.deleteUser)

export const userRoutes = router;