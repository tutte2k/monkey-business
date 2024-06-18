import { STATE, STATEFRAMES, STATEFRAMESCOUNT } from "./utils.js";

export class Agent {
  constructor(elementRef, targets) {
    this.elementRef = elementRef;
    this.targets = targets;
    this.state = STATE.HANGING_IDLE;
    this.frameIndex = 0;
    this.intervalId = null;

    this.startRotatingImages(elementRef);
    this.dragHandler(elementRef);

    this.throwSpeed = 2000;

    this.currentIndex = 0;
    setTimeout(() => this.shootBullet(), 2000);
  }

  startRotatingImages(elementRef) {
    const intervalDuration = 1000 / 15;
    this.intervalId = setInterval(() => {
      this.frameIndex = (this.frameIndex + 1) % STATEFRAMESCOUNT[this.state];
      elementRef.style.backgroundImage = `url(${
        STATEFRAMES[this.state][this.frameIndex]
      })`;
    }, intervalDuration);
  }

  shootBullet() {
    if (this.currentIndex < this.targets.length) {
      this.state = STATE.HANGING_THROW;
      const target = this.targets[this.currentIndex];
      target.style.borderWidth = "2px";
      const agentRect = this.elementRef.getBoundingClientRect();
      const bullet = this.createBullet(agentRect);
      const targetRect = target.getBoundingClientRect();

      this.animateBullet(targetRect, agentRect, bullet, () =>
        this.onBulletHitTarget(bullet, target)
      );
    } else {
      console.log("All elements are now visible.");
    }
  }

  onBulletHitTarget(bullet, target) {
    bullet.remove();
    target.remove();
    this.currentIndex++;
    if (this.currentIndex < this.targets.length) {
      setTimeout(() => this.shootBullet(), 20);
    } else {
      setTimeout(() => this.startFinalAttack(), 20);
    }
  }

  startFinalAttack() {
    const agentRect = this.elementRef.getBoundingClientRect();
    const bullet = this.createBullet(agentRect);

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const targetRect = {
      left: centerX - 1,
      top: centerY - 1,
      width: 2,
      height: 2,
    };

    this.animateBullet(
      targetRect,
      agentRect,
      bullet,
      () => this.show404Error(),
      true
    );
  }

  animateBullet(targetRect, agentRect, bullet, callback, scaleUp = false) {
    const deltaX =
      targetRect.left +
      targetRect.width / 2 -
      agentRect.left -
      agentRect.width / 2;
    const deltaY = targetRect.top - agentRect.top;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const duration = scaleUp ? 1000 : this.throwSpeed;
    const steps = duration / 16;
    const stepX = deltaX / steps;
    const stepY = deltaY / steps;

    let currentStep = 0;
    const moveBullet = () => {
      if (currentStep < steps) {
        const translateX = stepX * currentStep;
        const translateY = stepY * currentStep;
        const rotate = (360 / steps) * (currentStep * 2);
        const scale = scaleUp ? 1 + (currentStep / steps) * 70 : 1;

        bullet.style.transform = `translate(${translateX}px, ${translateY}px) rotate(${rotate}deg) scale(${scale})`;
        currentStep++;
        requestAnimationFrame(moveBullet);
      } else {
        callback();
      }
    };

    requestAnimationFrame(moveBullet);
  }

  createBullet(agentRect) {
    const bullet = document.createElement("div");
    bullet.className = "bullet";
    bullet.style.left = `${agentRect.left + agentRect.width / 2}px`;
    bullet.style.top = `${agentRect.top}px`;
    document.body.appendChild(bullet);
    return bullet;
  }

