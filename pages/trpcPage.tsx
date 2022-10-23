import { Button } from "@chakra-ui/react";
import { trpc } from "../utils/trpc";
export default function trpcPage() {
  const userInfo = trpc.getUserInfo.useMutation();
  return (
    <div>
      <Button
        onClick={() => {
          userInfo.mutate({
            name: "oli",
            score: 100,
            testString: "hello",
            ranking: 1,
          });
        }}
      >
        Submit string to postgres
      </Button>
    </div>
  );
}
