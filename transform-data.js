import path from "path";
import fs from "fs";
import { setTimeout } from "timers/promises";

const results = fs.readFileSync(path.resolve("results.csv"), "utf8");
const [_, ...resultsArray] = results.split("\n");

// block,tenure_height,txs,read_count,read_length,runtime,write_count,write_length
const accumulatedTenureResults = resultsArray
  .map((line) => line.split(","))
  .reduce((acc, current) => {
    const last = acc[acc.length - 1];
    if (last === undefined || last.tenure_height !== Number(current[1])) {
      return [
        ...acc,
        {
          tenure_height: Number(current[1]),
          txs: Number(current[2]),
          read_count: Number(current[3]),
          read_length: Number(current[4]),
          runtime: Number(current[5]),
          write_count: Number(current[6]),
          write_length: Number(current[7]),
        },
      ];
    }

    acc.pop();
    return [
      ...acc,
      {
        tenure_height: Number(current[1]),
        txs: last.txs + Number(current[2]),
        read_count: last.read_count + Number(current[3]),
        read_length: last.read_length + Number(current[4]),
        runtime: last.runtime + Number(current[5]),
        write_count: last.write_count + Number(current[6]),
        write_length: last.write_length + Number(current[7]),
      },
    ];
  }, []);

fs.writeFileSync(
  "results-grouped-by-tenure.csv",
  "tenure_height,txs,read_count,read_length,runtime,write_count,write_length\n" +
    accumulatedTenureResults
      .map(
        (result) =>
          `${result.tenure_height},${result.txs},${result.read_count},${result.read_length},${result.runtime},${result.write_count},${result.write_length}`
      )
      .join("\n")
);
