import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "redis";

function createCounterClient(url: string) {
  return createClient({
    url,
    socket: {
      connectTimeout: 2_000,
      reconnectStrategy: false,
    },
  });
}

type CounterRedis = ReturnType<typeof createCounterClient>;

import {
  applyReport,
  emptyProcessedCountState,
  pruneSamples,
  SAMPLE_WINDOW_MS,
  type ProcessedCountState,
  type ProcessedSample,
} from "@/lib/processedCount";

const TOTAL_KEY = "snapbit:processed:total";
const SAMPLES_KEY = "snapbit:processed:samples";

const dataFile = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../.data/processed-count.json");

type ProcessedCountStore = {
  read(now: number): Promise<ProcessedCountState>;
  record(count: number, now: number): Promise<ProcessedCountState>;
};

let store: ProcessedCountStore | undefined;

export async function readProcessedCountState(now: number): Promise<ProcessedCountState> {
  return getStore().read(now);
}

export async function recordProcessedCount(count: number, now: number): Promise<ProcessedCountState> {
  return getStore().record(count, now);
}

function getStore(): ProcessedCountStore {
  if (store) return store;

  const url = process.env.REDIS_URL?.trim();
  if (url) {
    store = createRedisStore(url);
    return store;
  }

  if (process.env.VERCEL) {
    store = createUnconfiguredStore();
    return store;
  }

  store = createFileStore();
  return store;
}

function createUnconfiguredStore(): ProcessedCountStore {
  return {
    async read() {
      return emptyProcessedCountState();
    },
    async record() {
      throw new Error("Set REDIS_URL to the Railway Redis public URL to store the processed-file counter.");
    },
  };
}

function createFileStore(): ProcessedCountStore {
  let queue: Promise<unknown> = Promise.resolve();

  const update = (task: (current: ProcessedCountState) => ProcessedCountState) => {
    const run = queue.then(async () => {
      const current = await readStateFile();
      const next = task(current);
      await writeStateFile(next);
      return next;
    });
    queue = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  };

  return {
    async read(now) {
      const state = await readStateFile();
      return { total: state.total, samples: pruneSamples(state.samples, now) };
    },
    record(count, now) {
      return update((current) => applyReport(current, count, now));
    },
  };
}

async function readStateFile(): Promise<ProcessedCountState> {
  try {
    const raw = await readFile(dataFile, "utf8");
    const parsed = JSON.parse(raw) as Partial<ProcessedCountState>;
    const total = typeof parsed.total === "number" && parsed.total >= 0 ? parsed.total : 0;
    const samples = Array.isArray(parsed.samples) ? parsed.samples.filter(isSample) : [];
    return { total, samples };
  } catch (error) {
    if (isMissingFile(error)) return emptyProcessedCountState();
    throw error;
  }
}

async function writeStateFile(state: ProcessedCountState) {
  await mkdir(path.dirname(dataFile), { recursive: true });
  const tmp = `${dataFile}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(state), "utf8");
  await rename(tmp, dataFile);
}

let redisClient: CounterRedis | undefined;
let redisConnecting: Promise<CounterRedis> | undefined;

function createRedisStore(url: string): ProcessedCountStore {
  return {
    async read(now) {
      const redis = await getRedis(url);
      const cutoff = now - SAMPLE_WINDOW_MS;
      const results = await redis
        .multi()
        .get(TOTAL_KEY)
        .zRemRangeByScore(SAMPLES_KEY, "-inf", cutoff)
        .zRange(SAMPLES_KEY, cutoff, "+inf", { BY: "SCORE" })
        .exec();

      return stateFromRedis(results[0], results[2]);
    },
    async record(count, now) {
      const redis = await getRedis(url);
      const cutoff = now - SAMPLE_WINDOW_MS;
      const member = `${now}:${count}:${crypto.randomUUID()}`;
      const results = await redis
        .multi()
        .incrBy(TOTAL_KEY, count)
        .zAdd(SAMPLES_KEY, { score: now, value: member })
        .zRemRangeByScore(SAMPLES_KEY, "-inf", cutoff)
        .get(TOTAL_KEY)
        .zRange(SAMPLES_KEY, cutoff, "+inf", { BY: "SCORE" })
        .exec();

      return stateFromRedis(results[3], results[4]);
    },
  };
}

function getRedis(url: string): Promise<CounterRedis> {
  if (redisClient?.isOpen) return Promise.resolve(redisClient);
  if (!redisConnecting) {
    const created = createCounterClient(url);
    created.on("error", () => {});
    redisConnecting = created
      .connect()
      .then(() => {
        redisClient = created;
        return created;
      })
      .catch((error: unknown) => {
        redisClient = undefined;
        void created.disconnect().catch(() => {});
        throw error;
      })
      .finally(() => {
        redisConnecting = undefined;
      });
  }
  return redisConnecting;
}

function stateFromRedis(totalRaw: unknown, membersRaw: unknown): ProcessedCountState {
  const totalNumber = typeof totalRaw === "number" ? totalRaw : Number(totalRaw ?? 0);
  const members = Array.isArray(membersRaw) ? membersRaw : [];
  const samples = members.flatMap((member) => {
    if (typeof member !== "string") return [];
    const [atRaw, countRaw] = member.split(":");
    const at = Number(atRaw);
    const count = Number(countRaw);
    if (!Number.isFinite(at) || !Number.isInteger(count) || count < 1) return [];
    return [{ at, count }];
  });

  return {
    total: Number.isFinite(totalNumber) && totalNumber >= 0 ? totalNumber : 0,
    samples,
  };
}

function isSample(value: unknown): value is ProcessedSample {
  if (!value || typeof value !== "object") return false;
  const sample = value as ProcessedSample;
  return typeof sample.at === "number" && typeof sample.count === "number";
}

function isMissingFile(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}
