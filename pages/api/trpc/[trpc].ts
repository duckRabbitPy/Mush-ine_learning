import * as trpcNext from "@trpc/server/adapters/next";
import { createContext } from "../../../server/context";
import { appRouter } from "../../../server/routers/_app";

export default trpcNext.createNextApiHandler({
  onError({ error }) {
    if (process.env.ENVIRONMENT === "DEV") console.error("Error:", error);
  },
  router: appRouter,
  createContext,
});
