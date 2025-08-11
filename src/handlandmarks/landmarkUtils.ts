// src/handlandmarks/landmarkUtils.ts
// Normaliza 21 puntos (x,y,z): centra en muñeca (idx 0) y escala por
// distancia media a muñeca; devuelve vector plano de 63 floats.

export function normalizeLandmarks(lm: number[][]): number[] | null {
  if (!lm || lm.length !== 21) return null;

  const wrist = lm[0];
  const centered = lm.map(([x,y,z]) => [x - wrist[0], y - wrist[1], z - wrist[2]]);
  const dists = centered.map(([x,y,z]) => Math.sqrt(x*x + y*y + z*z));
  const meanDist = dists.reduce((a,b)=>a+b,0) / dists.length || 1e-6;

  const scaled = centered.map(([x,y,z]) => [x/meanDist, y/meanDist, z/meanDist]);
  // Opción espejo para mano izquierda/derecha:
  // const mirrored = scaled.map(([x,y,z]) => [-x, y, z]);

  // Aplana a 63D
  const feat: number[] = [];
  for (const p of scaled) feat.push(p[0], p[1], p[2]);
  return feat;
}
