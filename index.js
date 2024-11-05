import path from "path";
import fs from "fs";
import { setTimeout } from "timers/promises";

let blockHeight = 186905;
// Nakamoto went live on block 171832

const getBlockInfo = async (blockHeight) => {
  try {
    const response = await fetch(
      `https://api.hiro.so/extended/v2/blocks/${blockHeight}`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.HIRO_API_KEY,
        },
        method: "GET",
      }
    );
    if (response.status !== 200) {
      console.info("Bad response...", response.status, "waiting to retry");
      await setTimeout(30_000);
      return getBlockInfo(blockHeight);
    }
    return response;
  } catch (error) {
    console.error("error", error, "retrying in 1 second");
    await setTimeout(1000);
    return getBlockInfo(blockHeight);
  }
};

(async () => {
  fs.writeFileSync(
    path.resolve("results.csv"),
    "block,tenure_height,txs,read_count,read_length,runtime,write_count,write_length\n"
  );
  while (blockHeight > 1000) {
    const response = await getBlockInfo(blockHeight);
    const responseBody = await response.json();
    const txCount = responseBody.tx_count;
    const tenureHeight = responseBody.tenure_height;
    const readCount = responseBody.execution_cost_read_count;
    const readLength = responseBody.execution_cost_read_length;
    const runtime = responseBody.execution_cost_runtime;
    const writeCount = responseBody.execution_cost_write_count;
    const writeLength = responseBody.execution_cost_write_length;

    process.stdout.write(
      `Block ${blockHeight}, Tenure ${tenureHeight}: ${txCount}, ${readCount}, ${readLength}, ${runtime}, ${writeCount}, ${writeLength}\n`
    );
    fs.appendFileSync(
      path.resolve("results.csv"),
      `${blockHeight},${tenureHeight},${txCount},${readCount},${readLength},${runtime},${writeCount},${writeLength}\n`
    );
    blockHeight = blockHeight - 1;
    await setTimeout(100);
  }
})();
