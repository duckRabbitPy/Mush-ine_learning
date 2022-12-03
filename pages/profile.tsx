import { useUser } from "@auth0/nextjs-auth0";
import {
  Container,
  Flex,
  Grid,
  Heading,
  Input,
  Progress,
  SimpleGrid,
  Spinner,
  Square,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Tr,
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

import { currLevelInfo, sortObjectByNumValues } from "../utils/client_safe";
import { trpc } from "../utils/trpc";
import HomeBtn from "./components/HomeBtn";
import TopLevelWrapper from "./components/TopLvlWrapper";
import { BarChart, chartColors } from "./components/BarChart";
import { useState } from "react";
import Fuse from "fuse.js";

Chart.register(
  BarElement,
  PointElement,
  LineElement,
  LinearScale,
  CategoryScale
);

const Profile = () => {
  const { user } = useUser();
  const xpQuery = trpc.retrieveUserScore.useQuery({
    user_id: user?.sub ?? null,
  });

  const snapshot = trpc.downloadLevelSnapShot.useQuery({
    user_id: user?.sub ?? null,
  });

  const metaArr = trpc.retrieveRoundMetadata.useQuery({
    user_id: user?.sub ?? null,
  }).data;

  const { xpToNextLevel, boundaryAhead, boundaryBehind } = currLevelInfo(
    xpQuery.data,
    snapshot.data?.level
  );

  const heatmaps = trpc.downloadHeatMaps.useQuery({
    user_id: user?.sub ?? null,
  }).data;

  const xpEarnedThisLevel = boundaryAhead - boundaryBehind - xpToNextLevel;
  const percentageProgress = (xpEarnedThisLevel / xpToNextLevel) * 100;

  const [searchInput, setSearchInput] = useState("");

  const mushroomNames =
    snapshot.data?.snapshot &&
    Object.entries(snapshot.data?.snapshot).map((kvp) => kvp[0]);

  const fuse = new Fuse(mushroomNames ?? []);
  const fuzzySearchResult = fuse.search(searchInput).map((res) => res.item);

  return (
    <TopLevelWrapper backgroundColor={"#EDF2F7"}>
      <Flex direction="column" alignItems={"center"}>
        <Heading mb={10} mt={5} fontFamily={"honeyMushroom"}>
          Profile - {user?.name}
        </Heading>
        <HomeBtn />

        {xpQuery.isLoading || snapshot.isLoading ? (
          <Spinner color="white" />
        ) : (
          <>
            <Text
              mt={5}
              fontSize="2xl"
              fontWeight={"extrabold"}
              fontFamily={"honeyMushroom"}
            >
              Level {snapshot.data?.level}
            </Text>
            <Text color="green.400" mt={5} fontSize="2xl">
              XP: {xpQuery.data ?? 0}
            </Text>
          </>
        )}

        <Text color="blue.600" fontWeight="semibold">
          xp to next level: {xpToNextLevel}
        </Text>
        <Progress
          m={3}
          hasStripe
          value={percentageProgress > 0 ? percentageProgress : 0.5}
          height={5}
          border="1px gray solid"
          width="80%"
        />

        <Heading fontSize="large" mb={2} mt={5}>
          Stats for level: {snapshot.data?.level}
        </Heading>
        <SimpleGrid columns={3} m={5}>
          {Object.entries(metaArr ?? {}).map((kvp) => {
            const name = kvp[0];
            const data = kvp[1];
            return (
              <Container key={name}>
                <Heading
                  fontSize={"medium"}
                  style={{ textTransform: "capitalize" }}
                >
                  {name}
                </Heading>
                <Text color="blue.500">
                  {data?.percentageCorrect?.toFixed(0) ?? 0}% Correct
                </Text>
                <Text>{data?.correct ?? 0} correct answers</Text>
                <Text>{data?.incorrect ?? 0} incorrect answers</Text>
              </Container>
            );
          })}
        </SimpleGrid>

        <TableContainer
          maxWidth={{ base: "90%", lg: "60%" }}
          mt={5}
          mb={5}
          whiteSpace="break-spaces"
          bgColor={"white"}
        >
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
          <Table colorScheme="blue">
            <Tbody>
              {snapshot.data?.snapshot &&
                heatmaps &&
                Object.entries(snapshot.data?.snapshot)
                  .filter(
                    (kvp) => fuzzySearchResult.includes(kvp[0]) || !searchInput
                  )
                  .map((kvp) => {
                    const mushroom = kvp[0];
                    const misIdentifiedAs = kvp[1];
                    const sortedMisIdentifiedAs =
                      sortObjectByNumValues(misIdentifiedAs);
                    const heatmap = heatmaps[mushroom].slice(0, 30);

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
                      <Tr key={mushroom}>
                        <Td
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
                              🍄 {mushroom}
                            </Heading>
                            <Text
                              fontSize="lg"
                              color={accuracy > 50 ? "green.500" : "red.400"}
                            >
                              {Number.isNaN(accuracy)
                                ? ``
                                : ` 🎯 ${accuracy}% accuracy`}
                            </Text>

                            <Container>
                              <Heading
                                size="sm"
                                fontWeight="thin"
                                fontFamily={"honeyMushroom"}
                                color={"green.600"}
                                visibility={
                                  heatmap.length ? "visible" : "hidden"
                                }
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
                            <Heading
                              size="sm"
                              fontFamily={"honeyMushroom"}
                              fontWeight="thin"
                              color="black"
                            >
                              Misidentified as
                            </Heading>
                            <ol>
                              {Object.keys(sortedMisIdentifiedAs).map(
                                (name, i) => {
                                  return (
                                    <li key={name}>
                                      <Link href={`/bank/${name}`} passHref>
                                        {name}{" "}
                                        <Square
                                          bg={chartColors[i]}
                                          size="10px"
                                          display="inline-flex"
                                        />
                                      </Link>
                                    </li>
                                  );
                                }
                              )}
                            </ol>
                            {Object.keys(sortedMisIdentifiedAs).length > 0 ? (
                              <div
                                style={{ height: "200px", marginTop: "3rem" }}
                              >
                                <BarChart kvp={sortedMisIdentifiedAs} />
                              </div>
                            ) : (
                              <Text color="green.400">No mistake data!</Text>
                            )}
                          </Flex>
                        </Td>
                      </Tr>
                    );
                  })}
            </Tbody>
          </Table>
        </TableContainer>
      </Flex>
    </TopLevelWrapper>
  );
};

export default Profile;
