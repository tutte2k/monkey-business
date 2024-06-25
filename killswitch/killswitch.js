export class KillSwitch {
  constructor() {
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

    const squares = this.createSquares(div, rows, cols, squareSize);
    this.animateSquares(squares, div);
  }

  createSquares(div, rows, cols, squareSize) {
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
    return squares;
  }

  getLuminance(rgb) {
    const [r, g, b] = rgb.match(/\d+/g).map(Number);
    return 0.299 * r + 0.587 * g + 0.114 * b;
  }

  swapSquares(row, index1, index2, squares, div) {
    const temp = squares[row][index1];
    squares[row][index1] = squares[row][index2];
    squares[row][index2] = temp;
    squares[row].forEach((square) => div.appendChild(square));
  }

  swapSquaresCols(col, row1, row2, squares, div) {
    const temp = squares[row1][col];
    squares[row1][col] = squares[row2][col];
    squares[row2][col] = temp;
    squares.forEach((rowSquares) =>
      rowSquares.forEach((square) => div.appendChild(square))
    );
  }

  async bubbleSortRow(row, squares, div) {
    let len = squares[row].length;
    const delay = 0;
    for (let i = 0; i < len; i++) {
      for (let j = 0; j < len - i - 1; j++) {
        const lumA = this.getLuminance(squares[row][j].style.backgroundColor);
        const lumB = this.getLuminance(
          squares[row][j + 1].style.backgroundColor
        );
        if (lumA > lumB) {
          this.swapSquares(row, j, j + 1, squares, div);
        }
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  async hybridSortColumn(col, squares, div) {
    let len = squares.length;
    let gap = len;
    const delay = 0;
    while (gap > 1) {
      gap = Math.floor(gap / 1.3);
      for (let i = 0; i + gap < len; i++) {
        const lumA = this.getLuminance(squares[i][col].style.backgroundColor);
        const lumB = this.getLuminance(
          squares[i + gap][col].style.backgroundColor
        );
        if (lumA > lumB) {
          this.swapSquaresCols(col, i, i + gap, squares, div);
          await new Promise((r) => setTimeout(r, delay));
        }
      }
    }

    for (let i = 0; i < len - 1; i++) {
      for (let j = 0; j < len - i - 1; j++) {
        const lumA = this.getLuminance(squares[j][col].style.backgroundColor);
        const lumB = this.getLuminance(
          squares[j + 1][col].style.backgroundColor
        );
        if (lumA > lumB) {
          this.swapSquaresCols(col, j, j + 1, squares, div);
          await new Promise((r) => setTimeout(r, delay));
        }
      }
    }
  }

  animateSquares(squares, div) {
    setTimeout(() => {
      Promise.all(
        squares.map((_, row) => this.bubbleSortRow(row, squares, div))
      ).then(() => {
        Promise.all(
          squares[0].map((_, col) => this.hybridSortColumn(col, squares, div))
        ).then(() => {
          const allSquares = [...document.querySelectorAll(".overlay-square")];
          allSquares.sort((a, b) => {
            return (
              this.getLuminance(b.style.backgroundColor) -
              this.getLuminance(a.style.backgroundColor)
            );
          });
          let maxPatternDelay = 0;

          allSquares.forEach((square, index) => {
            const timer = index * 10;
            maxPatternDelay = timer;
            setTimeout(() => {
              const angle = Math.random() * 2 * Math.PI;
              const distance = Math.random() * 200;
              const dx = Math.cos(angle) * distance;
              const dy = Math.sin(angle) * distance;
              square.style.transform = `translate(${dx}px, ${dy}px)`;
              square.style.animation = `1s infinite spin${Number(
                Math.random() > 0.5
              )}`;
              square.style.opacity = "0";
            }, timer);
          });

          const transitionDurationMs = 500;
          setTimeout(() => {
            allSquares.forEach((square) => {
              square.remove();
            });
          }, maxPatternDelay + transitionDurationMs);
        });
      });
    }, 1000);
  }
}
if (typeof module !== "undefined") {
  module.exports = KillSwitch;
}
