import fs from "fs";
import path from "path";

export async function getImageSrcArr(name: string | string[]) {
  if (Array.isArray(name)) return null;
  const dirRelativeToPublicFolder = `mushroom_images/${name}`;
  const dir = path.resolve("./public", dirRelativeToPublicFolder);
  const filenames = fs.readdirSync(dir);
  const images = filenames.map((name) =>
    path.join("/", dirRelativeToPublicFolder, name)
  );
  return images;
}

export function getAllMushroomNames() {
  const mushroomDirectory = path.join(process.cwd(), "/public/mushroom_images");
  const fileNames = fs.readdirSync(mushroomDirectory);
  return fileNames;
}
