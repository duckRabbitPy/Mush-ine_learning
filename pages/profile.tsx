import { useUser } from "@auth0/nextjs-auth0";
import {
  Container,
  Flex,
  Heading,
  Progress,
  SimpleGrid,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
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
import { BarChart } from "./components/BarChart";

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

  const xpEarnedThisLevel = boundaryAhead - boundaryBehind - xpToNextLevel;
  const percentageProgress = (xpEarnedThisLevel / xpToNextLevel) * 100;

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
        >
          <Table colorScheme="blue">
            <Thead>
              <Tr>
                <Th>Mushroom</Th>
                <Th>Misidentified as</Th>
              </Tr>
            </Thead>
            {snapshot.data?.snapshot &&
              Object.entries(snapshot.data?.snapshot).map((kvp) => {
                const mushroom = kvp[0];
                const misIdentifiedAs = kvp[1];
                const sortedMisIdentifiedAs =
                  sortObjectByNumValues(misIdentifiedAs);

                return (
                  <Tbody key={mushroom}>
                    <Tr>
                      <Td
                        p={3}
                        textTransform="capitalize"
                        fontFamily={"honeyMushroom"}
                      >
                        🍄 {mushroom}
                      </Td>
                      <Td p={3} wordBreak={"break-word"} color="blue">
                        <Flex
                          flexDirection={{ base: "column", lg: "row" }}
                          alignItems={{ base: "flex-end", lg: "center" }}
                        >
                          <ol>
                            {Object.keys(sortedMisIdentifiedAs).map((name) => {
                              return (
                                <li key={name}>
                                  <Link href={`/bank/${name}`} passHref>
                                    {name}
                                  </Link>
                                </li>
                              );
                            })}
                          </ol>
                          {Object.keys(sortedMisIdentifiedAs).length > 0 ? (
                            <div style={{ height: "200px", margin: "20px" }}>
                              <BarChart kvp={sortedMisIdentifiedAs} />
                            </div>
                          ) : (
                            <Text color="green.400">No mistake data!</Text>
                          )}
                        </Flex>
                      </Td>
                    </Tr>
                  </Tbody>
                );
              })}
          </Table>
        </TableContainer>
      </Flex>
    </TopLevelWrapper>
  );
};

export default Profile;
