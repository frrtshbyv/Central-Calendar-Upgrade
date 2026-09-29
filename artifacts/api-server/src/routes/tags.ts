import { Router, type IRouter } from "express";
import { db, tagsTable } from "@workspace/db";
import { ListTagsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/tags", async (_req, res): Promise<void> => {
  const tags = await db.select().from(tagsTable).orderBy(tagsTable.name);
  res.json(ListTagsResponse.parse(tags));
});

export default router;
