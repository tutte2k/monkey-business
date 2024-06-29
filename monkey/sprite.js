import { DIRECTION, STATEFRAMESCOUNT, imageCache } from "./utils.js";

export class Sprite {
  constructor(elementRef, state) {
    this.elementRef = elementRef;
    this.state = state;
    this.frameIndex = 0;
    this.intervalId = null;
    this.tempState = null;
    this.tempStateFrames = 0;
    this.prevState = state;
    this.startRotatingImages();
    this.direction = DIRECTION.LEFT;
  }

  startRotatingImages() {
    const intervalDuration = 1000 / 15;
    this.intervalId = setInterval(() => {
      if (this.tempState) {
        this.frameIndex++;
        if (this.frameIndex >= STATEFRAMESCOUNT[this.tempState]) {
          this.frameIndex = 0;
          this.tempStateFrames++;
          if (this.tempStateFrames >= 1) {
            this.state = this.prevState;
            this.tempState = null;
          }
        }
      } else {
        this.frameIndex = (this.frameIndex + 1) % STATEFRAMESCOUNT[this.state];
      }

      const image = imageCache.getImage(this.state, this.frameIndex);
      this.direction === DIRECTION.RIGHT
        ? image.classList.add("right")
        : image.classList.remove("right");

      this.elementRef.replaceChildren(
        imageCache.getImage(this.state, this.frameIndex)
      );

      console.log();
    }, intervalDuration);
  }

  updateState(newState) {
    this.state = newState;
    this.frameIndex = 0;
  }

  updateStateTemporarily(newState) {
    this.prevState = this.state;
    this.tempState = newState;
    this.tempStateFrames = 0;
    this.frameIndex = 0;
    this.state = newState;
  }
}

if (typeof module !== "undefined") {
  module.exports = Sprite;
}
