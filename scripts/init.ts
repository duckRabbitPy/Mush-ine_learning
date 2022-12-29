import * as dotenv from "dotenv";
import * as fs from "fs";
dotenv.config({ path: ".env.local" });
import { v2 as cloudinary } from "cloudinary";
import { SubfolderResult } from "../types";

export async function getMushroomNamesFromCloud() {
  const images = (await cloudinary.api.sub_folders("mushroom_images")) as
    | {
        folders: SubfolderResult[];
      }
    | undefined;
  return images ? images.folders.map((i) => i.name) : [];
}

export default async function storeMushroomNamesOnFile() {
  const mushroomNames = await getMushroomNamesFromCloud();
  const json = JSON.stringify({ mushroomNames });

  fs.writeFileSync(
    __dirname + "/../server/fileSystemData/mushroomNames.json",
    json,
    "utf-8"
  );
}

try {
  storeMushroomNamesOnFile();
} catch (e) {
  console.log(e);
}
