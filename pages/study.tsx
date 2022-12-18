import { Flex, Heading, Text } from "@chakra-ui/react";

import {
  Chart,
  PointElement,
  CategoryScale,
  BarElement,
  LineElement,
  LinearScale,
} from "chart.js";
import Image from "next/image";

import { trpc } from "../utils/trpc";
import HomeBtn from "./components/HomeBtn";
import TopLevelWrapper from "./components/TopLvlWrapper";

Chart.register(
  BarElement,
  PointElement,
  LineElement,
  LinearScale,
  CategoryScale
);

const Study = () => {
  const { isLoading, data } = trpc.getStudyImages.useQuery();

  const images = data?.studyImgSrcs;
  const name = data?.chosenMushroomName;

  return (
    <TopLevelWrapper backgroundColor={"#EDF2F7"}>
      <Flex direction="column" alignItems="center" gap="1rem">
        <HomeBtn mt={5} />
        <Heading fontFamily={"honeyMushroom"}>Homework</Heading>
        {images && images.length > 0 && (
          <Text>{name} seems to be causing you problems, pay attention!</Text>
        )}
        {!isLoading && images && images?.length < 1 && (
          <Text>⚠️ Not enough data for personalised recommendations</Text>
        )}
        <ul>
          {images?.map((src) => {
            return (
              <Image
                key={src}
                src={src ?? ""}
                height={800}
                width={800}
                alt="fullsize study mushrooms"
                style={{ marginBottom: "1rem" }}
              />
            );
          })}
        </ul>
      </Flex>
    </TopLevelWrapper>
  );
};

export default Study;
