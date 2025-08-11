// src/handlandmarks/classifier.ts
// Clasificador lineal softmax: y = softmax(Wx + b)
// Carga pesos desde /weights.json {W:[[...],[...],[...]], b:[...]}

export type Weights = { W: number[][]; b: number[]; labels: string[] };

let weights: Weights | null = null;

export async function loadWeights(url = "/weights.json") {
  const res = await fetch(url);
  if (!res.ok) throw new Error("No se pudo cargar weights.json");
  const data = await res.json();
  // Validación mínima
  if (!Array.isArray(data.W) || !Array.isArray(data.b) || !Array.isArray(data.labels)) {
    throw new Error("Formato inválido de weights.json");
  }
  weights = data;
  return weights;
}

function matVec(W: number[][], x: number[]): number[] {
  const out = new Array(W.length).fill(0);
  for (let i=0; i<W.length; i++) {
    const row = W[i]; let s = 0;
    for (let j=0; j<row.length; j++) s += row[j]*x[j];
    out[i] = s;
  }
  return out;
}

function addBias(v: number[], b: number[]) {
  return v.map((vi, i) => vi + b[i]);
}

function softmax(z: number[]): number[] {
  const m = Math.max(...z);
  const exps = z.map(v => Math.exp(v - m));
  const sum = exps.reduce((a,b)=>a+b,0) || 1e-6;
  return exps.map(e => e/sum);
}

export function predictProba(x63: number[]): { labels: string[]; probs: number[] } {
  if (!weights) throw new Error("Pesos no cargados");
  const z = addBias(matVec(weights.W, x63), weights.b);
  const probs = softmax(z);
  return { labels: weights.labels, probs };
}
