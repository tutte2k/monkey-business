export class DragHandler {
  constructor(element, monkey) {
    this.element = element;
    this.monkey = monkey;
    this.pos1 = 0;
    this.pos2 = 0;
    this.pos3 = 0;
    this.pos4 = 0;
    this.element.onmousedown = this.dragMouseDown.bind(this);
  }

  dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    this.pos3 = e.clientX;
    this.pos4 = e.clientY;
    document.onmouseup = this.closeDragElement.bind(this);
    document.onmousemove = this.elementDrag.bind(this);
  }

  elementDrag(e) {
    e = e || window.event;
    this.monkey.dragged = true;
    e.preventDefault();
    this.pos1 = this.pos3 - e.clientX;
    this.pos2 = this.pos4 - e.clientY;
    this.pos3 = e.clientX;
    this.pos4 = e.clientY;
    this.element.style.top = `${this.element.offsetTop - this.pos2}px`;
    this.element.style.left = `${this.element.offsetLeft - this.pos1}px`;
  }

  closeDragElement() {
    this.monkey.dragged = false;
    document.onmouseup = null;
    document.onmousemove = null;
  }
}
if (typeof module !== "undefined") {
  module.exports = DragHandler;
}
