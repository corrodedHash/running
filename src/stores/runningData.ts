import { ref } from "vue";
import { defineStore } from "pinia";

export interface RunningData {
  date: Date;
  runningTimeSeconds: number;
  distanceMeters: number;
}

export const useRunningDataStore = defineStore("runningData", () => {
  const data = ref([] as RunningData[]);
  async function update() {
    const running_csv = await fetch("./running.csv", { method: "GET" });
    const running_text = await running_csv.text();
    data.value = running_text
      .split("\n")
      .filter((v) => v.indexOf(",") !== -1)
      .map((v): RunningData => {
        const [date, time, distance] = v.split(",");

        const runningTimeSeconds = time
          .split(":")
          .map(v=>parseInt(v))
          .reduce((prev, current) => prev * 60 + current, 0);
        const distanceMeters = Math.round(parseFloat(distance) * 1000);
        return { date: new Date(date), runningTimeSeconds, distanceMeters };
      });
  }
  return { data, update };
});
