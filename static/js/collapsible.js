class Collapser {
    constructor(element) {
        this.container = element;
        this.activator = this.container.querySelector('[collapsible-activator]');
        this.content = this.container.querySelector('[collapsible-content]');
        this.content.style.display = 'none';
        
        this.collapsed = true;

        this.activator.addEventListener('click', () => {
            this.collapse();
        });
    }

    collapse() {
        if(this.collapsed) {
            this.activator.querySelector('.collapsedIndicator').innerText = '-'
            this.content.style.display = '';
            this.collapsed = false;
        }
        else {
            this.activator.querySelector('.collapsedIndicator').innerText = '+';
            this.content.style.display = 'none';
            this.collapsed = true;
        }
    }
}

const COLLAPSER_ELEMENTS = document.querySelectorAll('[collapsible]');
const COLLAPSER_OBJECTS = [];

for(let i = 0; i < COLLAPSER_ELEMENTS.length; i++) {
    COLLAPSER_OBJECTS.push(new Collapser(COLLAPSER_ELEMENTS[i]));
}