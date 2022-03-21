// Drag & Drop Interfaces
interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
}
// Project Type
enum ProjectStatus {
  Active,
  Finished,
}

class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

// Project State Management
type Listener<T> = (items: T[]) => void;
// Project State Management
class State<T> {
  protected listeners: Listener<T>[] = [];

  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}
class ProjectState extends State<Project> {
  private projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  addProject(title: string, description: string, numOfPeople: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      numOfPeople,
      ProjectStatus.Active
    );
    this.projects.push(newProject);
    // for (const listenerFn of this.listeners) {
    //   listenerFn(this.projects.slice());
    // }
    this.updateListeners();

  }
  moveProject(projectId: string, newStatus: ProjectStatus) {
    const project = this.projects.find(prj => prj.id === projectId);
    if (project && project.status !== newStatus) {
      project.status = newStatus;
      this.updateListeners();
    }
  }
  
  private updateListeners() {
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
    }
  }
}
const projectState = ProjectState.getInstance();

//validation
interface Validation {
  value: string | number;
  required?: boolean; // boolean or undefined
  minlength?: number;
  maxlength?: number;
  min?: number;
  max?: number;
}
function validate(ValidatableInput: Validation) {
  let isValid = true;
  if (ValidatableInput.required) {
    isValid = isValid && ValidatableInput.value.toString().trim().length !== 0;
  }
  if (
    ValidatableInput.minlength != null &&
    typeof ValidatableInput.value === 'string'
  ) {
    isValid =
      isValid && ValidatableInput.value.length > ValidatableInput.minlength;
  }
  if (
    ValidatableInput.maxlength != null &&
    typeof ValidatableInput.value === 'string'
  ) {
    isValid =
      isValid && ValidatableInput.value.length < ValidatableInput.maxlength;
  }
  if (
    ValidatableInput.min != null &&
    typeof ValidatableInput.value === 'number'
  ) {
    isValid = isValid && ValidatableInput.value > ValidatableInput.min;
  }
  if (
    ValidatableInput.max != null &&
    typeof ValidatableInput.value === 'number'
  ) {
    isValid = isValid && ValidatableInput.value < ValidatableInput.max;
  }
  return isValid;
}
function autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const originMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originMethod.bind(this);
      return boundFn;
    },
  };
  return adjDescriptor;
}
// Component
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElem: HTMLTemplateElement;
  hostElem: T;
  element: U;
  constructor(
    templateId: string,
    hostElemId: string,
    insertAtStart: boolean,
    newElementId?: string
  ) {
    this.templateElem = document.getElementById(
      templateId
    )! as HTMLTemplateElement;
    this.hostElem = document.getElementById(hostElemId)! as T;
    const importedNode = document.importNode(this.templateElem.content, true);
    this.element = importedNode.firstElementChild as U;
    if (newElementId) {
      this.element.id = newElementId;
    }
    this.attach(insertAtStart);
  }
  private attach(insertAtStart: boolean) {
    this.hostElem.insertAdjacentElement(
      insertAtStart ? 'afterbegin' : 'beforeend',
      this.element
    );
  }
  abstract configure(): void;
  abstract renderContent(): void;
}

// Project list
class ProjectList2 {
  templateElem: HTMLTemplateElement;
  hostElem: HTMLDivElement;
  element: HTMLElement;
  assignedProjects: any[];

  constructor(private type: 'active' | 'finished') {
    //point to project list
    this.templateElem = document.getElementById(
      'project-list'
    )! as HTMLTemplateElement;
    this.hostElem = document.getElementById('app')! as HTMLDivElement;
    this.assignedProjects = [];
    const importedNode = document.importNode(this.templateElem.content, true);
    this.element = importedNode.firstElementChild as HTMLElement;
    this.element.id = `${this.type}-projects`;
    projectState.addListener((projects: Project[]) => {
      const relevantProjects = projects.filter((prj) => {
        if (this.type === 'active') {
          return prj.status === ProjectStatus.Active;
        } else {
          return prj.status === ProjectStatus.Finished;
        }
      });
      this.assignedProjects = relevantProjects;
      this.renderProjects();
    });
    this.attach();
    this.renderContent();
  }
  private renderProjects() {
    const listEl = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;
    listEl.innerHTML = '';
    for (const prjItem of this.assignedProjects) {
      const listItem = document.createElement('li');
      listItem.textContent = prjItem.title;
      listEl.appendChild(listItem);
    }
  }

