import type { Chart } from "chart.js";
import { buildChartData } from "./chartBuilder";
import type { RunningData } from "./stores/runningData";

export type DatasetDelta = {
  front: {
    drop: number;
    add: Array<{
      date: Date;
    }>;
  };
  back: {
    drop: number;
    add: Array<{
      date: Date;
    }>;
  };
};

function calculateDatasetDelta(
  inputDataset: { date: Date }[],
  targetDataset: { date: Date }[]
): DatasetDelta {
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

export function applyDeltaToChart(chart: Chart, delta: DatasetDelta) {
  chart.data.labels?.splice(0, delta.front.drop);
  if (delta.back.drop > 0) {
    chart.data.labels?.splice(-delta.back.drop);
  }
  chart.data.datasets.forEach((v) => {
    v.data.splice(0, delta.front.drop);
    if (delta.back.drop > 0) {
      v.data.splice(-delta.back.drop);
    }
  });
  const add_front_data = buildChartData(delta.front.add as RunningData[]);
  const add_back_data = buildChartData(delta.back.add as RunningData[]);
  chart.data.labels?.splice(0, 0, add_front_data.labels);
  chart.data.labels?.push(...add_back_data.labels);
  chart.data.datasets.forEach((v) => {
    const relevant_dataset_front = add_front_data.datasets.find(
      (x) => x.label == v.label
    );
    const relevant_dataset_back = add_back_data.datasets.find(
      (x) => x.label == v.label
    );
    if (
      relevant_dataset_front === undefined ||
      relevant_dataset_back === undefined
    ) {
      console.error("Could not find dataset");
      return;
    }

    v.data.splice(0, 0, ...relevant_dataset_front.data);
    v.data.push(...relevant_dataset_back.data);
  });
}
