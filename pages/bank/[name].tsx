import { Button, Container, Heading, Icon, SimpleGrid } from "@chakra-ui/react";
import { GetStaticProps } from "next";
import { v2 as cloudinary } from "cloudinary";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CloudImage } from "../../types";
import { trpc } from "../../utils/trpc";
import { useUser } from "@auth0/nextjs-auth0";
import { getMushroomNames } from "../../utils/server_side";
import HomeBtn from "../components/HomeBtn";
import { BsGrid3X3GapFill } from "react-icons/bs";

export async function getStaticPaths() {
  const mushroomNames = await getMushroomNames();
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
  const { user } = useUser();
  const [expandIndex, setExpandIndex] = useState<number | null>(null);
  const visibleMushrooms = mushroomSrcList?.filter(
    (_, index) => index === expandIndex || expandIndex === null
  );

  const lookalikes = trpc.trainingData.useQuery(
    {
      name: mushroomName,
      user_id: user?.sub ?? null,
    },
    { enabled: !!user?.sub }
  );

  return (
    <Container mt={5}>
      <HomeBtn style={{ alignSelf: "center" }} />
      <Link href="/bank">
        <Button m={2}>Bank menu </Button>
      </Link>

      <Heading>{mushroomName} mushroom</Heading>

      {expandIndex === null && (
        <SimpleGrid columns={{ base: 3, lg: 4 }} gap={1}>
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
              priority
            />
          ))}
        </SimpleGrid>
      )}
      {expandIndex !== null && (
        <Container>
          <Button onClick={() => setExpandIndex(null)} m={2}>
            Expand Full gallery
            <Icon as={BsGrid3X3GapFill} ml={2} />
          </Button>
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

      <Container>
        <Heading as={"h2"} fontSize={"large"} mt={5}>
          Training data
        </Heading>
        <p>You most commonly confuse {mushroomName} with: </p>

        <ol>
          {lookalikes.data?.map((mushroom) => (
            <Link
              key={mushroom.misidentified_as}
              href={`/bank/${mushroom.misidentified_as}`}
            >
              <li>{mushroom.misidentified_as}</li>
            </Link>
          ))}
        </ol>
      </Container>

      <Link
        href={`https://www.wildfooduk.com/mushroom-guide/${mushroomName}`}
        target="_blank"
      >
        <Button m={2} bgColor="burlywood">
          More Info
        </Button>
      </Link>
    </Container>
  );
};

export default InfoBank;
