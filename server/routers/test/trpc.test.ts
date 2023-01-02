import { describe, it, expect } from "vitest";
import { createTestContext } from "../../context";
import { appRouter } from "../_app";

describe("can retreive mushrooms for forage game", () => {
  it("returned object not empty", async () => {
    const user = createTestContext();
    const caller = appRouter.createCaller(user);
    const retreiveMushrooms = caller.retrieveForageMushrooms({
      omitArr: [],
      maxIncorrect: 4,
    });
    retreiveMushrooms.then((res) => expect(res).toBeTruthy);
  });
});