  private renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector('ul')!.id = listId;
    this.element.querySelector('h2')!.textContent =
      this.type.toUpperCase() + ' PROJECTS';
  }
  private attach() {
    this.hostElem.insertAdjacentElement('beforeend', this.element);
  }
}
// ProjectItem Class
class ProjectItem
  extends Component<HTMLUListElement, HTMLLIElement>
  implements Draggable {
  private project: Project;
  get persons() {
    if (this.project.people === 1) {
      return '1 person';
    } else {
      return `${this.project.people} persons `;
    }
  }
  constructor(hostId: string, project: Project) {
    super('single-project', hostId, false, project.id);
    this.project = project;

    this.configure();
    this.renderContent();
  }

  @autobind
  dragStartHandler(event: DragEvent) {
    console.log(event);
    event.dataTransfer!.setData('text/plain', this.project.id);
    event.dataTransfer!.effectAllowed = 'move';
  }
  dragEndHandler(_: DragEvent) {
    console.log('DragEnd');
  }
  configure() {
    this.element.addEventListener('dragstart', this.dragStartHandler);
    this.element.addEventListener('dragend', this.dragEndHandler);
  }


  renderContent() {
    this.element.querySelector('h2')!.textContent = this.project.title;
    this.element.querySelector('h3')!.textContent = this.persons + ' assigned';
    this.element.querySelector('p')!.textContent = this.project.description;
  }
}
class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
  assignedProjects: Project[];

  constructor(private type: 'active' | 'finished') {
    super('project-list', 'app', false, `${type}-projects`);
    this.assignedProjects = [];
    //point to project list
    this.configure();
    this.renderContent();
  }
  configure() {
    this.element.addEventListener('dragover', this.dragOverHandler);
    this.element.addEventListener('dragleave', this.dragLeaveHandler);
    this.element.addEventListener('drop', this.dropHandler);
    projectState.addListener((projects: Project[]) => {
      const relevantProjects = projects.filter((prj) => {
        if (this.type === 'active') {
          // should be return instead of passing the value
          return prj.status === ProjectStatus.Active;
        }
        return prj.status === ProjectStatus.Finished;
      });
      this.assignedProjects = relevantProjects;
      this.renderProjects();
    });
  }
  renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector('ul')!.id = listId;
    this.element.querySelector('h2')!.textContent =
      this.type.toUpperCase() + ' PROJECTS';
  }
  @autobind
  dragOverHandler(event: DragEvent) {
    if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
      event.preventDefault();
      const listEl = this.element.querySelector('ul')!;
      listEl.classList.add('droppable');
    }
  }

  @autobind
  dropHandler(event: DragEvent) {
    const prjId = event.dataTransfer!.getData('text/plain');
    projectState.moveProject(
      prjId,
      this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished
    );
  }
  @autobind
  dragLeaveHandler(_: DragEvent) {
    const listEl = this.element.querySelector('ul')!;
    listEl.classList.remove('droppable');
  }
  private renderProjects() {
    const listEl = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;
    listEl.innerHTML = '';
    for (const prjItem of this.assignedProjects) {
      new ProjectItem(this.element.querySelector('ul')!.id, prjItem);
    }
  }
}

//Input
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  // templateElem : HTMLTemplateElement;
  // hostElem : HTMLDivElement;
  // element : HTMLFormElement;
  titleElem: HTMLInputElement;
  descriptionElem: HTMLInputElement;
  peopleElem: HTMLInputElement;

  constructor() {
    super('project-input', 'app', true, 'user-input');
    // const templateEl = document.getElementById('project-inpiut');
    // if(templateEl) {
    //     this.templateElem = this.templateEl;
    // }
    // this.templateElem = document.getElementById('project-input')! as HTMLTemplateElement;
    // this.hostElem = document.getElementById('app')! as HTMLDivElement;

    // const importedNode = document.importNode(this.templateElem.content, true);
    // this.element = importedNode.firstElementChild as HTMLFormElement;
    // this.element.id = 'user-input';
    this.titleElem = this.element.querySelector('#title') as HTMLInputElement;
    this.descriptionElem = this.element.querySelector(
      '#description'
    ) as HTMLInputElement;
    this.peopleElem = this.element.querySelector('#people') as HTMLInputElement;
    this.configure();
  }
  configure() {
    this.element.addEventListener('submit', this.submitHandler);
  }
  renderContent() {}
  private clear() {
    (this.titleElem.value = ''),
      (this.descriptionElem.value = ''),
      (this.peopleElem.value = '');
  }
  private gatherUserInput(): [string, string, number] | void {
    const enterTitle = this.titleElem.value;
    const enterDescriptionElem = this.descriptionElem.value;
    const enterPeopleElem = this.peopleElem.value;
    // if(enterTitle.trim().length === 0 || enterDescriptionElem.trim().length === 0|| enterPeopleElem.trim().length === 0) {
    const titleValidatable: Validation = {
      value: enterTitle,
      required: true,
    };
    const descritionValidatable: Validation = {
      value: enterDescriptionElem,
      required: true,
      minlength: 5,
    };
    const peopleValidatable: Validation = {
      value: +enterPeopleElem,
      required: true,
      min: 3,
    };
    if (
      !validate(titleValidatable) ||
      !validate(descritionValidatable) ||
      !validate(peopleValidatable)
    ) {
      alert('wrong');
      return;
    } else {
      return [enterTitle, enterDescriptionElem, +enterPeopleElem];
    }
  }

  @autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    console.log('test -->', this.titleElem.value);
    const userInput = this.gatherUserInput();
    // if (Array.isArray(userInput)) {
    //     const [title, desc, people] = userInput
    //     console.log("title - desc - people", title, desc, people)
    //     this.clear();
    // }
    if (Array.isArray(userInput)) {
      const [title, desc, people] = userInput;
      projectState.addProject(title, desc, people);
      this.clear();
    }
  }
  // private configure() {
  //     this.element.addEventListener('submit', this.submitHandler.bind(this))
  // }
}

const newInput = new ProjectInput();
//you can use ProjectList2('active')
const activeProjectList = new ProjectList('active');
const finishedProjectList = new ProjectList('finished');
