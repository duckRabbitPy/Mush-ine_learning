import { Container, Heading } from "@chakra-ui/react";
import { GetServerSideProps } from "next";
import Image from "next/image";
import { randomArrItem } from "../utils/client";
import { getAllMushroomNames, getImageSrcArr } from "../utils/server";
import HomeBtn from "./components/HomeBtn";

export const config = {
  unstable_excludeFiles: ["public/**/*"],
};

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
    const srcArr = await getImageSrcArr(mushroomName);

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
        src,
        correctMatch: false,
      });
    }
    count++;
  }

  return testMushroomArr;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const omitArr = ["medusa"];
  const allMushroomNames = getAllMushroomNames();
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
