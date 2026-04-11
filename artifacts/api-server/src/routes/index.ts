import { Router, type IRouter } from "express";
import healthRouter from "./health";
import eventsRouter from "./events";
import countriesRouter from "./countries";
import tagsRouter from "./tags";
import searchRouter from "./search";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(eventsRouter);
router.use(countriesRouter);
router.use(tagsRouter);
router.use(searchRouter);
router.use(adminRouter);

export default router;
