import {
  Container,
  Flex,
  Grid,
  Heading,
  Input,
  Radio,
  RadioGroup,
  SimpleGrid,
  Spinner,
  Square,
  Stack,
  Text,
} from "@chakra-ui/react";
import Link from "next/link";
import {
  Chart,
  PointElement,
  CategoryScale,
  BarElement,
  LineElement,
  LinearScale,
} from "chart.js";

import {
  filterInsightData,
  heatMapAccuracy,
  sortInsightData,
  sortObjectByNumValues,
} from "../utils/client_safe";
import { trpc } from "../utils/trpc";
import HomeBtn from "./components/HomeBtn";
import Image from "next/image";
import TopLevelWrapper from "./components/TopLvlWrapper";
import { BarChart, chartColors } from "./components/BarChart";
import { useState } from "react";
import CustomBtn from "./components/CustomBtn";
import { GetStaticProps } from "next/types";
import { getMushroomImgPaths } from "../utils/server_side";
import { brandColors } from "./_app";
import { appRouter } from "../server/routers/_app";

Chart.register(
  BarElement,
  PointElement,
  LineElement,
  LinearScale,
  CategoryScale
);

export enum sortOptions {
  "Alphabetical",
  "HighAccuracyFirst",
  "LowAccuracyFirst",
}

export const getStaticProps: GetStaticProps = async () => {
  const caller = appRouter.createCaller({ user: undefined });
  const mushroomNames = await caller.getMushroomNames();

  if (!mushroomNames) {
    throw new Error("Mushroom names not available at build time");
  }
  const srcPromises = mushroomNames.map((mushroom) => {
    return getMushroomImgPaths(mushroom, 1).then((srcArr) => {
      return { [mushroom]: srcArr[0] };
    });
  });

  const srcArr = await Promise.all(srcPromises);
  const thumbnails = Object.assign({}, ...srcArr) as Record<string, string>;

  return {
    props: {
      thumbnails,
    },
  };
};

const Insights = ({ thumbnails }: { thumbnails: Record<string, string> }) => {
  const snapshot = trpc.retrieveLevelSnapShot.useQuery();
  const heatmaps = trpc.getHeatMaps.useQuery().data;
  const [searchInput, setSearchInput] = useState("");
  const [order, setOrder] = useState(sortOptions.Alphabetical);

  const insightData =
    snapshot.data?.snapshot && Object.entries(snapshot.data?.snapshot);

  const mushroomNames = insightData?.map(([mushroomName]) => mushroomName);

  const filteredInsights = filterInsightData(
    searchInput,
    mushroomNames ?? [],
    insightData
  );

  const sortedInsightData = sortInsightData(filteredInsights, heatmaps, order);

  return (
    <TopLevelWrapper backgroundColor={"#EDF2F7"}>
      <Flex direction="column" alignItems={"center"}>
        <Heading mb={10} mt={5} fontFamily="honeyMushroom">
          Mushine Insights
        </Heading>
        <HomeBtn />

        <Input
          placeholder="Search"
          margin="1rem"
          width="50%"
          value={searchInput}
          onInput={(e) => {
            const target = e.target as HTMLInputElement;
            setSearchInput(target.value);
          }}
        ></Input>

        <RadioGroup onChange={(e) => setOrder(Number(e))} value={String(order)}>
          <Stack direction="row" mb={5}>
            <Radio value={String(sortOptions.Alphabetical)}>Alphabetical</Radio>
            <Radio value={String(sortOptions.HighAccuracyFirst)}>
              High accuracy
            </Radio>
            <Radio value={String(sortOptions.LowAccuracyFirst)}>
              Low accuracy
            </Radio>
          </Stack>
        </RadioGroup>

        {snapshot.isLoading && <Spinner color={brandColors[200]} />}

        {!snapshot.isLoading &&
          !snapshot?.data?.snapshot &&
          "⚠️ Not enough data for insights"}

        <SimpleGrid gap="100px">
          {heatmaps &&
            sortedInsightData?.map(([mushroomName, misIdentifiedAs]) => {
              const sortedMisIdentifiedAs =
                sortObjectByNumValues(misIdentifiedAs);

              const heatmap = heatmaps[mushroomName].slice(0, 30);

              const accuracy = heatMapAccuracy(heatmap);

              return (
                <Container
                  key={mushroomName}
                  border="black 2px solid"
                  bg={"white"}
                  pt={3}
                  pb={3}
                >
                  <Container
                    p={0}
                    verticalAlign="top"
                    display={{ base: "block", md: "flex" }}
                  >
                    <Flex direction="column" gap="2rem">
                      <Heading
                        fontFamily={"honeyMushroom"}
                        textTransform="capitalize"
                        size={"lg"}
                      >
                        🍄 {mushroomName}
                      </Heading>

                      <Image
                        src={thumbnails[mushroomName]}
                        alt={mushroomName}
                        height={200}
                        width={200}
                      ></Image>
                      <Text
                        fontSize="lg"
                        color={accuracy > 50 ? "green.500" : "red.400"}
                      >
                        {Number.isNaN(accuracy)
                          ? ``
                          : `🎯 ${accuracy}% accuracy`}
                      </Text>
                      <CustomBtn
                        brandColor={300}
                        href={`/bank/${mushroomName}`}
                        styles={{ size: "xs", margin: 0 }}
                      >
                        Study
                      </CustomBtn>

                      <Container padding={0} justifyContent="space-between">
                        <Heading
                          size="sm"
                          fontWeight="thin"
                          fontFamily={"honeyMushroom"}
                          color={"green.600"}
                          visibility={heatmap.length ? "visible" : "hidden"}
                        >
                          Success heatmap
                        </Heading>

                        <Grid gridTemplateColumns={"repeat(7, 0fr)"}>
                          {heatmap.map((result, i) => (
                            <Square
                              size="40px"
                              key={i}
                              bg={
                                result.correct_answer ? "green.200" : "red.200"
                              }
                            />
                          ))}
                        </Grid>
                      </Container>
                    </Flex>

                    <Flex
                      wordBreak={"break-word"}
                      color="blue"
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                    >
                      <Heading
                        size="sm"
                        fontFamily={"honeyMushroom"}
                        fontWeight="thin"
                        color="black"
                      >
                        Misidentified as
                      </Heading>

                      <ol>
                        {Object.keys(sortedMisIdentifiedAs).map((name, i) => {
                          return (
                            <li key={name}>
                              <Link
                                href={`/bank/${name}`}
                                passHref
                                target="_blank"
                              >
                                {name}{" "}
                                <Square
                                  bg={chartColors[i]}
                                  size="10px"
                                  display="inline-flex"
                                />
                              </Link>
                            </li>
                          );
                        })}
                      </ol>
                      {Object.keys(sortedMisIdentifiedAs).length > 0 ? (
                        <div
                          style={{
                            height: "200px",
                            marginTop: "3rem",
                          }}
                        >
                          <BarChart
                            kvp={sortedMisIdentifiedAs}
                            max={5}
                            yAxisTitle="frequency"
                          />
                        </div>
                      ) : (
                        <Text color="green.400" padding="2rem">
                          No mistake data!
                        </Text>
                      )}
                    </Flex>
                  </Container>
                </Container>
              );
            })}
        </SimpleGrid>
      </Flex>
    </TopLevelWrapper>
  );
};

export default Insights;
