import { Flex, Heading } from "@chakra-ui/react";
import { GetStaticProps, NextPage } from "next";
import Link from "next/link";
import { storedMushrooms } from "../../storedMushrooms";
import HomeBtn from "../components/HomeBtn";

export const getStaticProps: GetStaticProps = async () => {
  const mushroomNames = storedMushrooms;
  return {
    props: {
      mushroomNames,
    },
  };
};

const BankMenu = ({ mushroomNames }: { mushroomNames: string[] }) => {
  return (
    <>
      <Flex direction="column" alignItems={"center"} mt={10}>
        <Heading mb={10}>Mushroom Info Bank</Heading>

        <HomeBtn />

        {mushroomNames.map((name) => (
          <Link key={name} href={`/bank/${name}`}>
            {name}
          </Link>
        ))}
      </Flex>
    </>
  );
};

export default BankMenu;
