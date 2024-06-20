import { STATE } from "./common/utils.js";
import { DragHandler } from "./draghandler.js";
import { KillSwitch } from "./killswitch.js";
import { Pathfinder } from "./pathfinder.js";
import { Sprite } from "./sprite.js";

export class Agent {
  constructor(el, targets) {
    this.el = el;
    this.targets = targets;
    this.state = STATE.HANGING_IDLE;
    this.frameIndex = 0;
    this.intervalId = null;

    this.sprite = new Sprite(el, STATE.HANGING_IDLE);

    this.dragged = false;
    new DragHandler(el, this);

    this.pathFinder = new Pathfinder();

    this.throwSpeed = 2000;
    this.moveSpeed = 3;

    this.currentIndex = 0;

    this.#moveAlongBorders();
    setTimeout(() => this.#shootBullet(), 2000);
  }

  #moveAlongBorders() {
    const boundaries = [...document.querySelectorAll("body *")];
    [1, 2, 3, 4, 5, 6].forEach((removeScriptTags) => boundaries.pop());
    console.log("Boundaries:", boundaries);

    const elements = boundaries;
    const targetElement = elements[Math.floor(Math.random() * elements.length)];
    if (!targetElement) {
      return;
    }
    const targetLoc = this.#getCoords(targetElement);
    console.log("Target Location:", targetLoc);

    const agentLoc = this.#getCoords(this.el);
    console.log("Agent Location:", agentLoc);

    const borders = this.#getElementBorders(elements);
    console.log("Borders:", borders);

    const pathPoints = this.pathFinder.findPath(borders, agentLoc, targetLoc);
    console.log("Path Points on Borders:", pathPoints);

    console.log("Starting movement along the path");
    let posX = agentLoc.x;
    let posY = agentLoc.y;
    let currentIndex = 0;
    const moveDiv = () => {
      if (this.dragged) {
        return;
      }
      const isFinished = currentIndex >= pathPoints.length;
      if (isFinished) {
        this.#moveAlongBorders();
        return;
      }

      const target = pathPoints[currentIndex];
      const dx = target.x - posX;
      const dy = target.y - posY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.moveSpeed) {
        posX = target.x;
        posY = target.y;
        currentIndex++;
      } else {
        posX += (dx / distance) * this.moveSpeed;
        posY += (dy / distance) * this.moveSpeed;
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
    if (this.currentIndex < this.targets.length) {
      this.sprite.updateStateTemporarily(STATE.HANGING_THROW);
      setTimeout(() => {
        const target = this.targets[this.currentIndex];
        target.style.borderWidth = "2px";
        const agentRect = this.el.getBoundingClientRect();
        const banana = this.#createBullet(agentRect);
        const targetRect = target.getBoundingClientRect();

        this.#animateBullet(targetRect, agentRect, banana, () =>
          this.#onBulletHitTarget(banana, target)
        );
      }, 300);
    } else {
      console.log("All elements are now visible.");
    }
  }
  #onBulletHitTarget(banana, target) {
    banana.remove();
    target.remove();
    this.currentIndex++;
    if (this.currentIndex < this.targets.length) {
      setTimeout(() => this.#shootBullet(), 20);
    } else {
      setTimeout(() => this.#startFinalAttack(), 20);
    }
  }

  #startFinalAttack() {
    this.sprite.updateStateTemporarily(STATE.HANGING_THROW);
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
      () => new KillSwitch(),
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
  module.exports = Agent;
}
