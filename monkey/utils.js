export const STATE = {
  HANGING_IDLE: "HANGING_IDLE",
  HANGING_THROW: "HANGING_THROW",
  FALL: "FALL",
};

export const STATEFRAMES = {
  HANGING_IDLE: getFrames("__monkey_onbranch_idle_", 20),
  HANGING_THROW: getFrames("__monkey_onbranch_throw_", 10),
  FALL: getFrames("__monkey_onbranch_fall_", 20),
};

export const STATEFRAMESCOUNT = {
  HANGING_IDLE: STATEFRAMES.HANGING_IDLE.length,
  HANGING_THROW: STATEFRAMES.HANGING_THROW.length,
  FALL: STATEFRAMES.FALL.length,
};

function getFrames(state, frameCount) {
  const frames = [];
  for (let i = 0; i < frameCount; i++) {
    const img = new Image();
    img.src = `./monkey/sprites/frames/${state}/${state}${i
      .toString()
      .padStart(3, "0")}.png`;
    frames.push(img.src);
  }
  return frames;
}

if (typeof module !== "undefined") {
  module.exports = { STATE, STATEFRAMES, STATEFRAMESCOUNT };
}
