(function (shadowRoot) {
  class Calculator {
    constructor(prevOpEl, currOpEl) {
      this.prevOpEl = prevOpEl;
      this.currOpEl = currOpEl;
      this.clear();

      window.addEventListener("keyup", (e) => this.handleKeyUp(e));
    }
    handleKeyUp(e) {
      console.log(e.key);
      if (e.key === "Enter") {
        this.compute();
      } else if (this.isOperator(e.key)) {
        this.chooseOp(e.key);
      } else if (this.isInput(e.key)) {
        this.append(e.key);
      } else if (["Delete", "Backspace"].includes(e.key)) {
        this.delete();
      } else if (e.key === "Escape") {
        this.clear();
      }
      this.update();
    }
    isOperator(key) {
      return ["+", "-", "*", "÷"].includes(key);
    }
    isInput(key) {
      return (
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].includes(Number(key)) || key === "."
      );
    }
    clear() {
      this.currOp = "";
      this.prevOp = "";
      this.op = undefined;
    }
    delete() {
      this.currOp = this.currOp.toString().slice(0, -1);
    }
    append(num) {
      if (num === "." && this.currOp.includes(".")) return;
      this.currOp = this.currOp.toString() + num.toString();
    }
    chooseOp(op) {
      if (this.currOp === "") return;
      if (this.prevOp !== "") {
        this.compute();
      }
      this.op = op;
      this.prevOp = this.currOp;
      this.currOp = "";
    }

    compute() {
      let comp;
      const prev = parseFloat(this.prevOp);
      const curr = parseFloat(this.currOp);
      if (isNaN(prev) || isNaN(curr)) return;
      switch (this.op) {
        case "+":
          comp = prev + curr;
          break;
        case "-":
          comp = prev - curr;
          break;
        case "*":
          comp = prev * curr;
          break;
        case "÷":
          comp = prev / curr;
          break;
        default:
          return;
      }
      this.currOp = comp;
      this.op = undefined;
      this.prevOp = "";
    }
    getDisplayString(number) {
      const stringNumber = number.toString();
      const intNumbers = parseFloat(stringNumber.split(".")[0]);
      const decimalNumbers = stringNumber.split(".")[1];
      let intDisplay;
      if (isNaN(intNumbers)) {
        intDisplay = "";
      } else {
        intDisplay = intNumbers.toLocaleString("sv", {
          maximumFractionDigits: 0,
        });
      }
      if (decimalNumbers != null) {
        return `${intDisplay}.${decimalNumbers}`;
      } else {
        return intDisplay;
      }
    }
    update() {
      this.currOpEl.innerText = this.getDisplayString(this.currOp);
      if (this.op != null) {
        this.prevOpEl.innerText = `${this.getDisplayString(this.prevOp)} ${
          this.op
        }`;
      } else {
        this.prevOpEl.innerText = "";
      }
    }
  }

  import("./common/explosivebutton.js").then((module) => {
    const ExplosiveButton = module.ExplosiveButton;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "./common/explosivebutton.css";
    shadowRoot.appendChild(link);
    const numBtns = shadowRoot.querySelectorAll("[data-number]");
    const opBtns = shadowRoot.querySelectorAll("[data-operation]");

    const eqBtn = shadowRoot.querySelector("[data-equals]");

    const delBtn = shadowRoot.querySelector("[data-delete]");

    const acBtn = shadowRoot.querySelector("[data-all-clear]");

    const prevOpEl = shadowRoot.querySelector("[data-previous-operand]");
    const currOpEl = shadowRoot.querySelector("[data-current-operand]");

    const calculator = new Calculator(prevOpEl, currOpEl);

    numBtns.forEach((button) => {
      new ExplosiveButton(button);
      button.addEventListener("click", () => {
        calculator.append(button.innerText);
        calculator.update();
      });
    });

    opBtns.forEach((button) => {
      new ExplosiveButton(button);
      button.addEventListener("click", () => {
        calculator.chooseOp(button.innerText);
        calculator.update();
      });
    });

    new ExplosiveButton(eqBtn);

    eqBtn.addEventListener("click", (button) => {
      calculator.compute();
      calculator.update();
    });

    new ExplosiveButton(acBtn);
    acBtn.addEventListener("click", (button) => {
      calculator.clear();
      calculator.update();
    });

    new ExplosiveButton(delBtn);
    delBtn.addEventListener("click", (button) => {
      calculator.delete();
      calculator.update();
    });
  });
})(shadowRoot);
