export class Pathfinder {
  constructor() {
    this.debugger = new Debugger();
  }
  findPath(borders, agentLocation, target) {
    const ctx = this.debugger.getContext();
    ctx && this.debugger.debugBorders(borders, ctx);

    let lastPoint = agentLocation;

    const numberOfPoints = 200;
    const pathPoints = [];

    function distanceToTarget(point) {
      return Math.sqrt((point.x - target.x) ** 2 + (point.y - target.y) ** 2);
    }

    function snapToNearestBorder(point, borders) {
      let nearestPoint = null;
      let minDistance = Infinity;

      borders.forEach((border) => {
        const pointsOnBorder = [
          { x: border.left, y: point.y },
          { x: border.right, y: point.y },
          { x: point.x, y: border.top },
          { x: point.x, y: border.bottom },
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
      const x = agentLocation.x + t * (target.x - agentLocation.x);

      const y = agentLocation.y + t * (target.y - agentLocation.y);

      const randomPoint = { x, y };
      const snappedPoint = snapToNearestBorder(randomPoint, borders);

      if (
        snappedPoint &&
        distanceToTarget(snappedPoint) < distanceToTarget(lastPoint)
      ) {
        pathPoints.push(snappedPoint);
        lastPoint = snappedPoint;
      }
    }

    ctx && this.debugger.debugPaths(agentLocation, pathPoints, ctx);
    return pathPoints;
  }
}
export class Debugger {
  constructor() {
    this.active = true;
  }
  getContext() {
    const canvas = document.getElementById("myCanvas");
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    return canvas.getContext("2d");
  }
  debugPaths(agentLocation, pathPoints, ctx) {
    if (!this.active) return;
    console.log("debugger pathPoints", pathPoints);

    ctx.beginPath();
    ctx.moveTo(agentLocation.x, agentLocation.y);
    pathPoints.forEach((point) => {
      ctx.lineTo(point.x, point.y);
      ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
    });
    ctx.strokeStyle = "blue";
    ctx.stroke();
  }
  debugBorders(borders, ctx) {
    if (!this.active) return;
    console.log("debugger borders", borders);
    borders.forEach((border) => {
      ctx.strokeStyle = "red";
      ctx.strokeRect(
        border.left,
        border.top,
        border.right - border.left,
        border.bottom - border.top
      );
    });
  }
}

if (typeof module !== "undefined") {
  module.exports = Debugger;
}

if (typeof module !== "undefined") {
  module.exports = Pathfinder;
}
