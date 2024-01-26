<script setup lang="ts">
import { Chart } from "chart.js";
import "chart.js/auto";
import { computed, ref, watch } from "vue";
import { useRunningDataStore, type RunningData } from "./stores/counter";
import { buildChart, buildChartData } from "./chartBuilder";
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

watch(displayedData, (d) => {
  if (chartCanvas.value === null) return;
  if (chart === undefined) {
    chart = buildChart(chartCanvas.value, displayedData.value);
  } else {
    // chart.data.datasets.forEach((v) => v.data.pop());
    // chart.data.labels?.pop();
    chart.data = buildChartData(displayedData.value);
    chart.update();
  }
});

runningDataStore.update();
</script>

<template>
  <div
    class="button"
    @click="
      minDateSelected =
        runningDataStore.data[Math.max(0, runningDataStore.data.length - 20)]
          .date
    "
  >
    Last twenty
  </div>
  <div class="button" @click="minDateSelected = undefined">All</div>
  <canvas ref="chartCanvas"></canvas>
</template>

<style scoped>
.button {
  margin: 0.2em;
  background-color: #0095ff;
  border: 1px solid transparent;
  border-radius: 3px;
  box-shadow: rgba(255, 255, 255, 0.4) 0 1px 0 0 inset;
  box-sizing: border-box;
  color: #fff;
  cursor: pointer;
  display: inline-block;
  font-family: -apple-system, system-ui, "Segoe UI", "Liberation Sans",
    sans-serif;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.15385;
  outline: none;
  padding: 8px 0.8em;
  text-align: center;
  text-decoration: none;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  vertical-align: baseline;
  white-space: nowrap;
}

.button:hover,
.button:focus {
  background-color: #07c;
}

.button:focus {
  box-shadow: 0 0 0 4px rgba(0, 149, 255, 0.15);
}

.button:active {
  background-color: #0064bd;
  box-shadow: none;
}
</style>
