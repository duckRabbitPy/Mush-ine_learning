import { Container, Heading } from "@chakra-ui/react";
import { GetServerSideProps } from "next";
import Image from "next/image";
import { randomArrItem } from "../utils/client";
import HomeBtn from "./components/HomeBtn";
import { v2 as cloudinary } from "cloudinary";
import { storedMushrooms } from "../storedMushrooms";
import { CloudImage } from "../types";

export type TestMushroom = {
  name: string;
  src: string;
  correctMatch: boolean;
};

async function buildTestMushrooms(
  mushroomNames: string[],
  number: number
): Promise<TestMushroom[]> {
  let testMushroomArr = [];
  let count = 0;
  for (const mushroomName of mushroomNames) {
    if (count >= number) break;

    const images = (await cloudinary.api.resources({
      type: "upload",
      prefix: `mushroom_images/${mushroomName}`,
      max_results: 10,
    })) as { resources: CloudImage[] };

    const srcArr = images.resources.map((img: CloudImage) => img.url);

    if (!srcArr) {
      testMushroomArr.push({
        name: mushroomName,
        src: "/shroomschool.png",
        correctMatch: false,
      });
    } else {
      const src = randomArrItem(srcArr);
      testMushroomArr.push({
        name: mushroomName,
        src: src || "/shroomschool.png",
        correctMatch: false,
      });
    }
    count++;
  }

  return testMushroomArr;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const omitArr = ["medusa"];
  const allMushroomNames = storedMushrooms;
  const MushroomNamePool = allMushroomNames.filter(
    (mushroomName) => !omitArr.includes(mushroomName)
  );
  const unselectedMushrooms = await buildTestMushrooms(MushroomNamePool, 5);
  const chosen = randomArrItem(unselectedMushrooms).name;
  const testMushrooms = unselectedMushrooms.map((mushroom) => {
    if (mushroom.name === chosen) {
      return { ...mushroom, correctMatch: true };
    }
    return mushroom;
  });

  return {
    props: {
      testMushrooms,
    },
  };
};

const InfoBank = ({ testMushrooms }: { testMushrooms: TestMushroom[] }) => {
  return (
    <Container>
      <HomeBtn />
      {testMushrooms.map((testMushroom) => {
        return (
          <Container key={testMushroom.name}>
            <Heading>{testMushroom.name}</Heading>
            <Image
              src={testMushroom.src}
              alt="testMushroom"
              height={200}
              width={200}
            />
            <p> {testMushroom.correctMatch && "CHOSEN"}</p>
          </Container>
        );
      })}
    </Container>
  );
};

export default InfoBank;
