import { assert, describe, it } from "vitest";
import { currLevelInfo, returnLvl } from "../pureFunctions";

describe("curr level undefined", () => {
  const currXp = 0;
  const currLevel = undefined;
  it("boundary ahead correct", () => {
    const { boundaryAhead } = currLevelInfo(currXp, currLevel);
    assert.equal(boundaryAhead, 50);
  });

  it("correct boundary behind", () => {
    const { boundaryBehind } = currLevelInfo(currXp, currLevel);
    assert.equal(boundaryBehind, 0);
  });

  it("correct xpToNextLevel", () => {
    const { xpToNextLevel } = currLevelInfo(currXp, currLevel);
    assert.equal(xpToNextLevel, 50);
  });
});

describe("curr level 0", () => {
  const currXp = 0;
  const currLevel = 0;

  it("boundary ahead correct", () => {
    const { boundaryAhead } = currLevelInfo(currXp, currLevel);
    assert.equal(boundaryAhead, 50);
  });

  it("correct boundary behind", () => {
    const { boundaryBehind } = currLevelInfo(currXp, currLevel);
    assert.equal(boundaryBehind, 0);
  });

  it("correct xpToNextLevel", () => {
    const { xpToNextLevel } = currLevelInfo(currXp, currLevel);
    assert.equal(xpToNextLevel, 50);
  });
});

describe("curr level 4", () => {
  const currXp = 1300;
  const currLevel = 4;
  it("boundary ahead correct", () => {
    const { boundaryAhead } = currLevelInfo(currXp, currLevel);
    assert.equal(boundaryAhead, 1800);
  });

  it("correct boundary behind", () => {
    const { boundaryBehind } = currLevelInfo(currXp, currLevel);
    assert.equal(boundaryBehind, 1250);
  });

  it("correct xpToNextLevel", () => {
    const { xpToNextLevel } = currLevelInfo(currXp, currLevel);
    assert.equal(xpToNextLevel, 500);
  });
});

describe("curr level 3", () => {
  const currXp = 1190;
  const currLevel = 3;

  it("correct boundary ahead", () => {
    const { boundaryAhead } = currLevelInfo(currXp, currLevel);
    assert.equal(boundaryAhead, 1250);
  });

  it("correct boundary behind", () => {
    const { boundaryBehind } = currLevelInfo(currXp, currLevel);
    assert.equal(boundaryBehind, 800);
  });

  it("correct xpToNextLevel", () => {
    const { xpToNextLevel, boundaryAhead } = currLevelInfo(currXp, currLevel);
    assert.equal(boundaryAhead, 1250);
    assert.equal(xpToNextLevel, 60);
  });
});

describe("Level correctly determined based on XP", () => {
  it("level correct 0 xp", () => {
    const currXp = 0;
    const lvl = returnLvl(currXp);
    assert.equal(lvl, 0);
  });

  it("level correct with 51 xp", () => {
    const currXp = 51;
    const lvl = returnLvl(currXp);
    assert.equal(lvl, 1);
  });

  it("level correct 200 xp", () => {
    const currXp = 200;
    const lvl = returnLvl(currXp);
    assert.equal(lvl, 2);
  });

  it("level correct 450 xp", () => {
    const currXp = 450;
    const lvl = returnLvl(currXp);
    assert.equal(lvl, 3);
  });

  it("level correct 1190 xp", () => {
    const currXp = 1190;
    const lvl = returnLvl(currXp);
    assert.equal(lvl, 4);
  });

  it("level correct 10000 xp", () => {
    const currXp = 10000;
    const lvl = returnLvl(currXp);
    assert.equal(lvl, 14);
  });
});
