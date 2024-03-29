import { Flex, Text } from "@chakra-ui/react";

export type progressProps = {
  progress: boolean[];
  score: number;
  round: number | undefined;
};
export function ProgressIndicator({ progress, score, round }: progressProps) {
  return (
    <>
      <Flex gap={5} justifyContent="center">
        <Text color="white">Score: {score}</Text>
        {round && <Text color="white">Round: {round}</Text>}
        {progress.map((r, i) =>
          r ? (
            <Text key={i} flexWrap="wrap">
              ✅
            </Text>
          ) : (
            <Text key={i}>❌</Text>
          )
        )}
      </Flex>
    </>
  );
}

export default ProgressIndicator;
