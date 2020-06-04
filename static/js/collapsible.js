class Collapser {
    constructor(element) {
        this.container = element;
        this.activator = this.container.querySelector('[collapsible-activator]');
        this.content = this.container.querySelector('[collapsible-content]');
        
        this.collapsed = true;

        this.activator.addEventListener('click', () => {
            this.collapse();
        });
    }
}