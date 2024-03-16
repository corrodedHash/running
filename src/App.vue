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

function calculateDatasetDelta(
  inputDataset: RunningData[],
  targetDataset: RunningData[]
): {
  front: { drop: number; add: Array<RunningData> };
  back: { drop: number; add: Array<RunningData> };
} {
  const drop_front_count = inputDataset.findIndex(
    (v) => v.date.getTime() == targetDataset[0].date.getTime()
  );
  const add_front_index = targetDataset.findIndex(
    (v) => v.date.getTime() == inputDataset[0].date.getTime()
  );
  const drop_back_count = inputDataset.findIndex(
    (v) =>
      v.date.getTime() == targetDataset[targetDataset.length - 1].date.getTime()
  );
  const add_back_index = targetDataset.findIndex(
    (v) =>
      v.date.getTime() == inputDataset[inputDataset.length - 1].date.getTime()
  );

  if (add_front_index === -1 && drop_front_count === -1) {
    return {
      front: { drop: inputDataset.length, add: [] },
      back: { drop: 0, add: targetDataset },
    };
  }

  const front = {
    drop: drop_front_count === -1 ? 0 : drop_front_count,
    add: targetDataset.slice(0, Math.max(0, add_front_index)),
  };
  const back = {
    drop:
      drop_back_count === -1 ? 0 : inputDataset.length - drop_back_count - 1,
    add: add_back_index === -1 ? [] : targetDataset.slice(add_back_index + 1),
  };

  return { front, back };
}

watch(displayedData, (d, oldD) => {
  if (chartCanvas.value === null) return;
  if (chart === undefined) {
    chart = buildChart(chartCanvas.value, d);
  } else {
    // const changeDelta = calculateDatasetDelta(oldD, d);
    // chart.data.labels?.splice(0, changeDelta.front.drop);
    // if (changeDelta.back.drop > 0) {
    //   chart.data.labels?.splice(-changeDelta.back.drop);
    // }
    // chart.data.datasets.forEach((v) => {
    //   v.data.splice(0, changeDelta.front.drop);
    //   if (changeDelta.back.drop > 0) {
    //     v.data.splice(-changeDelta.back.drop);
    //   }
    // });
    // const add_front_data = buildChartData(changeDelta.front.add);
    // const add_back_data = buildChartData(changeDelta.back.add);
    // chart.data.labels?.splice(0, 0, add_front_data.labels);
    // chart.data.labels?.push(...add_back_data.labels);
    // chart.data.datasets.forEach((v) => {
    //   const relevant_dataset_front = add_front_data.datasets.find(
    //     (x) => x.label == v.label
    //   );
    //   const relevant_dataset_back = add_back_data.datasets.find(
    //     (x) => x.label == v.label
    //   );
    //   if (
    //     relevant_dataset_front === undefined ||
    //     relevant_dataset_back === undefined
    //   ) {
    //     console.error("Could not find dataset");
    //     return;
    //   }

    //   v.data.splice(0, 0, relevant_dataset_front.data);
    //   v.data.push(...relevant_dataset_back.data);
    // });
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
