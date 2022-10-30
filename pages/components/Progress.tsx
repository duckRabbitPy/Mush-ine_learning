import { Flex, Text } from "@chakra-ui/react";

export type progressProps = {
  progress: boolean[];
  score: number;
  round: number;
};
export function ProgressIndicator({ progress, score, round }: progressProps) {
  return (
    <>
      <Flex gap={5}>
        <Text>Score: {score}</Text>
        <Text>Round: {round}</Text>
      </Flex>
      <Flex gap={2} fontSize="2xl">
        {progress.map((r, i) =>
          r ? <Text key={i}>✅</Text> : <Text key={i}>❌</Text>
        )}
      </Flex>
    </>
  );
}

export default ProgressIndicator;
