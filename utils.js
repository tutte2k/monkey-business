export const STATE = {
  HANGING_IDLE: "HANGING_IDLE",
  HANGING_THROW: "HANGING_THROW",
};

export const STATEFRAMES = {
  HANGING_IDLE: getFrames("__monkey_onbranch_idle_", 20),
  HANGING_THROW: getFrames("__monkey_onbranch_throw_", 10),
};

export const STATEFRAMESCOUNT = {
  HANGING_IDLE: STATEFRAMES.HANGING_IDLE.length,
  HANGING_THROW: STATEFRAMES.HANGING_THROW.length,
};

function getFrames(state, frameCount) {
  const frames = [];
  for (let i = 0; i < frameCount; i++) {
    const img = new Image();
    img.src = `./assets/frames/${state}/${state}${i
      .toString()
      .padStart(3, "0")}.png`;
    frames.push(img.src);
  }
  return frames;
}

if (typeof module !== "undefined") {
  module.exports = { STATE, STATEFRAMES, STATEFRAMESCOUNT };
}
