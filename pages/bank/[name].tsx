import { Button, Container, Heading, SimpleGrid } from "@chakra-ui/react";
import { GetStaticProps } from "next";
import fs from "fs";
import { getImageSrcArr } from "../../utils/server";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import path from "path";

export async function getStaticPaths() {
  const mushroomDirectory = path.join(process.cwd(), "/public/mushroom_images");
  const fileNames = fs.readdirSync(mushroomDirectory);
  const paths = fileNames.map((fileName) => {
    return {
      params: {
        name: fileName,
      },
    };
  });

  return {
    paths,
    fallback: false,
  };
}

export const getStaticProps: GetStaticProps = async (context) => {
  const mushroomName = context.params?.name;

  if (!mushroomName) {
    return { props: {} };
  }

  const mushroomSrcList = await getImageSrcArr(mushroomName);
  return {
    props: {
      mushroomSrcList,
      mushroomName,
    },
  };
};

const InfoBank = ({
  mushroomSrcList,
  mushroomName,
}: {
  mushroomSrcList: string[] | undefined;
  mushroomName: string;
}) => {
  const [expandIndex, setExpandIndex] = useState<number | null>(null);
  const visibleMushrooms = mushroomSrcList?.filter(
    (_, index) => index === expandIndex || expandIndex === null
  );

  return (
    <Container mt={5}>
      <Heading>{mushroomName} mushroom</Heading>

      <Link href={`https://www.wildfooduk.com/mushroom-guide/${mushroomName}`}>
        <Button m={2}>More Info</Button>
      </Link>

      <Link href="/bank">
        <Button m={2}>Back to bank menu </Button>
      </Link>

      {expandIndex === null && (
        <SimpleGrid columns={4} gap={1}>
          {visibleMushrooms?.map((imgSrc, index) => (
            <Image
              key={imgSrc}
              src={imgSrc}
              alt="mushroom image"
              width={200}
              height={200}
              onClick={() => setExpandIndex(index)}
              style={{ cursor: "pointer" }}
              placeholder="blur"
              blurDataURL="/loading.gif"
            />
          ))}
        </SimpleGrid>
      )}
      {expandIndex !== null && (
        <Container>
          <Button onClick={() => setExpandIndex(null)}>View all</Button>
          {visibleMushrooms?.map((imgSrc) => (
            <Image
              key={imgSrc}
              src={imgSrc}
              alt="mushroom image"
              width={1000}
              height={1000}
              placeholder="blur"
              blurDataURL="/loading.gif"
            />
          ))}
        </Container>
      )}
    </Container>
  );
};

export default InfoBank;
