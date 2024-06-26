class ComponentLoader {
  constructor() {
    if (!customElements.get("my-component")) {
      customElements.define(
        "my-component",
        class extends HTMLElement {
          constructor() {
            super();
            this.attachShadow({ mode: "open" });
          }

          connectedCallback() {
            const section = this.getAttribute("section");
            console.log(section);
            this.loadComponent(section);
          }

          async loadComponent(section) {
            const [s, t, c] = await Promise.all(
              [".css", ".html", ".js"].map((fileExt) =>
                fetch(`./xpontents/${section}/${section}${fileExt}`)
              )
            );

            const [style, template, script] = await Promise.all([
              s.text(),
              t.text(),
              c.text(),
            ]);

            const sharedStyles = await (
              await fetch("./xpontents/shared.css")
            ).text();

            this.renderComponent(style.concat(sharedStyles), template, script);
          }

          renderComponent(styles, content, script) {
            this.shadowRoot.innerHTML = "";

            const styleElement = document.createElement("style");
            styleElement.textContent = styles;
            this.shadowRoot.appendChild(styleElement);

            const contentElement = document.createElement("div");
            contentElement.classList.add("content");
            // contentElement.style.width = "100vw";
            // contentElement.style.height = "100vh";
            contentElement.innerHTML = content;
            this.shadowRoot.appendChild(contentElement);
            try {
              const modulescript = new Function(
                "shadowRoot",
                `import('/common/explosivebutton.js').then(module => {
                const ExplosiveButton = module.ExplosiveButton; 
                (function (shadowRoot) {${script}})(shadowRoot);
                });`
              );
              modulescript(this.shadowRoot);
            } catch (error) {
              console.error("Error executing script:", error);
            }
          }
        }
      );
    }
  }
  async setActive(section) {
    document
      .querySelectorAll(".navbar a")
      .forEach((a) => a.classList.remove("active"));
    document.getElementById(section).classList.add("active");

    const component = document.createElement("my-component");
    component.setAttribute("section", section);
    const container = document.querySelector(".component-container");
    container.innerHTML = "";
    container.appendChild(component);
  }
}
