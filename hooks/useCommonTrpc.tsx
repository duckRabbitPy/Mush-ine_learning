import { trpc } from "../utils/trpc";

export const reactQueryConfig = {
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
};

export function useCommonTrpc() {
  const xpQuery = trpc.retrieveUserScore.useQuery();
  const saveSnapShot = trpc.saveLevelSnapShot.useMutation();
  const saveScore = trpc.storeUserScore.useMutation();
  const saveTrainingData = trpc.storeTrainingData.useMutation();
  const saveRoundMetaData = trpc.storeRoundMetadata.useMutation();

  return {
    xpQuery,
    saveSnapShot,
    saveScore,
    saveTrainingData,
    saveRoundMetaData,
  };
}
