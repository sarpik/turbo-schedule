import { Router } from "express";

const router: Router = Router();

/**
 * get an array of students (WITHOUT lessons)
 *
 * TODO - not backwards compatible! returns { participants }, not { students }
 */
router.get("/", async (_req, res) => res.redirect(301, "participant"));

/**
 * get full schedule of single student by it's name
 *
 * TODO - not backwards compatible! returns { participant }, not { student }
 */
router.get("/:studentName", async (req, res) => res.redirect(301, `../participant/${req.params["studentName"]}`));

/** --- */

export { router as studentRouter };
