(function (shadowRoot) {
  const grid = shadowRoot.querySelector(".grid");
  const resultsDisplay = shadowRoot.querySelector(".results");
  let currentPlayerIndex = 202;
  let width = 15;
  let direction = 1;
  let gameId;
  let goingRight = true;
  let kills = [];
  let score = 0;
  let alive = true;

  for (let i = 0; i < 225; i++) {
    const square = document.createElement("div");
    grid.appendChild(square);
  }

  const squares = Array.from(shadowRoot.querySelectorAll(".grid div"));

  const aliens = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 30,
    31, 32, 33, 34, 35, 36, 37, 38, 39,
  ];

  function draw() {
    for (let i = 0; i < aliens.length; i++) {
      if (!kills.includes(i)) {
        squares[aliens[i]]?.classList.add("alien");
      }
    }
  }

  draw();

  function remove() {
    for (let i = 0; i < aliens.length; i++) {
      squares[aliens[i]]?.classList.remove("alien");
    }
  }

  squares[currentPlayerIndex].classList.add("player");

  function movePlayer(e) {
    if (alive) {
      squares[currentPlayerIndex].classList.remove("player");
      switch (e.key) {
        case "ArrowLeft":
          if (currentPlayerIndex % width !== 0) currentPlayerIndex -= 1;
          break;
        case "ArrowRight":
          if (currentPlayerIndex % width < width - 1) currentPlayerIndex += 1;
          break;
      }
      squares[currentPlayerIndex].classList.add("player");
    }
  }

  document.addEventListener("keydown", movePlayer);

  function moveAliens() {
    const leftEdge = aliens[0] % width === 0;
    const rightEdge = aliens[aliens.length - 1] % width === width - 1;
    remove();
    if (rightEdge && goingRight) {
      for (let i = 0; i < aliens.length; i++) {
        aliens[i] += width + 1;
        direction = -1;
        goingRight = false;
      }
    }
    if (leftEdge && !goingRight) {
      for (let i = 0; i < aliens.length; i++) {
        aliens[i] += width - 1;
        direction = 1;
        goingRight = true;
      }
    }
    for (let i = 0; i < aliens.length; i++) {
      aliens[i] += direction;
    }

    draw();

    if (squares[currentPlayerIndex].classList.contains("alien", "shooter")) {
      resultsDisplay.innerHTML = "GAME OVER";
      squares[currentPlayerIndex].classList.remove("player");
      squares[currentPlayerIndex].classList.add("dead");
      alive = false;
      grid.classList.add("deadtext");
      for (let i = 0; i < aliens.length; i++) {
        squares[aliens[i]]?.classList.remove("alien");
      }
      clearInterval(gameId);
      restart();
      //Dead
    }

    for (let i = 0; i < aliens.length; i++) {
      if (aliens[i] > squares.length) {
        resultsDisplay.innerHTML = "GAME OVER";
        clearInterval(gameId);
        restart();
        //Lose
      }
    }

    if (kills.length === aliens.length) {
      resultsDisplay.innerHTML = "YOU WIN";
      clearInterval(gameId);
      restart();
      //Win
    }
  }

  gameId = setInterval(moveAliens, 200);

  function fire(e) {
    if (alive) {
      let bulletId;
      let currentBulletIndex = currentPlayerIndex;
      function moveBullet() {
        squares[currentBulletIndex]?.classList.remove("bullet");
        currentBulletIndex -= width;
        squares[currentBulletIndex]?.classList.add("bullet");

        if (squares[currentBulletIndex]?.classList.contains("alien")) {
          squares[currentBulletIndex].classList.remove("bullet");
          squares[currentBulletIndex].classList.remove("alien");
          squares[currentBulletIndex].classList.add("boom");

          setTimeout(
            () => squares[currentBulletIndex].classList.remove("boom"),
            300
          );
          clearInterval(bulletId);

          const kill = aliens.indexOf(currentBulletIndex);
          kills.push(kill);
          score++;
          resultsDisplay.innerHTML = score;
        }
      }
      switch (e.key) {
        case "ArrowUp":
          bulletId = setInterval(moveBullet, 100);
      }
    }
  }

  document.addEventListener("keydown", fire);

  function restart() {
    document.removeEventListener("keydown", fire);
    document.removeEventListener("keydown", movePlayer);
  }
})(shadowRoot);
