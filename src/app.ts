//validation
interface Validation {
    value: string | number;
    required?: boolean;// boolean or undefined
    minlength?: number;
    maxlength?: number;
    min?: number;
    max?: number;
}
function validate(ValidatableInput: Validation) {
    let isValid = true;
    if(ValidatableInput.required) {
        isValid = isValid && ValidatableInput.value.toString().trim().length !==0
    }
    if(ValidatableInput.minlength !=null && typeof ValidatableInput.value ==='string') {
        isValid = isValid && ValidatableInput.value.length > ValidatableInput.minlength
    }
    if(ValidatableInput.maxlength !=null && typeof ValidatableInput.value ==='string') {
        isValid = isValid && ValidatableInput.value.length < ValidatableInput.maxlength
    }
    if(ValidatableInput.min !=null && typeof ValidatableInput.value ==='number') {
        isValid = isValid && ValidatableInput.value > ValidatableInput.min
    }
    if(ValidatableInput.max !=null && typeof ValidatableInput.value ==='number') {
        isValid = isValid && ValidatableInput.value < ValidatableInput.max
    }
    return isValid
}
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
// Project list
class ProjectList {
    templateElem : HTMLTemplateElement;
    hostElem : HTMLDivElement;
    element : HTMLElement;
    constructor(private type: 'active' | 'finished') {
        //point to project list
        this.templateElem = document.getElementById('project-list')! as HTMLTemplateElement;
        this.hostElem = document.getElementById('app')! as HTMLDivElement;

        const importedNode = document.importNode(this.templateElem.content, true);
        this.element = importedNode.firstElementChild as HTMLElement;
        this.element.id = `${this.type}-projects`;
        this.attach();
        this.renderContent();
    }
    private renderContent() {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';
    }
    private attach() {
        this.hostElem.insertAdjacentElement('beforeend', this.element);

    }
}

  
//Input
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
        // if(enterTitle.trim().length === 0 || enterDescriptionElem.trim().length === 0|| enterPeopleElem.trim().length === 0) {
        const titleValidatable: Validation = {
            value:enterTitle,
            required: true
        };
        const descritionValidatable: Validation = {
            value:enterDescriptionElem,
            required: true,
            minlength: 5,
        };
        const peopleValidatable: Validation = {
            value: +enterPeopleElem,
            required: true,
            min: 3,
        };
        if(!validate(titleValidatable) || !validate(descritionValidatable)|| !validate(peopleValidatable)) {
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
const activeProjectList = new ProjectList('active');
const finishedProjectList = new ProjectList('finished');