import { Bar } from "react-chartjs-2";

type BarchartProps = {
  kvp: Record<string, number | string>;
  yAxisTitle?: string;
  showYticks?: boolean;
  max?: number;
};

export const chartColors = [
  "#665191",
  "#a05195",
  "#d45087",
  "#f95d6a",
  "#ffa600",
] as const;

export function BarChart({ kvp, max, yAxisTitle, showYticks }: BarchartProps) {
  const labels = Object.keys(kvp).slice(0, max ?? undefined);
  const data = Object.values(kvp).slice(0, max ?? undefined);
  return (
    <Bar
      data={{
        labels,
        datasets: [
          {
            data,
            backgroundColor: chartColors,
            borderColor: "rgb(135, 211, 124)",
          },
        ],
      }}
      options={{
        plugins: {
          title: {
            display: true,
            text: "misidentified",
          },
          legend: {
            align: "center",
            maxWidth: 5,
          },
        },
        scales: {
          y: {
            grid: {
              display: false,
            },
            ticks: {
              display: !!showYticks,
              maxTicksLimit: showYticks ? 3 : undefined,
            },
            suggestedMin: 0,
            title: {
              display: true,
              text: yAxisTitle,
            },
          },
        },
      }}
    />
  );
}

export default BarChart;