  show404Error() {
    document.body.innerHTML = "";
    const div = document.createElement("div");
    div.classList.add("HTTP410");
    document.body.appendChild(div);

    const squareSize = 50;
    const containerWidth = window.innerWidth;
    const containerHeight = window.innerHeight;

    const rows = Math.floor(containerHeight / squareSize);
    const cols = Math.ceil(containerWidth / squareSize);

    const adjustedHeight = rows * squareSize;
    const adjustedWidth = cols * squareSize;
    div.style.height = `${adjustedHeight}px`;
    div.style.width = `${adjustedWidth}px`;

    const squares = [];

    for (let row = 0; row < rows; row++) {
      const rowSquares = [];
      for (let col = 0; col < cols; col++) {
        const square = document.createElement("div");
        square.classList.add("overlay-square");
        square.style.width = `${squareSize}px`;
        square.style.height = `${squareSize}px`;
        square.style.transition = "opacity 0.5s";

        const grayValue = Math.floor(Math.random() * 256);
        const grayColor = `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
        square.style.backgroundColor = grayColor;
        rowSquares.push(square);
        div.appendChild(square);
      }
      squares.push(rowSquares);
    }

    const getLuminance = (rgb) => {
      const [r, g, b] = rgb.match(/\d+/g).map(Number);
      return 0.299 * r + 0.587 * g + 0.114 * b;
    };

    const swapSquares = (row, index1, index2) => {
      const temp = squares[row][index1];
      squares[row][index1] = squares[row][index2];
      squares[row][index2] = temp;

      squares[row].forEach((square) => div.appendChild(square));
    };

    const swapSquaresCols = (col, row1, row2) => {
      const temp = squares[row1][col];
      squares[row1][col] = squares[row2][col];
      squares[row2][col] = temp;

      squares.forEach((rowSquares) =>
        rowSquares.forEach((square) => div.appendChild(square))
      );
    };

    const bubbleSortRow = async (row) => {
      let len = squares[row].length;
      for (let i = 0; i < len; i++) {
        for (let j = 0; j < len - i - 1; j++) {
          const lumA = getLuminance(squares[row][j].style.backgroundColor);
          const lumB = getLuminance(squares[row][j + 1].style.backgroundColor);
          if (lumA > lumB) {
            swapSquares(row, j, j + 1);
          }
          await new Promise((r) => setTimeout(r, 10));
        }
      }
    };

    const bubbleSortColumn = async (col) => {
      let len = squares.length;
      for (let i = 0; i < len; i++) {
        for (let j = 0; j < len - i - 1; j++) {
          const lumA = getLuminance(squares[j][col].style.backgroundColor);
          const lumB = getLuminance(squares[j + 1][col].style.backgroundColor);
          if (lumA > lumB) {
            swapSquaresCols(col, j, j + 1);
          }
          await new Promise((r) => setTimeout(r, 10));
        }
      }
    };

    setTimeout(() => {
      Promise.all(squares.map((_, row) => bubbleSortRow(row))).then(() => {
        Promise.all(squares[0].map((_, col) => bubbleSortColumn(col))).then(
          () => {
            const allSquares = [
              ...document.querySelectorAll(".overlay-square"),
            ];
            allSquares.sort((a, b) => {
              return (
                getLuminance(b.style.backgroundColor) -
                getLuminance(a.style.backgroundColor)
              );
            });
            let maxPatternDelay = 0;
            allSquares.forEach((square, index) => {
              const timer = index;
              maxPatternDelay += timer;
              setTimeout(() => {
                square.style.opacity = "0";
              }, timer);
            });

            const transitionDurationMs = 500;
            setTimeout(() => {
              shuffledSquares.forEach((square) => {
                square.remove();
              });
            }, maxPatternDelay + transitionDurationMs);
          }
        );
      });
    }, 1000);
  }
  dragHandler(elmnt) {
    let pos1 = 0,
      pos2 = 0,
      pos3 = 0,
      pos4 = 0;

    const dragMouseDown = (e) => {
      e = e || window.event;
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    };

    const elementDrag = (e) => {
      e = e || window.event;
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      elmnt.style.top = `${elmnt.offsetTop - pos2}px`;
      elmnt.style.left = `${elmnt.offsetLeft - pos1}px`;
    };

    const closeDragElement = () => {
      document.onmouseup = null;
      document.onmousemove = null;
    };

    elmnt.onmousedown = dragMouseDown;
  }
}
function fisherYatesShuffle(array) {
  let n = array.length;
  for (let i = n - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
if (typeof module !== "undefined") {
  module.exports = Agent;
}
