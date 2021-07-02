import { Router } from "express";

import { apiRouterV1 } from "./v1/apiV1";
import { redirectToApiDocs } from "../util/redirectToApiDocs";

const router: Router = Router();

router.use("/v1", apiRouterV1);

router.use("/", redirectToApiDocs);

export { router as apiRouter };

export * from "./v1/apiV1";
