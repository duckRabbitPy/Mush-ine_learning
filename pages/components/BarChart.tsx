import { Bar } from "react-chartjs-2";

export const chartColors = [
  "#665191",
  "#a05195",
  "#d45087",
  "#f95d6a",
  "#ffa600",
];

export function BarChart({ kvp }: { kvp: Record<string, number | string> }) {
  const labels = Object.keys(kvp).slice(0, 5);
  const data = Object.values(kvp).slice(0, 5);
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
              display: false,
            },
            suggestedMin: 0,
            title: {
              display: true,
              text: "frequency",
            },
          },
        },
      }}
    />
  );
}

export default BarChart;
