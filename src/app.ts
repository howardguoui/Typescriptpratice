function autobind(_: any, _2 : string, descriptor: PropertyDescriptor) {
    const originMethod = descriptor.value;
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        get() {
            const boundFn = originMethod.bind(this);
            return boundFn
        }
    }
    return adjDescriptor;
}

class ProjectInput {
    templateElem : HTMLTemplateElement;
    hostElem : HTMLDivElement;
    element : HTMLFormElement;
    titleElem : HTMLInputElement;
    descriptionElem : HTMLInputElement;
    peopleElem : HTMLInputElement;

    constructor() {
        // const templateEl = document.getElementById('project-inpiut');
        // if(templateEl) {
        //     this.templateElem = this.templateEl;
        // }
        this.templateElem = document.getElementById('project-input')! as HTMLTemplateElement;
        this.hostElem = document.getElementById('app')! as HTMLDivElement;

        const importedNode = document.importNode(this.templateElem.content, true);
        this.element = importedNode.firstElementChild as HTMLFormElement;
        this.element.id = 'user-input';
        this.titleElem = this.element.querySelector('#title') as HTMLInputElement
        this.descriptionElem = this.element.querySelector('#description') as HTMLInputElement
        this.peopleElem = this.element.querySelector('#people') as HTMLInputElement

        this.configure();
        this.attach();
    }
    private attach() {
        this.hostElem.insertAdjacentElement('afterbegin', this.element);
    }
    private clear() {
        this.titleElem.value = '',
        this.descriptionElem.value = '',
        this.peopleElem.value = ''

    }
    private gatherUserInput(): [string,string, number] | void{
        const enterTitle = this.titleElem.value;
        const enterDescriptionElem = this.descriptionElem.value;
        const enterPeopleElem = this.peopleElem.value;
        if(enterTitle.trim().length === 0 || enterDescriptionElem.trim().length === 0|| enterPeopleElem.trim().length === 0) {
            alert('wrong')
            return;
        } else {
            return [enterTitle, enterDescriptionElem, +enterPeopleElem];
        }
    }

    @autobind
    private submitHandler(event: Event) {
        event.preventDefault();
        console.log("test -->",this.titleElem.value);
        const userInput = this.gatherUserInput();
        if (Array.isArray(userInput)) {
            const [title, desc, people] = userInput
            console.log("title - desc - people", title, desc, people)
            this.clear();
        }
    }
    // private configure() {
    //     this.element.addEventListener('submit', this.submitHandler.bind(this))
    // }
        private configure() {
        this.element.addEventListener('submit', this.submitHandler)
    }
}

const newInput = new ProjectInput();