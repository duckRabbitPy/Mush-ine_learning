import { Bar } from "react-chartjs-2";
import { brandColors } from "../_app";

export function BarChart({ kvp }: { kvp: Record<string, number | string> }) {
  const labels = Object.keys(kvp).slice(0, 3);
  const data = Object.values(kvp).slice(0, 3);
  return (
    <Bar
      data={{
        labels,
        datasets: [
          {
            data,
            backgroundColor: brandColors[300],
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
          },
        },
      }}
    />
  );
}
