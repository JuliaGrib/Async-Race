import { Component } from "../module/component";
import {IConfigComponent } from '../types/types';
import { appCars } from './cars'
import { appWin } from './winners'
const baseUrl = 'http://127.0.0.1:3000';
class AppHeader extends Component {
    constructor(config: IConfigComponent){
        super(config)
    }

    events(){
      return {
        'click .to-garage': 'makeCar',
        'click .to-win': 'makeWin',
      }
    }

    makeCar(){
      appCars.render();
    }
    makeWin(){
      appWin.render();
    }
}

export const appHeader: AppHeader = new AppHeader(
    {
        selector: 'app-header',
        template: `
        <header class="container__header">
            <button class="to-garage">TO GARAGE</button>
            <button class="to-win">TO WINNERS</button>
        </header>
        `
    }
)

