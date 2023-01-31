import { Heading, VStack, List, ListItem, Text } from "@chakra-ui/react";
import Image from "next/image";
import HomeBtn from "./components/HomeBtn";
import TopLevelWrapper from "./components/TopLvlWrapper";
import { brandColors } from "./_app";

const About = () => {
  return (
    <TopLevelWrapper backgroundColor={brandColors.sand}>
      <VStack padding={"4rem"}>
        <HomeBtn />
        <Heading size={"2xl"}>About Mush-ine learning </Heading>
        <Heading size={"1xl"}>
          Learn to identify edible mushrooms that grow in the UK
        </Heading>
        <Text>
          Learning to identify mushrooms from books and websites is hard!
          Mush-ine learning is an online application designed to train users to
          identify canonical examples of edible mushroom species. Complete
          mushroom identification games to earn XP points and level up! Your
          results are used to build a model of your successes and failures which
          informs the options you are presented in games.
        </Text>
        <Text>
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
        <Heading>Game modes</Heading>
        <List>
          <ListItem>Forage</ListItem>
          <ListItem>Multi</ListItem>
          <ListItem>Tile</ListItem>
        </List>
        <Text>
          In Forage game mode you are presented with a number of mushroom
          images, and given a target mushroom to find. Only one of the options
          is correct.
        </Text>
        <Image
          width={500}
          height={500}
          alt="screenshot from forage game"
          src="/screenshots/forage.png"
        />
        <Heading>Multi</Heading>
        <Text>
          In Multi game mode, you are presented with a set of different images
          of the same mushroom and several multiple-choice options. Your task is
          to select the mushroom option that the set of images belongs to.{" "}
        </Text>
        <Image
          width={500}
          height={500}
          alt="screenshot from multi game"
          src="/screenshots/multi.png"
        />
        <Heading>Tile</Heading>
        <Text>
          In Tile game mode you are given a single image of a mushroom and are
          presented with many options, you can choose as many times as you like,
          but for a good score, you will want to select the correct option on
          the first attempt.
        </Text>
        <Image
          width={500}
          height={500}
          alt="screenshot from tile game"
          src="/screenshots/tile.png"
        />
        <Heading>Insights</Heading>
        <Text>
          On the insights page, you can search for different mushrooms and see a
          heatmap of your successes and failures, importantly you can see a
          ranked list of the mushrooms that you have historically mistaken the
          target mushroom for. You can use this information to guide your study.
        </Text>
        <Image
          src="/screenshots/insights.png"
          width={500}
          height={500}
          alt="screenshot of mushroom insights"
        />
      </VStack>
    </TopLevelWrapper>
  );
};

export default About;
