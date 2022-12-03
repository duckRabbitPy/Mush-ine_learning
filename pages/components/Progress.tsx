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
      </Flex>
      <Flex gap={2} fontSize="2xl" minHeight={"50px"}>
        {progress.map((r, i) =>
          r ? <Text key={i}>✅</Text> : <Text key={i}>❌</Text>
        )}
      </Flex>
    </>
  );
}

export default ProgressIndicator;
