// src/handlandmarks/smoothing.ts
let ema: number[] | null = null;

export function smoothProbs(probs: number[], alpha=0.6): number[] {
  if (!ema) ema = Array.from(probs);
  else for (let i=0;i<probs.length;i++) ema[i] = alpha*ema[i] + (1-alpha)*probs[i];
  return Array.from(ema);
}

export function decide(labels: string[], probs: number[], tau=0.7): string | null {
  let bestI = 0, bestV = -1;
  for (let i=0;i<probs.length;i++) if (probs[i]>bestV) {bestV=probs[i]; bestI=i;}
  return bestV >= tau ? labels[bestI] : null;
}
