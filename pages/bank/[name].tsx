import { SimpleGrid } from "@chakra-ui/react";
import { GetStaticProps } from "next";
import { fetchFromEndpoint, getAllMushroomNames } from "../../utils/server";
import { useRouter } from "next/router";
import Image from "next/image";

export async function getStaticPaths() {
  const paths = getAllMushroomNames();
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
    },
  };
};

const InfoBank = ({
  mushroomSrcList,
}: {
  mushroomSrcList: string[] | undefined;
}) => {
  return (
    <SimpleGrid columns={4}>
      {mushroomSrcList?.map((imgSrc) => (
        <Image
          key={imgSrc}
          src={imgSrc}
          alt="mushroom image"
          width={200}
          height={200}
        />
      ))}
    </SimpleGrid>
  );
};

export default InfoBank;
