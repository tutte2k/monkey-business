export class Debugger {
  constructor() {
    this.active = false;
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
    console.log("debugPaths");

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
    console.log("debugBorders");
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
