import { Heading, VStack, Text, Container } from "@chakra-ui/react";
import Image from "next/image";
import HomeBtn from "./components/HomeBtn";
import { BsGithub } from "react-icons/bs";
import TopLevelWrapper from "./components/TopLvlWrapper";
import { brandColors } from "./_app";

import CustomBtn from "./components/CustomBtn";

const About = () => {
  return (
    <TopLevelWrapper backgroundColor={brandColors.sand}>
      <VStack padding={{ base: "10%", md: "5% 20% 5% 20%" }} gap={5}>
        <HomeBtn />
        <Heading
          fontSize={{ base: "5xl", md: "7xl" }}
          color={brandColors.darkBlue}
          fontFamily="honeyMushroom"
          letterSpacing="wide"
          textAlign={"center"}
          pt={5}
          pb={30}
        >
          Mush-ine learning{" "}
        </Heading>
        <Heading fontFamily="honeyMushroom" letterSpacing="wide">
          Learn to identify edible mushrooms that grow in the UK
        </Heading>
        <Text fontFamily="rounded">
          Learning to identify mushrooms from books and websites is hard!
          Mush-ine learning is an online application designed to train users to
          identify canonical examples of edible mushroom species. Complete
          mushroom identification games to earn XP points and level up! Your
          results are used to build a model of your successes and failures which
          informs the options you are presented in games.
        </Text>
        <Text fontFamily="rounded">
          The more levels you complete the better the app understands the
          mistakes you make and can recommend mushrooms to study. You can view
          this data yourself on the insights page and the study page. This app
          will help you build familiarity with canonical examples of edible
          mushroom species. The decision to eat a wild mushroom requires 100%
          certainty in edibility. There are many harmful and even deadly
          mushroom species in the UK. This app is a good starting place but{" "}
          <b>
            IS NOT A SUBSTITUTE for proper research, careful examination and
            informed expert opinion.
          </b>
        </Text>

        <Container pb={"2rem"}>
          <CustomBtn
            href="https://github.com/duckRabbitPy"
            icon={BsGithub}
            brandColor={brandColors.blueGrey}
            openLinkInNewTab
          >
            Follow me on Github!
          </CustomBtn>

          <CustomBtn
            href="https://github.com/duckRabbitPy/Mush-ine_learning"
            icon={BsGithub}
            brandColor={brandColors.darkBlue}
            openLinkInNewTab
          >
            View source code
          </CustomBtn>
        </Container>

        <Heading fontFamily="honeyMushroom" letterSpacing="wide">
          Game modes
        </Heading>
        <Text fontFamily="rounded">
          There are 3 game modes. Each mode involves a variation on the same
          theme, identifying mushrooms! For each mode you can choose between
          easy, medium, hard and pro difficulty, you will earn more XP and level
          up faster with greater difficulty.
        </Text>
        <VStack gap={20}>
          <Container>
            <Heading fontFamily="honeyMushroom" letterSpacing="wide">
              Forage
            </Heading>
            <Text fontFamily="rounded" pb={5}>
              In Forage game mode you are presented with a number of mushroom
              images, and given a target mushroom to find. Only one of the
              options is correct.
            </Text>
            <Image
              width={500}
              height={500}
              alt="screenshot from forage game"
              src="/screenshots/forage.png"
            />
          </Container>
          <Container>
            <Heading fontFamily="honeyMushroom" letterSpacing="wide">
              Multi
            </Heading>
            <Text fontFamily="rounded" pb={5}>
              In Multi game mode, you are presented with a set of different
              images of the same mushroom and several multiple-choice options.
              Your task is to select the mushroom option that the set of images
              belongs to.{" "}
            </Text>
            <Image
              width={500}
              height={500}
              alt="screenshot from multi game"
              src="/screenshots/multi.png"
            />
          </Container>
          <Container>
            <Heading fontFamily="honeyMushroom" letterSpacing="wide">
              Tile
            </Heading>
            <Text fontFamily="rounded" pb={5}>
              In Tile game mode you are given a single image of a mushroom and
              are presented with many options, you can choose as many times as
              you like, but for a good score, you will want to select the
              correct option on the first attempt.
            </Text>
            <Image
              width={500}
              height={500}
              alt="screenshot from tile game"
              src="/screenshots/tile.png"
            />
          </Container>
          <Container>
            <Heading fontFamily="honeyMushroom" letterSpacing="wide">
              Insights
            </Heading>
            <Text fontFamily="rounded" pb={5}>
              On the insights page, you can search for different mushrooms and
              see a heatmap of your successes and failures, importantly you can
              see a ranked list of the mushrooms that you have historically
              mistaken the target mushroom for. You can use this information to
              guide your study.
            </Text>
            <Image
              src="/screenshots/insights.png"
              width={500}
              height={500}
              alt="screenshot of mushroom insights"
            />
          </Container>
        </VStack>
      </VStack>
    </TopLevelWrapper>
  );
};

export default About;
