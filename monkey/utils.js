class ImageCache {
  constructor() {
    this.cache = {};
  }

  preload(state, path, frameCount) {
    if (!this.cache[state]) {
      this.cache[state] = [];
      for (let i = 0; i < frameCount; i++) {
        const img = this.#createImage(path, i);
        this.cache[state].push(img);
        // console.log(`cached ${state} ${i} `);
      }
    }
  }

  #createImage(path, i) {
    const img = new Image();
    img.src = `./monkey/sprites/frames/${path}/${path}${i
      .toString()
      .padStart(3, "0")}.png`;
    return img;
  }

  getImage(state, i) {
    // console.log(`get ${state} ${i} `);
    return this.cache[state] ? this.cache[state][i] : null;
  }
}

export const STATES = {
  HANGING_IDLE: "HANGING_IDLE",
  HANGING_THROW: "HANGING_THROW",
  FALL: "FALL",
};
export const STATEFRAMESCOUNT = {
  HANGING_IDLE: 20,
  HANGING_THROW: 10,
  FALL: 20,
};
export const STATEFRAMESPATH = {
  HANGING_IDLE: "__monkey_onbranch_idle_",
  HANGING_THROW: "__monkey_onbranch_throw_",
  FALL: "__monkey_onbranch_fall_",
};

export const imageCache = new ImageCache();
Object.keys(STATES).forEach((key) =>
  imageCache.preload(key, STATEFRAMESPATH[key], STATEFRAMESCOUNT[key])
);

if (typeof module !== "undefined") {
  module.exports = { STATES, STATEFRAMES, STATEFRAMESCOUNT, imageCache };
}
