import fs from "fs";
import path from "path";

export async function fetchFromEndpoint(name: string | string[]) {
  if (Array.isArray(name)) return null;

  return fetch(`http://localhost:3000/api/readfiles/${name}`).then((res) =>
    res.json()
  );
}

export function getAllMushroomPaths() {
  const mushroomDirectory = path.join(process.cwd(), "/public/mushroom_images");
  const fileNames = fs.readdirSync(mushroomDirectory);

  return fileNames.map((fileName) => {
    return {
      params: {
        name: fileName,
      },
    };
  });
}

export function getAllMushroomNames() {
  const mushroomDirectory = path.join(process.cwd(), "/public/mushroom_images");
  const fileNames = fs.readdirSync(mushroomDirectory);
  return fileNames;
}
