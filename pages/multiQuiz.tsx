import { Container, Heading } from "@chakra-ui/react";
import { GetServerSideProps } from "next";
import Image from "next/image";
import { getAllMushroomNames, getImageSrcArr } from "../utils/server";

export type TestMushroom = {
  name: string;
  src: string;
  correctMatch: boolean;
};

async function buildTestMushrooms(
  mushroomNames: string[]
): Promise<TestMushroom[]> {
  let testMushroomArr = [];
  for (const mushroomName of mushroomNames) {
    const srcArr = await getImageSrcArr(mushroomName);

    if (!srcArr) {
      testMushroomArr.push({
        name: mushroomName,
        src: "/shroomschool.png",
        correctMatch: false,
      });
    } else {
      const randomNum = Math.floor(Math.random() * (srcArr.length - 1) + 1);
      const src = srcArr[randomNum];
      testMushroomArr.push({
        name: mushroomName,
        src,
        correctMatch: false,
      });
    }
  }

  return testMushroomArr;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const omitArr = ["medusa"];
  const allMushroomNames = getAllMushroomNames();
  const MushroomNamePool = allMushroomNames.filter(
    (mushroomName) => !omitArr.includes(mushroomName)
  );
  const testMushrooms = await buildTestMushrooms(MushroomNamePool);

  return {
    props: {
      testMushrooms,
    },
  };
};

const InfoBank = ({ testMushrooms }: { testMushrooms: TestMushroom[] }) => {
  return (
    <Container>
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
            <p>{testMushroom.correctMatch}</p>
          </Container>
        );
      })}
    </Container>
  );
};

export default InfoBank;
