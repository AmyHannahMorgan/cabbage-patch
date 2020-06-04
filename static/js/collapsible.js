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

    collapse() {
        if(this.collapsed) {
            this.content.style.height = `${this.content.scrollHeight}px`;
            this.collapsed = false;
        }
        else {
            this.content.style.height = '';
            this.collapsed = true;
        }
    }
}

const COLLAPSER_ELEMENTS = document.querySelectorAll('[collapsible]');
const COLLAPSER_OBJECTS = [];

for(let i = 0; i < COLLAPSER_ELEMENTS.length; i++) {
    COLLAPSER_OBJECTS.push(new Collapser(COLLAPSER_ELEMENTS[i]));
}