import fs from "fs";
import path from "path";

export async function getImageSrcArr(name: string | string[]) {
  if (Array.isArray(name)) return null;
  const dirRelativeToPublicFolder = `mushroom_images/${name}`;
  const dir = path.resolve("./cloudMirror", dirRelativeToPublicFolder);
  const mushroomNames = fs.readdirSync(dir);
  const images = mushroomNames.map((name) =>
    path.join("/", dirRelativeToPublicFolder, name)
  );
  return images;
}

export function runGetAllMushroomNames() {
  const mushroomDirectory = path.join(
    process.cwd(),
    "/cloudMirror/mushroom_images"
  );
  const mushroomNames = fs.readdirSync(mushroomDirectory);
  return mushroomNames;
}
