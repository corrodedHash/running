<script setup lang="ts">
import { Chart } from "chart.js";
import "chart.js/auto";
import { computed, onMounted, ref, watch } from "vue";
import { useRunningDataStore, type RunningData } from "./stores/counter";

const acquisitions = ref(null as null | HTMLCanvasElement);

const runningDataStore = useRunningDataStore();
const startOfThisYear = new Date(new Date(Date.now()).getFullYear(), 0, 1);
console.log(startOfThisYear);
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

watch(displayedData, (d) => {
  if (acquisitions.value === null) return;
  const data = runningDataStore.data;
  if (chart !== undefined) chart.destroy();
  chart = new Chart(acquisitions.value, {
    type: "line",
    options: {
      scales: {
        metersRun: {
          type: "linear",
          display: true,
          position: "left",
        },
        runningTime: {
          type: "linear",
          display: true,
          position: "right",

          // grid line settings
          grid: {
            drawOnChartArea: false, // only want the grid lines for one axis to show up
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
    },
    data: {
      labels: displayedData.value.map((row) => row.date.toLocaleDateString()),
      datasets: [
        {
          label: "Time run",
          data: displayedData.value.map((row) => row.runningTimeSeconds),
          yAxisID: "runningTime",
        },
        {
          label: "Meters run",
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
  <canvas ref="acquisitions"></canvas>
</template>

<style scoped></style>
