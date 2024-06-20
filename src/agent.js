import { STATE } from "./common/utils.js";
import { DragHandler } from "./draghandler.js";
import { KillSwitch } from "./killswitch.js";
import { Sprite } from "./sprite.js";

export class Agent {
  constructor(elementRef, targets) {
    this.elementRef = elementRef;
    this.targets = targets;
    this.state = STATE.HANGING_IDLE;
    this.frameIndex = 0;
    this.intervalId = null;
    this.dragged = false;

    // this.pathfinder = new Pathfinder();
    new DragHandler(elementRef, this);
    this.sprite = new Sprite(elementRef, STATE.HANGING_IDLE);

    this.throwSpeed = 2000;

    this.currentIndex = 0;

    this.#moveAlongBorders();
    setTimeout(() => this.#shootBullet(), 2000);
  }

  #moveAlongBorders() {
    const canvas = document.getElementById("myCanvas");
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");

    const squares = document.querySelectorAll(".element");
    const monkeyTargets = document.querySelectorAll(".monkey-target");

    const elements = [
      ...squares,
      ...monkeyTargets,
      document.getElementById("nav"),
    ];
    const speed = 1;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const borders = Array.from(elements).map((el) => {
      const rect = el.getBoundingClientRect();
      return {
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY,
        right: rect.right + window.scrollX,
        bottom: rect.bottom + window.scrollY,
        element: el,
      };
    });

    console.log("Selecting a random target element");
    const targetElement = elements[Math.floor(Math.random() * elements.length)];
    const targetRect = targetElement.getBoundingClientRect();
    const target = {
      x: targetRect.left + window.scrollX,
      y: targetRect.top + window.scrollY,
    };

    const agentRect = this.elementRef.getBoundingClientRect();
    const agentLocation = {
      x: agentRect.left + window.scrollX,
      y: agentRect.top + window.scrollY,
    };

    console.log("Agent Location:", agentLocation);
    console.log("Target Location:", target);

    const numberOfPoints = 10;
    let lastPoint = agentLocation;
    const pathPoints = [];

    function distanceToTarget(point) {
      return Math.sqrt((point.x - target.x) ** 2 + (point.y - target.y) ** 2);
    }

    function snapToNearestBorder(point, borders) {
      let nearestPoint = point;
      let minDistance = Infinity;

      borders.forEach((border) => {
        const pointsOnBorder = [
          { x: border.left, y: point.y }, // left border
          { x: border.right, y: point.y }, // right border
          { x: point.x, y: border.top }, // top border
          { x: point.x, y: border.bottom }, // bottom border
        ];

        pointsOnBorder.forEach((borderPoint) => {
          if (
            borderPoint.x >= border.left &&
            borderPoint.x <= border.right &&
            borderPoint.y >= border.top &&
            borderPoint.y <= border.bottom
          ) {
            const distance = Math.sqrt(
              (borderPoint.x - point.x) ** 2 + (borderPoint.y - point.y) ** 2
            );
            if (distance < minDistance) {
              minDistance = distance;
              nearestPoint = borderPoint;
            }
          }
        });
      });

      return nearestPoint;
    }

    for (let i = 0; i < numberOfPoints; i++) {
      const t = i / (numberOfPoints - 1);
      const x =
        agentLocation.x +
        t * (target.x - agentLocation.x) +
        Math.random() * 100 -
        50;
      const y =
        agentLocation.y +
        t * (target.y - agentLocation.y) +
        Math.random() * 100 -
        50;
      const randomPoint = { x, y };
      const snappedPoint = snapToNearestBorder(randomPoint, borders);

      if (distanceToTarget(snappedPoint) < distanceToTarget(lastPoint)) {
        pathPoints.push(snappedPoint);
        lastPoint = snappedPoint;
      }
    }
    console.log("Path Points on Borders:", pathPoints);

    ctx.beginPath();
    ctx.moveTo(agentLocation.x, agentLocation.y);
    pathPoints.forEach((point) => {
      ctx.lineTo(point.x, point.y);
      ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
    });
    ctx.strokeStyle = "blue";
    ctx.stroke();

    console.log("Starting movement along the path");
    let currentIndex = 0;
    let posX = agentLocation.x;
    let posY = agentLocation.y;

    const moveDiv = () => {
      if (this.dragged) {
        return;
      }
      if (currentIndex >= pathPoints.length) {
        this.#moveAlongBorders();
        return;
      }

      const target = pathPoints[currentIndex];
      const dx = target.x - posX;
      const dy = target.y - posY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < speed) {
        posX = target.x;
        posY = target.y;
        currentIndex++;
      } else {
        posX += (dx / distance) * speed;
        posY += (dy / distance) * speed;
      }

      this.elementRef.style.left = `${posX}px`;
      this.elementRef.style.top = `${posY}px`;

      requestAnimationFrame(moveDiv);
    };
    moveDiv();
  }

  #shootBullet() {
    if (this.currentIndex < this.targets.length) {
      this.sprite.updateStateTemporarily(STATE.HANGING_THROW);
      setTimeout(() => {
        const target = this.targets[this.currentIndex];
        target.style.borderWidth = "2px";
        const agentRect = this.elementRef.getBoundingClientRect();
        const bullet = this.#createBullet(agentRect);
        const targetRect = target.getBoundingClientRect();

        this.#animateBullet(targetRect, agentRect, bullet, () =>
          this.#onBulletHitTarget(bullet, target)
        );
      }, 300);
    } else {
      console.log("All elements are now visible.");
    }
  }
  #onBulletHitTarget(bullet, target) {
    bullet.remove();
    target.remove();
    this.currentIndex++;
    if (this.currentIndex < this.targets.length) {
      setTimeout(() => this.#shootBullet(), 20);
    } else {
      setTimeout(() => this.#startFinalAttack(), 20);
    }
  }

  #startFinalAttack() {
    const agentRect = this.elementRef.getBoundingClientRect();
    const bullet = this.#createBullet(agentRect);

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
      bullet,
      () => new KillSwitch(),
      true
    );
  }

  #animateBullet(targetRect, agentRect, bullet, callback, scaleUp = false) {
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

  #createBullet(agentRect) {
    const bullet = document.createElement("div");
    bullet.className = "bullet";
    bullet.style.left = `${agentRect.left + agentRect.width / 2}px`;
    bullet.style.top = `${agentRect.top}px`;
    document.body.appendChild(bullet);
    return bullet;
  }
}

if (typeof module !== "undefined") {
  module.exports = Agent;
}
