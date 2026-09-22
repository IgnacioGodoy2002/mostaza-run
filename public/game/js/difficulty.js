// Smooth progression: ~16 at start, 20 at 500m, 24 at 1km, 30 at 2km.
// Asymptotic cap avoids unplayable speeds on long survival runs.
export function runSpeed(distance){return 16+26*(1-Math.exp(-Math.max(0,distance)/2600))}
