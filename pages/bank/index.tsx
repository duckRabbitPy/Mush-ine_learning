import { Button, Flex, Heading } from "@chakra-ui/react";
import { GetStaticProps, NextPage } from "next";
import Link from "next/link";
import { getAllMushroomNames } from "../../utils/server";

export const getStaticProps: GetStaticProps = async () => {
  const mushroomNames = getAllMushroomNames();
  console.log(mushroomNames);
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

        <Link href="/">
          <Button m={2}>Home </Button>
        </Link>

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
