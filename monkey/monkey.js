import { ExplosiveButton } from "../common/explosivebutton.js";
import { DragHandler } from "./draghandler.js";
import { Pathfinder } from "./pathfinder.js";
import { Sprite } from "./sprite.js";
import { DIRECTION, STATES } from "./utils.js";

export class Monkey {
  constructor(el, targets, onDone) {
    this.el = el;
    this.targets = targets;
    this.onDone = onDone;

    this.sprite = new Sprite(el, STATES.HANGING_IDLE);

    new DragHandler(el, this);

    this.pathFinder = new Pathfinder();

    this.throwSpeed = 1500;
    this.moveSpeed = 1;

    this.currentIndex = 0;

    this.#moveAlongBorders();

    const clickListener = () => {
      this.#smash();
      window.removeEventListener("click", clickListener);
    };
    this.el.addEventListener("click", (e) => {
      this.clicked = !this.clicked;
      if (!this.clicked) {
        this.#smash();
        this.dragged = false;
        this.#moveAlongBorders();
      }
    });
  }

  #smash() {
    this.#displayMessage({});
    setTimeout(() => {
      this.#shootBullet();
    }, 2000);
  }
  #querySelectorAllShadows(selector, el = document.body) {
    const childShadows = Array.from(el.querySelectorAll("*"))
      .map((el) => el.shadowRoot)
      .filter(Boolean);

    const childResults = childShadows.map((child) =>
      this.#querySelectorAllShadows(selector, child)
    );

    const result = Array.from(el.querySelectorAll(selector));
    return result.concat(childResults).flat();
  }

  #moveAlongBorders() {
    const targets = this.targets.concat(
      this.#querySelectorAllShadows(".content *")
    );

    const filteredElements = targets.filter((element) => {
      const excludedIds = ["page-content", "content-invaders"];
      const excludedClassNames = ["component-container"];
      const hasExcludedId = excludedIds.includes(element.id);
      const hasExcludedClass = excludedClassNames.some((className) =>
        element.classList.contains(className)
      );
      return !hasExcludedId && !hasExcludedClass;
    });

    const elements = filteredElements;

    const targetElement = elements[Math.floor(Math.random() * elements.length)];
    if (!targetElement) {
      return;
    }
    this.#moveTowardsTarget(targetElement, elements);
  }
  #moveTowardsTarget(targetElement, elements) {
    let targetLoc, agentLoc, borders, pathPoints;
    let lastElementPositions = new Map();

    const haveElementsMoved = () => {
      for (const element of elements) {
        const currentLoc = this.#getCoords(element);
        const lastLoc = lastElementPositions.get(element);
        if (
          !lastLoc ||
          currentLoc.x !== lastLoc.x ||
          currentLoc.y !== lastLoc.y
        ) {
          lastElementPositions.set(element, currentLoc);
          return true;
        }
      }
      return false;
    };

    const updatePathAndBorders = () => {
      targetLoc = this.#getCoords(targetElement);
      agentLoc = this.#getCoords(this.el);
      borders = this.#getElementBorders(elements);
      if (haveElementsMoved()) {
        pathPoints = this.pathFinder.findPath(borders, agentLoc, targetLoc);
      }
    };

    updatePathAndBorders();

    let posX = agentLoc.x;
    let posY = agentLoc.y;
    let currentIndex = 0;

    const moveDiv = () => {
      if (this.dragged) {
        return;
      }

      updatePathAndBorders();

      const isFinished = currentIndex >= pathPoints.length;
      if (isFinished) {
        this.sprite.updateState(STATES.HANGING_IDLE);
        setTimeout(() => {
          this.#moveAlongBorders();
        }, 1000);
        return;
      }

      const target = pathPoints[currentIndex];

      const dx = target.x - posX;
      const dy = target.y - posY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const isGoingRight = dx > 0;
      this.sprite.direction = isGoingRight ? DIRECTION.RIGHT : DIRECTION.LEFT;

      const fallDistance = 100;
      const shouldFall = distance > fallDistance;
      const shouldHang = distance < fallDistance;

      if (shouldFall && this.sprite.state !== STATES.FALL) {
        this.sprite.updateState(STATES.FALL);
      } else if (shouldHang && this.sprite.state !== STATES.HANGING_MOVING) {
        this.sprite.updateState(STATES.HANGING_MOVING);
      }

      if (distance < this.moveSpeed) {
        posX = target.x;
        posY = target.y;
        currentIndex++;
      } else {
        const directionX = dx / distance;
        const directionY = dy / distance;

        posX += directionX * this.moveSpeed;
        posY += directionY * this.moveSpeed;

        const newDistance = Math.sqrt(
          Math.pow(target.x - posX, 2) + Math.pow(target.y - posY, 2)
        );
        if (newDistance > distance) {
          posX = target.x;
          posY = target.y;
          currentIndex++;
        }
      }

      this.el.style.left = `${posX}px`;
      this.el.style.top = `${posY}px`;

      requestAnimationFrame(moveDiv);
    };
    moveDiv();
  }

  #getCoords(el) {
    const elRect = el.getBoundingClientRect();
    const coords = {
      x: elRect.left + window.scrollX,
      y: elRect.top + window.scrollY,
    };
    return coords;
  }

  #getElementBorders(elements) {
    return Array.from(elements).map((el) => {
      const rect = el.getBoundingClientRect();
      return {
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY,
        right: rect.right + window.scrollX,
        bottom: rect.bottom + window.scrollY,
        element: el,
      };
    });
  }

  #shootBullet() {
    if (this.clicked) throw new Error("monkey sad");
    if (this.currentIndex < this.targets.length) {
      this.sprite.updateStateTemporarily(STATES.HANGING_THROW);

      setTimeout(() => {
        const target = this.targets[this.currentIndex];
        this.#displayMessage(target);
        target.style.borderWidth = "2px";
        const agentRect = this.el.getBoundingClientRect();
        const banana = this.#createBullet(agentRect);
        const targetRect = target.getBoundingClientRect();

        this.#animateBullet(targetRect, agentRect, banana, () =>
          this.#onBulletHitTarget(banana, target)
        );
      }, 300);
    } else {
      // console.log("All elements are now visible.");
    }
  }
  #onBulletHitTarget(banana, target) {
    new ExplosiveButton(banana, true, () => banana.remove());
    banana.style.backgroundImage = "unset";
    target.remove();
    this.currentIndex++;
    if (this.currentIndex < this.targets.length) {
      setTimeout(() => this.#shootBullet(), 20);
    } else {
      setTimeout(() => this.#startFinalAttack(), 20);
    }
  }

  #displayMessage(target) {
    const agentRect = this.el.getBoundingClientRect();

    const emojis = ["🐵", "🙊", "🙉", "🙈"];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

    const message = document.createElement("p");
    message.innerHTML = `smash ${target.nodeName ?? ""} ${
      target.id ?? ""
    } ${randomEmoji}`;

    message.className = "message";
    message.style.fontFamily = "comic sans MS";

    const cloud = document.createElement("div");
    cloud.style.left = `${agentRect.left + agentRect.width / 2}px`;
    cloud.style.top = `${agentRect.top}px`;
    cloud.classList.add("cloud");
    cloud.appendChild(message);

    document.body.appendChild(cloud);
    setTimeout(() => cloud.remove(), 500);
  }

  #startFinalAttack() {
    this.#displayMessage({});
    this.sprite.updateStateTemporarily(STATES.HANGING_THROW);
    const agentRect = this.el.getBoundingClientRect();
    const banana = this.#createBullet(agentRect);

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const targetRect = {
      left: centerX - 1,
      top: centerY - 1,
      width: 2,
      height: 2,
    };

    this.#animateBullet(
      targetRect,
      agentRect,
      banana,
      () => {
        this.onDone();
      },
      true
    );
  }

  #animateBullet(targetRect, agentRect, banana, callback, scaleUp = false) {
    const deltaX =
      targetRect.left +
      targetRect.width / 2 -
      agentRect.left -
      agentRect.width / 2;
    const deltaY = targetRect.top - agentRect.top;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const duration = this.throwSpeed;

    const steps = duration / 16;
    const stepX = deltaX / steps;
    const stepY = deltaY / steps;

    let currentStep = 0;
    const alt = Math.random() - 0.5;
    const moveBullet = () => {
      if (currentStep < steps) {
        const translateX = stepX * currentStep;
        const translateY = stepY * currentStep;
        const rotate = (360 / steps) * (currentStep * 2);
        const scale = scaleUp ? 1 + (currentStep / steps) * 70 : 1;

        banana.style.transform = `translate(${translateX}px, ${translateY}px) rotate(${
          alt ? "-" : ""
        }${rotate}deg) scale(${scale})`;
        currentStep++;
        requestAnimationFrame(moveBullet);
      } else {
        callback();
      }
    };
    requestAnimationFrame(moveBullet);
  }

  #createBullet(agentRect) {
    const banana = document.createElement("div");
    banana.className = "banana";
    banana.style.left = `${agentRect.left + agentRect.width / 2}px`;
    banana.style.top = `${agentRect.top}px`;
    document.body.appendChild(banana);
    return banana;
  }
}

if (typeof module !== "undefined") {
  module.exports = Monkey;
}
