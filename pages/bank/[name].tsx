import { Button, Container, Heading, SimpleGrid } from "@chakra-ui/react";
import { GetStaticProps } from "next";
import { fetchFromEndpoint, getAllMushroomPaths } from "../../utils/server";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export async function getStaticPaths() {
  const paths = getAllMushroomPaths();
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

  const mushroomSrcList = await fetchFromEndpoint(mushroomName);
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
      <Button m={2}>
        <Link
          href={`https://www.wildfooduk.com/mushroom-guide/${mushroomName}`}
        >
          More Info
        </Link>
      </Button>
      <Button m={2}>
        <Link href="/bank">Back to bank menu</Link>
      </Button>
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
            />
          ))}
        </Container>
      )}
    </Container>
  );
};

export default InfoBank;
