import { trpc } from "../utils/trpc";

export const reactQueryConfig = {
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
};

export function useCommonTrpc() {
  const xpQuery = trpc.retrieveUserXP.useQuery();
  const saveSnapShot = trpc.saveLevelSnapShot.useMutation();
  const saveGameData = trpc.saveGameData.useMutation();

  return {
    xpQuery,
    saveSnapShot,
    saveGameData,
  };
}
