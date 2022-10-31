import { useUser } from "@auth0/nextjs-auth0";
import {
  Button,
  Flex,
  Heading,
  Progress,
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
import { trpc } from "../utils/trpc";
import HomeBtn from "./components/HomeBtn";

const Profile = () => {
  const { user } = useUser();
  const xpQuery = trpc.retrieveUserScore.useQuery({
    user_id: user?.sub ?? null,
  });

  const snapshot = trpc.downloadLevelSnapShot.useQuery({
    level: 4,
    user_id: user?.sub ?? null,
  });

  const saveSnapShot = trpc.saveLevelSnapShot.useMutation();

  const levelHandler = () => {
    saveSnapShot.mutate({ user_id: user?.sub ?? null });
  };

  return (
    <>
      <Flex direction="column" alignItems={"center"} mt={10}>
        <Heading mb={10}>Profile - {user?.name}</Heading>
        <HomeBtn />

        {xpQuery.isLoading || snapshot.isLoading ? (
          <Spinner />
        ) : (
          <>
            <Text mt={5} fontSize="2xl">
              Level {snapshot.data?.level}
            </Text>
            <Text mt={5} fontSize="2xl">
              XP: {xpQuery.data ?? 0}
            </Text>
          </>
        )}

        <Progress
          m={3}
          hasStripe
          value={Number(String(xpQuery.data).slice(-2))}
          height={5}
          width="80%"
        />

        <Button onClick={levelHandler}>Progress to next level</Button>

        <TableContainer maxWidth={"60%"} mt={5} whiteSpace="break-spaces">
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
                return (
                  <Tbody key={mushroom}>
                    <Td p={3} textTransform="capitalize">
                      🍄 {mushroom}
                    </Td>
                    <Td p={3} wordBreak={"break-word"}>
                      {Object.keys(misIdentifiedAs).map((name, i, arr) => {
                        return (
                          <>
                            <Link key={name} href={`/bank/${name}`} passHref>
                              <a style={{ color: "blue" }}>{name}</a>
                            </Link>
                            {i === arr.length - 1 ? "" : ", "}
                          </>
                        );
                      })}
                    </Td>
                  </Tbody>
                );
              })}
          </Table>
        </TableContainer>
      </Flex>
    </>
  );
};

export default Profile;
