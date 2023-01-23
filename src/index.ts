import './style.css'
import { appHeader } from './app/view/header'
import { appCars } from './app/view/cars'


const mainTag = document.querySelector('.main') as HTMLDivElement;
const headerTag = document.createElement('app-header');
const contentTag = document.createElement('app-content');
mainTag.appendChild(headerTag);
mainTag.appendChild(contentTag);

appHeader.render();
appCars.render();


