<script setup lang="ts">
import { Chart } from "chart.js";
import "chart.js/auto";
import { computed, ref, watch } from "vue";
import { useRunningDataStore, type RunningData } from "./stores/counter";
import { buildChart } from "./chartBuilder";
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
  if (chart !== undefined) chart.destroy();
  chart = buildChart(chartCanvas.value, displayedData.value);
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
