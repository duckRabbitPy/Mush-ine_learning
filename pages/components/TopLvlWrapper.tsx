import { ReactNode } from "react";
type Hex = `#${string}`;

type Props = {
  children: ReactNode;
  backgroundColor: Hex;
};

export const TopLevelWrapper = ({ children, backgroundColor }: Props) => (
  <div style={{ backgroundColor, height: "100vh" }}>{children}</div>
);

export default TopLevelWrapper;
