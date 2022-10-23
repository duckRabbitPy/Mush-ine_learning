import path from "path";
import fs from "fs";

export function getAllMushroomNames() {
  const mushroomDirectory = path.join(
    process.cwd(),
    "/cloudMirror/mushroom_images"
  );
  const mushroomNames = fs
    .readdirSync(mushroomDirectory)
    .filter((n) => n !== ".DS_Store");
  console.log(mushroomNames);
  return mushroomNames;
}

getAllMushroomNames();
