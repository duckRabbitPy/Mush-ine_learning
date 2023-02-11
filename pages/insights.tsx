import {
  Container,
  Flex,
  Heading,
  Input,
  Radio,
  RadioGroup,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";

import {
  Chart,
  PointElement,
  CategoryScale,
  BarElement,
  LineElement,
  LinearScale,
} from "chart.js";

import {
  heatMapAccuracy,
  sortInsightData,
  sortObjectByNumValues,
} from "../utils/pureFunctions";
import { trpc } from "../utils/trpc";
import HomeBtn from "./components/HomeBtn";
import Image from "next/image";
import TopLevelWrapper from "./components/TopLvlWrapper";
import { useState } from "react";
import CustomBtn from "./components/CustomBtn";
import { GetStaticProps } from "next/types";
import { brandColors } from "./_app";
import { appRouter } from "../server/routers/_app";
import Fuse from "fuse.js";
import { InsightSortOptions } from "../global_enums";
import HeatMap from "./components/HeatMap";
import MisidentifiedAsChart from "./components/MisidentifiedAsChart";

Chart.register(
  BarElement,
  PointElement,
  LineElement,
  LinearScale,
  CategoryScale
);

export const getStaticProps: GetStaticProps = async () => {
  const caller = appRouter.createCaller({ user: undefined });
  const mushroomNames = await caller.getAllMushroomNames();
  if (!mushroomNames) {
    throw new Error("Mushroom names not available at build time");
  }
  const thumbnails = await caller.retrieveThumbnailSrcs(mushroomNames);

  return {
    props: {
      thumbnails,
    },
  };
};

export function filterInsightData(
  searchInput: string,
  mushroomNames: string[],
  insightData: [string, SummedWeights][] | undefined
) {
  const fuse = new Fuse(mushroomNames ?? []);
  const fuzzySearchResult = fuse.search(searchInput).map((res) => res.item);
  return insightData?.filter(
    ([mushroomName]) => fuzzySearchResult.includes(mushroomName) || !searchInput
  );
}

const Insights = ({ thumbnails }: { thumbnails: Thumbnails }) => {
  const snapshot = trpc.retrieveLevelSnapShot.useQuery();
  const heatmaps = trpc.getHeatMaps.useQuery().data;
  const [searchInput, setSearchInput] = useState("");
  const [order, setOrder] = useState(InsightSortOptions.Alphabetical);

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
    <TopLevelWrapper backgroundColor={brandColors.lightGrey}>
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
        />

        <RadioGroup onChange={(e) => setOrder(Number(e))} value={String(order)}>
          <Stack direction="row" mb={5}>
            <Radio value={String(InsightSortOptions.Alphabetical)}>
              Alphabetical
            </Radio>
            <Radio value={String(InsightSortOptions.HighAccuracyFirst)}>
              High accuracy
            </Radio>
            <Radio value={String(InsightSortOptions.LowAccuracyFirst)}>
              Low accuracy
            </Radio>
          </Stack>
        </RadioGroup>

        {snapshot.isLoading && <Spinner color={brandColors.blueGrey} />}

        {!snapshot.isLoading &&
          !snapshot?.data?.snapshot &&
          "⚠️ Not enough data for insights"}

        {insightData &&
          sortedInsightData?.length === 0 &&
          "No matching search results"}

        <SimpleGrid gap="100px">
          {heatmaps &&
            sortedInsightData?.map(([mushroomName, misIdentifiedAs]) => {
              const sortedMisIdentifiedAs =
                sortObjectByNumValues(misIdentifiedAs);

              const heatmap = heatmaps[mushroomName].slice(0, 30);

              const accuracy = heatMapAccuracy(heatmap);

              if (heatmap.length < 1) {
                return null;
              }

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
                        color={
                          accuracy > 50 ? brandColors.green : brandColors.red
                        }
                      >
                        {Number.isNaN(accuracy)
                          ? ``
                          : `🎯 ${accuracy}% accuracy`}
                      </Text>
                      <CustomBtn
                        brandColor={brandColors.blueGrey}
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
                          color={brandColors.darkGreen}
                          visibility={heatmap.length ? "visible" : "hidden"}
                        >
                          Success heatmap
                        </Heading>

                        <HeatMap heatmap={heatmap} />
                      </Container>
                    </Flex>

                    <Flex
                      wordBreak={"break-word"}
                      color="blue"
                      display="flex"
                      flexDirection="column"
                      justifyContent="space-between"
                      alignItems="center"
                      gap={10}
                    >
                      <Heading
                        size="sm"
                        fontFamily={"honeyMushroom"}
                        fontWeight="thin"
                        color="black"
                      >
                        Misidentified as
                      </Heading>

                      <MisidentifiedAsChart
                        misIdentifiedAs={sortedMisIdentifiedAs}
                      />
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
