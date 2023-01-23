import {IConfigComponent } from '../types/types';
type CallbackFunction = () => void

export class Component {
    template: string
    selector: string
    el: Element | null
    events?(): object
    actions?(): object

    constructor(config: IConfigComponent){
        this.template = config.template
        this.selector = config.selector
        this.el = null
    }

    render(){
        this.el = document.querySelector(this.selector) ;
        if(!this.el) throw new Error(`Component with selector ${this.selector} wasnt found`);
        this.el.innerHTML = this.template;
        this._initActions();
        this._initEvents();
    }

    _initEvents(){
        if(typeof this.events === 'undefined') return
        const events = this.events();
        Object.keys(events).forEach((key) => {
            const listener = key.split(' ');
            if(!this.el) throw new Error(`Component with selector ${this.selector} wasnt found`)
            this.el.querySelectorAll(listener[1]).forEach((elem) => {
              const k = key as keyof typeof events;
              const a = events[k] as keyof typeof this.events;
              elem.addEventListener(listener[0], (this[a] as CallbackFunction).bind(this));
            })
        })
    }


    _initActions(){
        if(typeof  this.actions === 'undefined') return
        const actions = this.actions()
        Object.keys(actions).forEach((key) => {
          const k = key as keyof typeof actions;
          const a = actions[k] as keyof typeof this.actions;
          (this[a] as CallbackFunction)();
        })
      }

}