import { Chart } from "chart.js/auto";
import { useEffect, useRef } from "react";
import ChartDataLabels from "chartjs-plugin-datalabels";

Chart.register(ChartDataLabels);

function ChartDisplay({ goals, kras, kpis }) {
  const chartRef = useRef(null);

  useEffect(() => {
    const ctx = document.getElementById("countChart").getContext("2d");

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new Chart(ctx, {
      type: "pie",
      data: {
        labels: ["Goals", "KRAs", "KPIs"],
        datasets: [
          {
            data: [goals.length, kras.length, kpis.length],
            backgroundColor: ["#007bff", "#ffc107", "#28a745"],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "bottom" },
          datalabels: {
            color: "#fff",
            formatter: (value) => value,
            font: { weight: "bold", size: 14 },
          },
        },
      },
      plugins: [ChartDataLabels],
    });
  }, [goals, kras, kpis]);

  return <canvas id="countChart"></canvas>;
}

export default ChartDisplay;
