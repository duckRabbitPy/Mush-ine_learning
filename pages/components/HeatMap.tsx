import { Grid, Square, Tooltip } from "@chakra-ui/react";
import { brandColors } from "../_app";

export const HeatMap = ({ heatmap }: { heatmap: TimeAndResult[] }) => {
  return (
    <Grid gridTemplateColumns={"repeat(7, 0fr)"}>
      {heatmap.map((result, i) => (
        <Tooltip
          key={i}
          label={new Date(result.timestamp).toLocaleString("en", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
          backgroundColor={
            result.correct_answer ? brandColors.green : brandColors.red
          }
        >
          <Square
            size="40px"
            key={i}
            bg={result.correct_answer ? brandColors.green : brandColors.red}
          >
            <span style={{ opacity: 0.3 }}>{i + 1}</span>
          </Square>
        </Tooltip>
      ))}
    </Grid>
  );
};

export default HeatMap;
