import { Flex, Heading } from "@chakra-ui/react";
import { BiUser } from "react-icons/bi";
import { CiVault } from "react-icons/ci";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import AuthStatus from "./components/AuthStatus";
import { TopLevelWrapper } from "./components/TopLvlWrapper";
import CustomBtn from "./components/CustomBtn";
import { brandColors } from "./_app";

const Home: NextPage = () => {
  return (
    <TopLevelWrapper backgroundColor="#F2E1C3">
      <Head>
        <title>Mushine learning</title>
        <meta name="description" content="Generated by create next app" />
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🍄</text></svg>"
        />
      </Head>

      <Flex direction={"column"} justifyContent="center" align="center">
        <Heading
          as={"h1"}
          p={5}
          textAlign="center"
          size="4xl"
          fontFamily="honeyMushroom, mono"
          letterSpacing="wide"
          color={brandColors[900]}
        >
          Mush-ine learning! 🍄
        </Heading>

        <AuthStatus />

        <Image
          src="/shroomschool.png"
          alt="mushroom"
          width={200}
          height={200}
          className="wave"
          priority
        />

        <Flex
          direction={"column"}
          justifyContent="center"
          align="center"
          mt={5}
        >
          <CustomBtn brandColor={200} href="/profile" icon={BiUser}>
            Profile
          </CustomBtn>

          <CustomBtn brandColor={200} href="/bank" icon={CiVault}>
            Mushroom bank
          </CustomBtn>

          <Heading size="md" pt={5}>
            Games
          </Heading>
          <Flex direction={{ base: "column", md: "row" }}>
            <CustomBtn brandColor={300} href="forage">
              Forage Game
            </CustomBtn>

            <CustomBtn brandColor={300} href="multi">
              MultiChoice Game
            </CustomBtn>

            <CustomBtn brandColor={300} href="tile">
              Tile Game
            </CustomBtn>
          </Flex>
        </Flex>
      </Flex>
    </TopLevelWrapper>
  );
};

export default Home;
