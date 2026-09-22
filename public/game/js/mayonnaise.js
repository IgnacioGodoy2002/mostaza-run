export const MAYO_PER_SHIELD=100;
export const MAYO_SHIELD_SECONDS=5;
// Total collected persists within the run; charge wraps at every complete group of 100.
export function mayonnaiseReward(total){return {charge:total%MAYO_PER_SHIELD,activate:total>0&&total%MAYO_PER_SHIELD===0}}
