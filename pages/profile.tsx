import { useUser } from "@auth0/nextjs-auth0";
import {
  Button,
  Flex,
  Heading,
  Spinner,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Text,
  Tfoot,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { trpc } from "../utils/trpc";
import HomeBtn from "./components/HomeBtn";

const Profile = () => {
  const { user } = useUser();
  const xpQuery = trpc.retrieveUserScore.useQuery({
    user_id: user?.sub ?? null,
  });

  const snapshot = trpc.downloadLevelSnapShot.useQuery({
    level: 2,
    user_id: user?.sub ?? null,
  });

  console.log("snapshot", snapshot.data);

  const saveSnapShot = trpc.saveLevelSnapShot.useMutation();

  const levelHandler = () => {
    saveSnapShot.mutate({ user_id: user?.sub ?? null });
  };

  return (
    <>
      <Flex direction="column" alignItems={"center"} mt={10}>
        <Heading mb={10}>Profile - {user?.name}</Heading>
        <HomeBtn />
        {xpQuery.isLoading ? (
          <Spinner />
        ) : (
          <Text mt={5} fontSize="3xl">
            XP: {xpQuery.data ?? 0}
          </Text>
        )}

        <Button onClick={levelHandler}>Progress to next level</Button>

        <TableContainer>
          <Table variant="striped" colorScheme="teal">
            <TableCaption>Imperial to metric conversion factors</TableCaption>
            <Thead>
              <Tr>
                <Th>To convert</Th>
                <Th>into</Th>
                <Th isNumeric>multiply by</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td>inches</Td>
                <Td>millimetres (mm)</Td>
                <Td isNumeric>25.4</Td>
              </Tr>
              <Tr>
                <Td>feet</Td>
                <Td>centimetres (cm)</Td>
                <Td isNumeric>30.48</Td>
              </Tr>
              <Tr>
                <Td>yards</Td>
                <Td>metres (m)</Td>
                <Td isNumeric>0.91444</Td>
              </Tr>
            </Tbody>
            <Tfoot>
              <Tr>
                <Th>To convert</Th>
                <Th>into</Th>
                <Th isNumeric>multiply by</Th>
              </Tr>
            </Tfoot>
          </Table>
        </TableContainer>
      </Flex>
    </>
  );
};

export default Profile;
