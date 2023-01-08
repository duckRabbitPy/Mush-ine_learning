import { ReactNode } from "react";
import { HexBrandColors } from "../_app";

type Props = {
  children: ReactNode;
  backgroundColor: HexBrandColors;
};

export const TopLevelWrapper = ({ children, backgroundColor }: Props) => (
  <div
    style={{
      backgroundColor,
      height: "fit-content",
      minHeight: "100vh",
    }}
  >
    {children}
  </div>
);

export default TopLevelWrapper;
