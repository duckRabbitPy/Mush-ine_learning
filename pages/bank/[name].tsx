import {
  Button,
  Container,
  Flex,
  Heading,
  Icon,
  SimpleGrid,
} from "@chakra-ui/react";
import { GetStaticProps } from "next";
import { v2 as cloudinary } from "cloudinary";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import HomeBtn from "../components/HomeBtn";
import { BsGrid3X3GapFill } from "react-icons/bs";
import { appRouter } from "../../server/routers/_app";

export async function getStaticPaths() {
  const caller = appRouter.createCaller({ user: undefined });
  const mushroomNames = await caller.getMushroomNames();

  if (!mushroomNames) {
    throw new Error("Mushroom names not available at build time");
  }
  const paths = mushroomNames.map((mushroomName) => {
    return {
      params: {
        name: mushroomName.trim(),
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

  const images = await cloudinary.api.resources({
    type: "upload",
    prefix: `mushroom_images/${mushroomName}`,
    max_results: 10,
  });

  const mushroomSrcList = images.resources.map((img: CloudImage) => img.url);

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
    <div>
      <Container mt={5} width={"100%"} maxWidth={expandIndex ? "70%" : "60ch"}>
        <HomeBtn style={{ alignSelf: "center" }} />
        <Link href="/bank">
          <Button m={2}>Bank menu </Button>
        </Link>
        <Heading mb={2}>{mushroomName} mushroom</Heading>
        <Flex direction={"column"} alignItems={"center"}>
          {expandIndex === null && (
            <SimpleGrid
              columns={{ base: 1, lg: 2 }}
              gap={1}
              width={{ base: "50%", lg: "100%" }}
            >
              {visibleMushrooms?.map((imgSrc, index) => (
                <Image
                  key={imgSrc}
                  src={imgSrc}
                  alt="mushroom image"
                  width={1000}
                  height={1000}
                  onClick={() => setExpandIndex(index)}
                  style={{ cursor: "pointer" }}
                  placeholder="blur"
                  blurDataURL="/loading.gif"
                  priority
                />
              ))}
            </SimpleGrid>
          )}
          {expandIndex !== null && (
            <>
              <Button onClick={() => setExpandIndex(null)} m={2}>
                Gallery
                <Icon as={BsGrid3X3GapFill} ml={2} />
              </Button>
              {visibleMushrooms?.map((imgSrc) => (
                <Image
                  key={imgSrc}
                  src={imgSrc}
                  alt="mushroom image"
                  width={2000}
                  height={2000}
                  placeholder="blur"
                  blurDataURL="/loading.gif"
                  priority
                />
              ))}
            </>
          )}

          <Link
            href={`https://www.wildfooduk.com/mushroom-guide/${mushroomName}`}
            target="_blank"
          >
            {expandIndex === null && (
              <Button m={2} bgColor="burlywood">
                More Info
              </Button>
            )}
          </Link>
        </Flex>
      </Container>
      <iframe
        src="https://species.nbnatlas.org/species/BMSSYS0000042282"
        width="1000"
        height="1000"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default InfoBank;
