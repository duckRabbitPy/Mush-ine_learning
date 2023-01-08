import { Button, Container, Flex, Heading } from "@chakra-ui/react";
import { GetStaticProps } from "next";
import Link from "next/link";
import { appRouter } from "../../server/routers/_app";
import HomeBtn from "../components/HomeBtn";
import Image from "next/image";
import TopLevelWrapper from "../components/TopLvlWrapper";
import { brandColors } from "../_app";

export const getStaticProps: GetStaticProps = async () => {
  const caller = appRouter.createCaller({ user: undefined });
  const mushroomNames = await caller.getAllMushroomNames();
  const thumbnails = await caller.retrieveMushroomImgSrcs(mushroomNames);
  return {
    props: {
      mushroomNames,
      thumbnails,
    },
  };
};

const BankMenu = ({
  mushroomNames,
  thumbnails,
}: {
  mushroomNames: string[];
  thumbnails: Thumbnails;
}) => {
  return (
    <TopLevelWrapper backgroundColor={brandColors.blackBlue}>
      <Flex direction="column" alignItems={"center"} height={"fit-content"}>
        <HomeBtn mt={5} />
        <Heading mb={10} mt={5} color="white" fontFamily={"honeyMushroom"}>
          Mushroom Info Bank
        </Heading>
        <Container mb="10" width={{ base: "70vw", md: "50vw", lg: "40vw" }}>
          {mushroomNames?.map((name) => (
            <Link key={name} href={`/bank/${name}`}>
              <Flex m={5} alignItems="top">
                <Image
                  src={thumbnails[name]}
                  height={80}
                  width={80}
                  alt={name}
                  style={{ borderRadius: "5px 0px 0px 5px" }}
                />

                <Button
                  width="100%"
                  minHeight="80px"
                  borderRadius="0px 5px 5px 0px"
                >
                  {name}
                </Button>
              </Flex>
            </Link>
          ))}
        </Container>
      </Flex>
    </TopLevelWrapper>
  );
};

export default BankMenu;
