declare global {
  interface Window {
    snakeviz: SnakevizData;
  }
}

export type Rank = [display: number, sort: number];

export type ProfilerRow = [
    rank: Rank,
    ncalls: number,
    tottime: number,
    percall: number,
    cumtime: number,
    percallCum: number,
    funcName: string
];

// children mapping: child name -> [calls, calls, tottime, cumtime]
export type ChildrenMap = Record<string, [number, number, number, number]>;

// single callee entry
export interface Callee {
    children: ChildrenMap;
    stats: [number, number, number, number]; // [ncalls, ncalls, tottime, cumtime]
    callers: Record<string, [number, number, number, number]>;
    display_name: string;
}

// entire snakeviz structure
export interface SnakevizData {
    table_rows: ProfilerRow[];
    callees: Record<string, Callee>;
}
