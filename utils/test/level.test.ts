import { assert, describe, it } from "vitest";
import { currLevelInfo, returnLvl } from "../client_safe";

describe("curr level undefined", () => {
  const currXp = 0;
  const currLevel = undefined;
  it("boundary ahead correct", () => {
    const { boundaryAhead } = currLevelInfo(currXp, currLevel);
    assert.equal(boundaryAhead, 50);
  });
});

describe("curr level 0", () => {
  const currXp = 0;
  const currLevel = 0;

  it("boundary ahead correct", () => {
    const { boundaryAhead } = currLevelInfo(currXp, currLevel);
    assert.equal(boundaryAhead, 50);
  });

  it("correct xpToNextLevel", () => {
    const { xpToNextLevel } = currLevelInfo(currXp, currLevel);
    assert.equal(xpToNextLevel, 50);
  });
});

describe("curr level 3", () => {
  const currXp = 700;
  const currLevel = 3;
  it("boundary ahead correct", () => {
    const { boundaryAhead } = currLevelInfo(currXp, currLevel);
    assert.equal(boundaryAhead, 800);
  });

  it("correct xpToNextLevel", () => {
    const { xpToNextLevel } = currLevelInfo(currXp, currLevel);
    assert.equal(xpToNextLevel, 100);
  });
});

describe("curr level 5", () => {
  const currXp = 1300;
  const currLevel = 5;
  it("boundary ahead correct", () => {
    const { boundaryAhead } = currLevelInfo(currXp, currLevel);
    assert.equal(boundaryAhead, 1800);
  });

  it("correct xpToNextLevel", () => {
    const { xpToNextLevel } = currLevelInfo(currXp, currLevel);
    assert.equal(xpToNextLevel, 500);
  });
});

describe("Level correctly determined based on XP", () => {
  it("level correct", () => {
    const currXp = 0;
    const lvl = returnLvl(currXp);
    assert.equal(lvl, 0);
  });

  it("level correct", () => {
    const currXp = 200;
    const lvl = returnLvl(currXp);
    assert.equal(lvl, 1);
  });

  it("level correct", () => {
    const currXp = 450;
    const lvl = returnLvl(currXp);
    assert.equal(lvl, 2);
  });

  it("level correct", () => {
    const currXp = 10000;
    const lvl = returnLvl(currXp);
    assert.equal(lvl, 13);
  });
});
