import { Chart, type TooltipItem } from "chart.js";

function formatSeconds(seconds: number): string {
  return new Date(seconds * 1000).toISOString().slice(11, 19);
}

export function buildChartData(data: Array<any>) {
  return {
    labels: data.map((row) => row.date.toLocaleDateString()),
    datasets: [
      {
        label: "Duration",
        data: data.map((row) => row.runningTimeSeconds),
        yAxisID: "runningTime",
      },
      {
        label: "Distance",
        data: data.map((row) => row.distanceMeters),
        yAxisID: "metersRun",
      },
      {
        label: "Minutes per km",
        data: data.map(
          (row) => row.runningTimeSeconds / 60 / (row.distanceMeters / 1000)
        ),
        yAxisID: "mpkm",
      },
    ],
  };
}

export function buildChart(
  element: HTMLCanvasElement,
  data: Array<any>
): Chart {
  return new Chart(element, {
    type: "line",
    options: {
      scales: {
        metersRun: {
          type: "linear",
          display: true,
          position: "left",
          ticks: {
            callback(tickValue, index, ticks) {
              if (typeof tickValue === "string") {
                throw Error("Please only input integers");
              }
              let bla = tickValue / 1000;
              return `${bla}km`;
            },
          },
        },
        runningTime: {
          type: "linear",
          display: true,
          position: "right",
          grid: {
            drawOnChartArea: false,
          },
          ticks: {
            callback(tickValue, index, ticks) {
              if (typeof tickValue === "string") {
                throw Error("Please only input integers");
              }
              return formatSeconds(tickValue);
            },
            stepSize: 60,
          },
        },
        mpkm: {
          type: "linear",
          display: true,
          grid: {
            drawOnChartArea: false,
          },
        },
        // x: {
        //   ticks: {
        //     stepSize: 3,
        //     callback(tickValue, index, ticks) {
        //       return tickValue;
        //     },
        //   },
        // },
      },
      plugins: {
        tooltip: {
          intersect: false,
          mode: "nearest",
          position: "nearest",
          axis: "x",
          callbacks: {
            label(tooltipItem: TooltipItem<"line">) {
              switch (tooltipItem.datasetIndex) {
                case 0: // Duration
                  return (
                    // tooltipItem.dataset.label +
                    // ": " +
                    formatSeconds(tooltipItem.parsed.y)
                  );

                case 1: // Distance
                  return (
                    // tooltipItem.dataset.label +
                    // ": " +
                    tooltipItem.parsed.y + "m"
                  );
                case 2: // Minutes per km
                  return (
                    // tooltipItem.dataset.label +
                    // ": " +
                    tooltipItem.parsed.y.toFixed(2) + " min/km"
                  );
              }
              return tooltipItem.dataset.label;
            },
          },
        },
      },
    },
    data: buildChartData(data),
  });
}
