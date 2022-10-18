import { Button } from "@chakra-ui/react";
import { trpc } from "../utils/trpc";
export default function trpcPage() {
  const hello = trpc.hello.useQuery({ text: "Oli" });
  const goodbye = trpc.goodBye.useQuery({ text: "Oli" });
  const userInfo = trpc.getUserInfo.useMutation();

  if (!hello.data) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <p>{hello.data.greeting}</p>
      <p>{goodbye.data?.farewell}</p>
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
