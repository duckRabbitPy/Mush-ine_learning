import { useUser } from "@auth0/nextjs-auth0";
import {
  Container,
  Flex,
  Grid,
  Heading,
  Input,
  SimpleGrid,
  Square,
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

import { sortObjectByNumValues } from "../utils/client_safe";
import { trpc } from "../utils/trpc";
import HomeBtn from "./components/HomeBtn";
import TopLevelWrapper from "./components/TopLvlWrapper";
import { BarChart, chartColors } from "./components/BarChart";
import { useState } from "react";
import Fuse from "fuse.js";
import CustomBtn from "./components/CustomBtn";

Chart.register(
  BarElement,
  PointElement,
  LineElement,
  LinearScale,
  CategoryScale
);

const Insights = () => {
  const { user } = useUser();

  const snapshot = trpc.getLevelSnapShot.useQuery({
    user_id: user?.sub ?? null,
  });

  const heatmaps = trpc.getHeatMaps.useQuery({
    user_id: user?.sub ?? null,
  }).data;

  const [searchInput, setSearchInput] = useState("");

  const mushroomNames =
    snapshot.data?.snapshot &&
    Object.entries(snapshot.data?.snapshot).map((kvp) => kvp[0]);

  const fuse = new Fuse(mushroomNames ?? []);
  const fuzzySearchResult = fuse.search(searchInput).map((res) => res.item);

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

        <SimpleGrid gap="100px">
          {snapshot.data?.snapshot &&
            heatmaps &&
            Object.entries(snapshot.data?.snapshot)
              .filter(
                (kvp) => fuzzySearchResult.includes(kvp[0]) || !searchInput
              )
              .map((kvp) => {
                const mushroomName = kvp[0];
                const misIdentifiedAs = kvp[1];
                const sortedMisIdentifiedAs =
                  sortObjectByNumValues(misIdentifiedAs);
                const heatmap = heatmaps[mushroomName].slice(0, 30);

                const numCorrect = heatmap.filter(
                  (result) => result.correct_answer
                ).length;
                const numIncorrect = heatmap.filter(
                  (result) => !result.correct_answer
                ).length;

                const accuracy = Math.ceil(
                  (numCorrect / (numCorrect + numIncorrect)) * 100
                );

                return (
                  <Container key={mushroomName}>
                    <Container
                      p={3}
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

                        <Container padding={0}>
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
                            {heatmap.map((result) => (
                              <Square
                                size="40px"
                                key={result.timestamp}
                                bg={
                                  result.correct_answer
                                    ? "green.200"
                                    : "red.200"
                                }
                              />
                            ))}
                          </Grid>
                        </Container>
                      </Flex>

                      <Flex
                        p={3}
                        wordBreak={"break-word"}
                        color="blue"
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                      >
                        {sortedMisIdentifiedAs.length > 0 && (
                          <Heading
                            size="sm"
                            fontFamily={"honeyMushroom"}
                            fontWeight="thin"
                            color="black"
                          >
                            Misidentified as
                          </Heading>
                        )}
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
                          <div style={{ height: "200px", marginTop: "3rem" }}>
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
