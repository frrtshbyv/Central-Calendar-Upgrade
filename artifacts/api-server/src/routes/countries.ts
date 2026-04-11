import { Router, type IRouter } from "express";
import { db, countriesTable } from "@workspace/db";
import { ListCountriesResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/countries", async (_req, res): Promise<void> => {
  const countries = await db.select().from(countriesTable).orderBy(countriesTable.name);
  res.json(ListCountriesResponse.parse(countries));
});

export default router;
