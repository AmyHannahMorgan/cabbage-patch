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
            if(this.container.hasAttribute('collapsible-transition')) {
                this.content.style.display = '';
            }
            this.content.style.height = `${this.content.scrollHeight}px`;
            this.activator.querySelector('.collapsedIndicator').innerText = '-'
            this.collapsed = false;
        }
        else {
            this.content.style.height = '';
            this.activator.querySelector('.collapsedIndicator').innerText = '+';
            if(this.container.hasAttribute('collapsible-transition')) {
                this.content.addEventListener('transitionend', e => {
                    this.content.style.display = 'none';
                }, { once: true })
            }
            this.collapsed = true;
        }
    }
}

const COLLAPSER_ELEMENTS = document.querySelectorAll('[collapsible]');
const COLLAPSER_OBJECTS = [];

for(let i = 0; i < COLLAPSER_ELEMENTS.length; i++) {
    COLLAPSER_OBJECTS.push(new Collapser(COLLAPSER_ELEMENTS[i]));
}