import { Button, Container, Flex, Heading } from "@chakra-ui/react";
import { GetStaticProps } from "next";
import Link from "next/link";
import { getMushroomNames } from "../../utils/server_side";
import HomeBtn from "../components/HomeBtn";
import TopLevelWrapper from "../components/TopLvlWrapper";

export const getStaticProps: GetStaticProps = async () => {
  const mushroomNames = await getMushroomNames();
  return {
    props: {
      mushroomNames,
    },
  };
};

const BankMenu = ({ mushroomNames }: { mushroomNames: string[] }) => {
  return (
    <TopLevelWrapper backgroundColor={"#091122"}>
      <Flex direction="column" alignItems={"center"} height={"fit-content"}>
        <HomeBtn mt={5} />
        <Heading mb={10} color="white">
          Mushroom Info Bank
        </Heading>
        <Container width={{ base: "70vw", md: "50vw", lg: "30vw" }}>
          {mushroomNames?.map((name) => (
            <Link key={name} href={`/bank/${name}`}>
              <Button mt={1} width="100%" backgroundColor={"#B8E6F3"}>
                {name}
              </Button>
            </Link>
          ))}
        </Container>
      </Flex>
    </TopLevelWrapper>
  );
};

export default BankMenu;
