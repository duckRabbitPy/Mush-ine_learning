import { Container, Heading, SimpleGrid, Text } from "@chakra-ui/react";
import { GetServerSideProps } from "next";
import Image from "next/image";
import { randomArrItem } from "../utils/client";
import HomeBtn from "./components/HomeBtn";
import { v2 as cloudinary } from "cloudinary";
import { storedMushrooms } from "../storedMushrooms";
import { CloudImage } from "../types";
import { useState } from "react";

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

export const getServerSideProps: GetServerSideProps = async (_context) => {
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

const Forage = ({
  testMushrooms,
}: {
  testMushrooms: TestMushroom[];
  options: TestMushroom[];
}) => {
  const [inputAnswer, setInputAnswer] = useState<string | null>(null);
  const correctMushroom = testMushrooms.filter((t) => t.correctMatch)[0];
  return (
    <Container>
      <HomeBtn />
      <Heading size={"md"} mb={2}>
        Find the: {correctMushroom.name} mushroom{" "}
        {inputAnswer === correctMushroom.name && "✅"}
        {inputAnswer && inputAnswer !== correctMushroom.name && "❌"}
      </Heading>
      <SimpleGrid columns={2} gap={2}>
        {testMushrooms.map((testMushroom) => {
          return (
            <Container key={testMushroom.name}>
              <Image
                onClick={() => {
                  setInputAnswer(testMushroom.name);
                }}
                src={testMushroom.src}
                alt="testMushroom"
                height={200}
                width={200}
                style={{
                  opacity:
                    inputAnswer && !testMushroom.correctMatch ? "0.5" : 1,
                }}
              />
              <Text>{inputAnswer ? testMushroom.name : ""}</Text>
            </Container>
          );
        })}
      </SimpleGrid>
    </Container>
  );
};

export default Forage;
