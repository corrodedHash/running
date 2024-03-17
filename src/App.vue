<script setup lang="ts">
import { Chart } from "chart.js";
import "chart.js/auto";
import { computed, ref, watch } from "vue";
import { useRunningDataStore, type RunningData } from "./stores/runningData";
import { buildChart, buildChartData } from "./chartBuilder";
const chartCanvas = ref(null as null | HTMLCanvasElement);

const runningDataStore = useRunningDataStore();
const startOfThisYear = new Date(new Date(Date.now()).getFullYear(), 0, 1);
const minDateSelected = ref(startOfThisYear as undefined | Date);
const maxDateSelected = ref(undefined as undefined | Date);
function displayedDateRange(
  minDateSelected: Date | undefined,
  maxDateSelected: Date | undefined
) {
  const minIndex = runningDataStore.data.findIndex((v) =>
    minDateSelected === undefined ? true : v.date >= minDateSelected
  );
  const maxIndexCandidate = runningDataStore.data.findIndex((v) =>
    maxDateSelected === undefined ? false : v.date < maxDateSelected
  );
  let maxIndex =
    maxIndexCandidate === -1 ? runningDataStore.data.length : maxIndexCandidate;
  return [minIndex, maxIndex];
}

const displayedData = computed((): RunningData[] => {
  const [minIndex, maxIndex] = displayedDateRange(
    minDateSelected.value,
    maxDateSelected.value
  );
  return runningDataStore.data.slice(minIndex, maxIndex);
});

let chart = undefined as undefined | Chart;

watch(displayedData, (d, oldD) => {
  if (chartCanvas.value === null) return;
  if (chart === undefined) {
    chart = buildChart(chartCanvas.value, d);
  } else {
    // const changeDelta = calculateDatasetDelta(oldD, d);
    // applyDeltaToChart(chart, changeDelta)
    chart.data = buildChartData(d);
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
