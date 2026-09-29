import { Router, type IRouter } from "express";
import healthRouter from "./health";
import eventsRouter from "./events";
import countriesRouter from "./countries";
import tagsRouter from "./tags";
import searchRouter from "./search";
import adminRouter from "./admin";
import siteSettingsRouter from "./site-settings";
import submissionsRouter from "./submissions";
import articlesRouter from "./articles";
import bannersRouter from "./banners";
import translationsRouter from "./translations";

const router: IRouter = Router();

router.use(healthRouter);
router.use(eventsRouter);
router.use(countriesRouter);
router.use(tagsRouter);
router.use(searchRouter);
router.use(adminRouter);
router.use(siteSettingsRouter);
router.use(submissionsRouter);
router.use(articlesRouter);
router.use(bannersRouter);
router.use(translationsRouter);

export default router;
