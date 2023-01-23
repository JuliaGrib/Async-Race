import { Component } from "../module/component";
import {IConfigComponent } from '../types/types';
import {WinnerCarElem } from '../types/types';

localStorage.setItem('pageWin', '1');
let winPage = Number(localStorage.getItem('pageWin'));
const baseUrl = 'http://127.0.0.1:3000';

class AppWin extends Component {
    constructor(config: IConfigComponent){
        super(config)
    }
    actions() {
        return {
          'getWinners': 'getWinners',
        }
      }
    events() {
        return {
            'click .next-win': 'getNextWin',
            'click .prev-win': 'getPrevWin',
        }
    }

    async getWinners(){
        const response = await fetch(`${baseUrl}/winners`);
        const dataWin = await response.json();
        console.log(dataWin);
        const response2 = await fetch(`${baseUrl}/winners?_page=${winPage}&_limit=10`);
        const dataWinList = await response2.json();
        dataWinList.sort((a: WinnerCarElem , b: WinnerCarElem) => a.time - b.time);
       

        const titleWin = document.querySelector('.page-win') as HTMLHeadElement;
        const headerWin = document.querySelector('.header-win') as HTMLHeadElement;
        const tableInfo = document.querySelector('.table-info') as HTMLTableElement;

        const tableInfoTable = document.createElement('table');
        tableInfo.appendChild(tableInfoTable);
        headerWin.innerHTML = `Winners (${dataWin.length})`;
        titleWin.innerHTML = `Page (${winPage})`;
        

        for (let i = 0; i < dataWinList.length; i++){
            const trElem = document.createElement('tr');
            const num = i;
            trElem.innerHTML = `
                <td>${num + 1}</td>
                <td>Car</td>
                <td>Name</td>
                <td>${dataWinList[i]["wins"]}</td>
                <td>${dataWinList[i]["time"]}</td>
            `
            tableInfoTable.appendChild(trElem);
        }
    }

    async getNextWin(){
         if(winPage >= 1) {
            winPage++;
            const response = await fetch(`${baseUrl}/winners?_page=${winPage}&_limit=10`);
            const dataWinList = await response.json();
            dataWinList.sort((a: WinnerCarElem , b: WinnerCarElem) => a.time - b.time);
    
            const titleWin = document.querySelector('.page-win') as HTMLHeadElement;
            const tableInfo = document.querySelector('.table-info') as HTMLTableElement;
            const tableInfoTable = document.createElement('table');
            tableInfo.innerHTML= '';
            tableInfo.appendChild(tableInfoTable);
            titleWin.innerHTML = `Page (${winPage})`;
    
            for (let i = 0; i < dataWinList.length; i++){
                const trElem = document.createElement('tr');
                const num = i;
                trElem.innerHTML = `
                    <td>${num + 1}</td>
                    <td>Car</td>
                    <td>Name</td>
                    <td>${dataWinList[i]["wins"]}</td>
                    <td>${dataWinList[i]["time"]}</td>
                `
                tableInfoTable.appendChild(trElem);
            }
         }
 
    }

    async getPrevWin(){
        if(winPage > 1) {
            --winPage;
            const response = await fetch(`${baseUrl}/winners?_page=${winPage}&_limit=10`);
            const dataWinList = await response.json();
            dataWinList.sort((a: WinnerCarElem , b: WinnerCarElem) => a.time - b.time);
    
            const titleWin = document.querySelector('.page-win') as HTMLHeadElement;
            const tableInfo = document.querySelector('.table-info') as HTMLTableElement;
            const tableInfoTable = document.createElement('table');
            tableInfo.innerHTML= '';
            tableInfo.appendChild(tableInfoTable);
            titleWin.innerHTML = `Page (${winPage})`;
    
            for (let i = 0; i < dataWinList.length; i++){
                const trElem = document.createElement('tr');
                const num = i;
                trElem.innerHTML = `
                    <td>${num + 1}</td>
                    <td>Car</td>
                    <td>Name</td>
                    <td>${dataWinList[i]["wins"]}</td>
                    <td>${dataWinList[i]["time"]}</td>
                `
                tableInfoTable.appendChild(trElem);
            }
        }
    }
}

export const appWin: AppWin = new AppWin(
    {
        selector: 'app-content',
        template: `
        <h1 class="header-win"></h1>
        <h2 class="page-win"></h2>
        <table class="table-win">
            <tr class="table-header">
                <td>Number</td>
                <td>Car</td>
                <td>Name</td>
                <td>Win</td>
                <td>Time</td>
            </tr>
        </table>
        <div class="table-info"></div>
        <button class="prev-win">Prev</button><button class="next-win">Next</button>
        `
    }
)