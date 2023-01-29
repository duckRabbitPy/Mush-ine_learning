import { Square, Text } from "@chakra-ui/react";
import Link from "next/link";
import BarChart, { chartColors } from "./BarChart";

export const MisidentifiedAsChart = ({
  misIdentifiedAs,
}: {
  misIdentifiedAs: Record<string, number>;
}) => {
  return (
    <>
      <ol>
        {Object.keys(misIdentifiedAs).map((name, i) => {
          return (
            <li key={name}>
              <Link href={`/bank/${name}`} passHref target="_blank">
                {name}{" "}
                <Square bg={chartColors[i]} size="10px" display="inline-flex" />
              </Link>
            </li>
          );
        })}
      </ol>
      {Object.keys(misIdentifiedAs).length > 0 ? (
        <div
          style={{
            height: "200px",
            marginTop: "3rem",
          }}
        >
          <BarChart kvp={misIdentifiedAs} max={5} yAxisTitle="frequency" />
        </div>
      ) : (
        <Text color="blue.600" padding="2rem">
          No misidentification data!
        </Text>
      )}
    </>
  );
};

export default MisidentifiedAsChart;
