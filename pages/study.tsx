import { useUser } from "@auth0/nextjs-auth0";
import { Flex, Heading } from "@chakra-ui/react";

import {
  Chart,
  PointElement,
  CategoryScale,
  BarElement,
  LineElement,
  LinearScale,
} from "chart.js";
import Link from "next/link";
import { uniqByFilter } from "../utils/client_safe";

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
  const { user } = useUser();

  const snapshot = trpc.downloadLevelSnapShot.useQuery({
    user_id: user?.sub ?? null,
  });

  const mostTroublesomeArr = snapshot.data?.snapshot
    ? Object.entries(snapshot.data?.snapshot).map((kvp) => {
        const highWeightReccord = Object.entries(kvp[1]).sort(
          (a, b) => b[1] - a[1]
        )[0];
        if (highWeightReccord) {
          return highWeightReccord[0];
        }
      })
    : [];

  const uniqTroublesome = uniqByFilter(mostTroublesomeArr).flatMap((f) =>
    f ? [f] : []
  );

  return (
    <TopLevelWrapper backgroundColor={"#EDF2F7"}>
      <Flex direction="column" alignItems="center" gap="1rem">
        <HomeBtn />
        <Heading fontFamily={"honeyMushroom"}>Homework</Heading>
        <ul>
          {uniqTroublesome.map((mushroomName) => {
            return (
              <Link
                key={mushroomName}
                href={`/bank/${mushroomName}`}
                target="_blank"
              >
                <li>{mushroomName}</li>
              </Link>
            );
          })}
        </ul>
      </Flex>
    </TopLevelWrapper>
  );
};

export default Study;
