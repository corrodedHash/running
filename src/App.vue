<script setup lang="ts">
import { Chart } from "chart.js";
import "chart.js/auto";
import { computed, ref, watch } from "vue";
import { useRunningDataStore, type RunningData } from "./stores/counter";
const chartCanvas = ref(null as null | HTMLCanvasElement);

const runningDataStore = useRunningDataStore();
const startOfThisYear = new Date(new Date(Date.now()).getFullYear(), 0, 1);
const minDateSelected = ref(startOfThisYear as undefined | Date);
const maxDateSelected = ref(undefined as undefined | Date);

const displayedData = computed((): RunningData[] => {
  const minIndex = runningDataStore.data.findIndex((v) =>
    minDateSelected.value === undefined ? true : v.date >= minDateSelected.value
  );
  const maxIndexCandidate = runningDataStore.data.findIndex((v) =>
    maxDateSelected.value === undefined ? false : v.date < maxDateSelected.value
  );
  let maxIndex =
    maxIndexCandidate === -1 ? runningDataStore.data.length : maxIndexCandidate;
  return runningDataStore.data.slice(minIndex, maxIndex);
});

let chart = undefined as undefined | Chart;

function formatSeconds(seconds: number): string {
  return new Date(seconds * 1000).toISOString().slice(11, 19);
}

watch(displayedData, (d) => {
  if (chartCanvas.value === null) return;
  if (chart !== undefined) chart.destroy();
  chart = new Chart(chartCanvas.value, {
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

          // grid line settings
          grid: {
            drawOnChartArea: false, // only want the grid lines for one axis to show up
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
          axis: "y",
          // grid line settings
          grid: {
            drawOnChartArea: false, // only want the grid lines for one axis to show up
          },
        },
      },
      plugins: {
        tooltip: {
          intersect: true,
          mode: "x",
          position: "nearest",
          callbacks: {
            label(tooltipItem) {
              switch (tooltipItem.datasetIndex) {
                case 0: // Duration
                  return (
                    tooltipItem.dataset.label +
                    ": " +
                    formatSeconds(tooltipItem.parsed.y)
                  );

                case 1: // Distance
                  return (
                    tooltipItem.dataset.label +
                    ": " +
                    tooltipItem.parsed.y +
                    "m"
                  );
                case 2: // Minutes per km
                  return (
                    tooltipItem.dataset.label +
                    ": " +
                    tooltipItem.parsed.y.toFixed(2) +
                    " min/km"
                  );
              }
              return tooltipItem.dataset.label;
            },
          },
        },
      },
    },
    data: {
      labels: displayedData.value.map((row) => row.date.toLocaleDateString()),
      datasets: [
        {
          label: "Duration",
          data: displayedData.value.map((row) => row.runningTimeSeconds),
          yAxisID: "runningTime",
        },
        {
          label: "Distance",
          data: displayedData.value.map((row) => row.distanceMeters),
          yAxisID: "metersRun",
        },
        {
          label: "Minutes per km",
          data: displayedData.value.map(
            (row) => row.runningTimeSeconds / 60 / (row.distanceMeters / 1000)
          ),
          yAxisID: "mpkm",
        },
      ],
    },
  });
});

runningDataStore.update();
</script>

<template>
  <div
    @click="
      minDateSelected =
        runningDataStore.data[Math.max(0, runningDataStore.data.length - 20)]
          .date
    "
  >
    Last twenty
  </div>
  <div @click="minDateSelected = undefined">All</div>
  <canvas ref="chartCanvas"></canvas>
</template>

<style scoped></style>
