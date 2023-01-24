import { Component } from "../module/component";
import {IConfigComponent } from '../types/types';
import { paramMove } from '../types/types';
import { carNames } from './carsList';
import { winCar } from '../types/types';


let win: string | null | undefined = null;
localStorage.setItem('pageCar', '1');
let carPageLocal = Number(localStorage.getItem('pageCar'));
const baseUrl = 'http://127.0.0.1:3000';

let moving: Array<NodeJS.Timer> = [];


class AppCars extends Component {
    constructor(config: IConfigComponent){
        super(config)
    }

    actions() {
        return {
          'getCars': 'getCars',
        }
      }

    events() {
        return {
            'click .car-list': 'startCar',
            'click .race': 'startAll',
            'click .reset': 'stopAll',
            'click .next-car': 'getNextCars',
            'click .prev-car': 'getPrevCars',
            'click .generate': 'generateNewCar',
            'click .made-create': 'madeCar',
            'click .made-change': 'changeCar',
        }
    }

    async changeCar(){
            const inputText = document.querySelector('.change-text') as HTMLInputElement;
            inputText.disabled = true;
            const name = inputText.value;
            const id = inputText.dataset.id
            
            const inputColor = document.querySelector('.change-color') as HTMLInputElement;
            inputColor.disabled = true;
            const color = inputColor.value;

            const changeBtn = document.querySelector('.made-change') as HTMLButtonElement;
            changeBtn.disabled = true;

            inputText.value = '';
            inputColor.value = '';

            const car = {
                "name": name,
                "model": '',
                "color": color,
            }
            await fetch(`${baseUrl}/garage/${id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(car),
              });
    
              this.getCars();
              console.log(car);
    }

    async madeCar(){
        const inputText = document.querySelector('.create-text') as HTMLInputElement;
        const inputColor = document.querySelector('.create-color') as HTMLInputElement;
        const textValue = inputText.value;
        const colorValue = inputColor.value;
        const car = {
            "name": textValue || 'no name',
            "model": '',
            "color": colorValue,
        }
        await fetch(`${baseUrl}/garage`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(car)
          });

          this.getCars();

          inputText.value = '';
          inputColor.value = '';
    }

    async startCar(event: Event) {
        const target = event.target as HTMLElement;
       
        if (target.className === 'btn-a') {
            const btna = target as HTMLButtonElement;
            const btnb = target.nextSibling as HTMLButtonElement;
            btna.disabled = true;
            btnb.disabled = false;
            const id: string | undefined = target.dataset.id;
            const response = await fetch(`${baseUrl}/engine?id=${id}&status=started`, {method: 'PATCH'});
            const distance = await response.json();
            this.moveElem(distance, id);
        }
        if (target.className === 'btn-b') {
            const btnb = target as HTMLButtonElement;
            const btna = target.previousSibling as HTMLButtonElement;
            btna.disabled = false;
            btnb.disabled = true;

            const id: string | undefined = target.dataset.id;
            const response = await fetch(`${baseUrl}/engine?id=${id}&status=stopped`, {method: 'PATCH'});
            const stop = await response.json();
            this.stopElem(id);

        }
        if (target.className === 'select') {
            const id: string | undefined = target.dataset.id;
            const response = await fetch(`${baseUrl}/garage?id=${id}`);
            const dataCar = await response.json();

            const inputText = document.querySelector('.change-text') as HTMLInputElement;
            inputText.disabled = false;
            inputText.value = `${dataCar[0]["name"]} ${dataCar[0]["model"] || ' '}`;
            inputText.dataset.id = id;

            
            const inputColor = document.querySelector('.change-color') as HTMLInputElement;
            inputColor.disabled = false;
            inputColor.value = dataCar[0]["color"];

            const changeBtn = document.querySelector('.made-change') as HTMLButtonElement;
            changeBtn.disabled = false;

        }
        if (target.className === 'remove') {
            const id: string | undefined = target.dataset.id;
            const response = await fetch(`${baseUrl}/garage/${id}`, {
                method: 'DELETE'
              });
              this.getCars();
              const inputText = document.querySelector('.change-text') as HTMLInputElement;
              inputText.disabled = true;
              
              const inputColor = document.querySelector('.change-color') as HTMLInputElement;
              inputColor.disabled = true;
  
              const changeBtn = document.querySelector('.made-change') as HTMLButtonElement;
              changeBtn.disabled = true;
  
              inputText.value = '';
              inputColor.value = '';
        }
    }

    moveElem(param: paramMove, id: string | undefined){
        localStorage.setItem('winCar', 'false');
        const a = param.distance/param.velocity;
        const svg = document.querySelector(`[data-car$="${id}"]`) as HTMLElement;
        const widthDist = document.querySelector('.car-line') as HTMLElement;
        const winP = document.querySelector('.wincar') as HTMLElement;

        let curX = 0;
        const endX = widthDist.offsetWidth - 110;

        function animataPos(){
            const intervalID: NodeJS.Timer = setInterval(() => {
                curX += 10;

                if(curX > endX){
                    clearInterval(intervalID);
                    if(!(win)){
                        win = id;
                        winCar(id);
                        setTimeout(()=> {
                            const p = document.querySelector('.wincar') as HTMLParagraphElement;
                            p.innerHTML = '';
                            const body = document.querySelector('body') as HTMLBodyElement;
                            body.style.background = ``;
                        }, 3000);
                    }
                    
                }

                svg.style.transform =  `translateX(${curX}px)`
            }, a/200);
            moving.push(intervalID);           
        }
        animataPos();
        console.log(moving);
    }



    stopElem(id: string | undefined){
        win = null;
        const svg = document.querySelector(`[data-car$="${id}"]`) as HTMLElement;
        svg.style.transform =  `translateX(0px)`;
        moving.forEach((elem) => clearInterval(elem));
        moving = [];
    }

    startAll(){
        const reset = document.querySelector('.reset') as HTMLButtonElement;
        const race = document.querySelector('.race') as HTMLButtonElement;
        reset.disabled = false;
        race.disabled = true;

        const allCars = (document.querySelectorAll('.btn-a')) as NodeListOf<HTMLElement>;
        allCars.forEach((elem) => elem.click());
    }

    stopAll(){
        const reset = document.querySelector('.reset') as HTMLButtonElement;
        const race = document.querySelector('.race') as HTMLButtonElement;
        reset.disabled = true;
        race.disabled = false;

        const allCars = (document.querySelectorAll('.btn-b')) as NodeListOf<HTMLElement>;
        allCars.forEach((elem) => elem.click());
    }



    async getCars(){
        const response = await fetch(`${baseUrl}/garage`);
        const dataCar = await response.json();


        const carHeader = document.querySelector('.car-header') as HTMLHeadElement;
        carHeader.innerHTML = `Garage (${dataCar.length})`;

        const carPage = document.querySelector('.car-page') as HTMLHeadElement; 
        carPage.innerHTML = `Page #${carPageLocal}`;

        const response2 = await fetch(`${baseUrl}/garage?_page=${carPageLocal}&_limit=7`);
        const dataCarList = await response2.json();

        const carList = document.querySelector('.car-list') as HTMLDivElement; 
        carList.innerHTML = '';


        for(let i = 0; i < dataCarList.length; i++){
            const carElem = document.createElement('div');
            const carContainer = document.createElement('div');
            const btnA = document.createElement('button');
            const btnB = document.createElement('button');
            const nameCar = document.createElement('p');
            const colorCar = document.createElement('div');
            const carLine = document.createElement('div');
            const finish = document.createElement('span');
            const ghangeBtns = document.createElement('div');
            const select = document.createElement('button');
            const remove = document.createElement('button');

            carElem.classList.add('car-elem');
            carContainer.classList.add('car-container');
            btnA.classList.add('btn-a');
            btnB.classList.add('btn-b');
            nameCar.classList.add('name-car');
            colorCar.classList.add('color-car');
            carLine.classList.add('car-line');
            finish.classList.add('finish');
            select.classList.add('select');
            remove.classList.add('remove');
            btnB.disabled = true;




            btnA.innerHTML = 'A';
            btnB.innerHTML = 'B';
            select.innerHTML = 'SELECT';
            remove.innerHTML = 'REMOVE';
            nameCar.innerHTML = `${dataCarList[i]["name"]} ${dataCarList[i]["model"] || ''}`;
            colorCar.innerHTML = `
            
            <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                width="1280.000000pt" height="640.000000pt" viewBox="0 0 1280.000000 640.000000"
                preserveAspectRatio="xMidYMid meet">
                <metadata>
                Created by potrace 1.15, written by Peter Selinger 2001-2017
                </metadata>
                <g transform="translate(0.000000,640.000000) scale(0.100000,-0.100000)"
                fill="${dataCarList[i]["color"]}" stroke="none">
                <path d="M3565 5336 c-106 -30 -101 -26 -108 -111 -4 -42 -9 -80 -12 -85 -6
                -10 -246 -105 -590 -234 -448 -167 -1052 -415 -1173 -483 -78 -43 -193 -91
                -250 -104 -23 -5 -98 -14 -165 -19 -67 -6 -167 -19 -222 -30 -154 -31 -340
                -49 -563 -57 l-203 -6 -43 -66 c-59 -91 -60 -95 -26 -130 37 -37 38 -65 3
                -150 -25 -62 -27 -78 -31 -256 l-4 -190 -38 -32 c-91 -78 -133 -209 -134 -418
                0 -194 11 -396 26 -482 13 -71 14 -74 72 -122 69 -58 130 -129 158 -184 64
                -126 534 -211 1384 -250 l92 -4 -6 119 c-6 142 8 256 49 383 112 352 394 622
                756 722 90 26 112 28 278 28 165 0 188 -2 278 -27 201 -56 361 -152 504 -302
                140 -145 222 -293 274 -492 21 -79 24 -109 23 -279 -1 -127 -6 -214 -16 -263
                l-15 -73 3006 7 c1653 4 3007 8 3009 9 1 1 -8 37 -20 81 -19 67 -22 105 -22
                259 -1 166 1 187 27 279 117 421 467 736 885 797 119 17 325 7 432 -21 239
                -63 453 -205 601 -399 70 -92 154 -267 185 -386 24 -88 27 -119 27 -260 1
                -116 -4 -181 -16 -234 -10 -41 -16 -75 -15 -76 2 -1 62 2 133 6 266 16 458 45
                525 79 48 24 97 81 127 146 l24 52 -16 157 c-15 152 -15 163 4 284 63 388 50
                680 -35 802 -134 193 -526 336 -1429 519 -737 149 -1322 209 -2033 210 -228 0
                -226 0 -347 85 -187 131 -1045 607 -1471 815 -383 187 -788 281 -1439 332
                -208 17 -1106 16 -1400 0 -121 -7 -314 -19 -430 -27 -302 -22 -286 -22 -341
                10 -140 81 -187 94 -269 71z m1885 -333 c6 -37 38 -238 71 -446 32 -209 66
                -422 75 -474 9 -52 15 -96 13 -97 -11 -9 -1699 29 -1951 44 -206 13 -417 36
                -485 54 -98 26 -198 119 -249 231 -35 75 -36 172 -5 255 17 45 30 61 68 86 83
                54 135 80 253 127 341 136 858 230 1460 267 269 16 270 16 511 18 l227 2 12
                -67z m630 47 c264 -18 777 -110 1029 -186 186 -56 445 -188 756 -387 211 -134
                274 -181 250 -185 -75 -12 -133 -50 -162 -106 -19 -35 -21 -136 -4 -179 l11
                -27 -907 2 -906 3 -59 160 c-110 302 -298 878 -298 916 0 6 95 2 290 -11z"/>
                <path d="M2633 3125 c-223 -40 -410 -141 -568 -306 -132 -138 -213 -283 -262
                -467 -22 -83 -26 -119 -26 -247 -1 -169 10 -236 65 -382 87 -230 271 -436 493
                -551 85 -44 178 -78 271 -98 107 -23 312 -23 419 1 392 84 699 375 802 761 23
                86 26 120 27 254 1 158 -5 199 -46 330 -98 310 -355 567 -668 669 -150 50
                -354 64 -507 36z m350 -301 c249 -56 457 -247 543 -499 25 -72 28 -95 28 -220
                1 -153 -15 -228 -74 -345 -94 -186 -283 -337 -485 -386 -96 -24 -268 -24 -360
                0 -320 84 -544 355 -562 681 -20 359 209 673 558 765 94 24 253 26 352 4z"/>
                <path d="M2600 2697 c-36 -13 -85 -36 -109 -51 l-44 -28 116 -115 c81 -82 120
                -114 131 -110 14 6 16 29 16 167 0 186 6 178 -110 137z"/>
                <path d="M2920 2561 c0 -139 2 -162 16 -168 11 -4 50 28 130 108 l115 114 -28
                22 c-34 28 -138 70 -193 79 l-40 7 0 -162z"/>
                <path d="M2282 2448 c-28 -36 -92 -191 -92 -225 0 -10 34 -13 165 -13 151 0
                165 1 165 18 0 15 -206 232 -221 232 -4 0 -11 -6 -17 -12z"/>
                <path d="M3222 2351 c-62 -59 -112 -115 -112 -124 0 -15 17 -17 165 -17 131 0
                165 3 165 13 0 40 -69 205 -95 227 -7 6 -48 -27 -123 -99z"/>
                <path d="M2781 2332 c-12 -22 11 -62 34 -62 8 0 21 10 29 22 20 28 4 58 -29
                58 -13 0 -29 -8 -34 -18z"/>
                <path d="M2749 2161 c-32 -33 -37 -67 -14 -110 29 -57 104 -64 151 -14 53 57
                9 153 -71 153 -27 0 -44 -8 -66 -29z"/>
                <path d="M2570 2125 c-26 -32 13 -81 48 -59 24 16 27 45 6 61 -23 17 -39 16
                -54 -2z"/>
                <path d="M3006 2124 c-20 -19 -20 -38 -2 -54 23 -19 61 -8 64 18 7 44 -32 67
                -62 36z"/>
                <path d="M2190 1975 c0 -29 41 -140 72 -194 l31 -53 117 117 c71 71 116 123
                113 131 -4 11 -40 14 -169 14 -141 0 -164 -2 -164 -15z"/>
                <path d="M3110 1972 c0 -9 51 -68 114 -131 l114 -114 31 54 c30 51 71 165 71
                195 0 11 -31 14 -165 14 -151 0 -165 -1 -165 -18z"/>
                <path d="M2780 1901 c-7 -15 -5 -24 8 -41 32 -40 85 -4 62 41 -14 25 -56 25
                -70 0z"/>
                <path d="M2562 1697 c-61 -62 -112 -115 -112 -119 0 -18 208 -108 249 -108 7
                0 11 54 11 164 0 140 -2 165 -16 170 -9 3 -16 6 -17 6 -1 0 -53 -51 -115 -113z"/>
                <path d="M2933 1803 c-15 -6 -19 -333 -4 -333 46 0 251 88 251 108 0 9 -223
                232 -230 231 -3 0 -11 -3 -17 -6z"/>
                <path d="M10700 3119 c-390 -84 -696 -376 -797 -759 -31 -117 -41 -292 -24
                -411 33 -227 150 -453 318 -609 267 -250 643 -344 993 -249 117 32 283 118
                380 196 487 396 518 1128 67 1560 -97 93 -166 140 -290 198 -137 64 -235 86
                -407 91 -120 3 -162 0 -240 -17z m445 -313 c238 -81 409 -258 486 -506 30 -96
                33 -289 5 -388 -110 -400 -513 -637 -911 -536 -149 38 -313 147 -402 267 -176
                238 -203 533 -71 797 34 69 60 103 138 180 77 78 111 104 181 139 129 65 207
                81 364 77 109 -3 143 -7 210 -30z"/>
                <path d="M10703 2700 c-54 -19 -153 -71 -153 -80 0 -3 51 -57 114 -119 80 -80
                119 -112 130 -108 14 5 16 29 16 167 l0 160 -27 -1 c-16 0 -52 -9 -80 -19z"/>
                <path d="M11020 2561 c0 -139 2 -162 16 -168 22 -8 247 216 234 232 -17 20
                -163 84 -207 91 l-43 7 0 -162z"/>
                <path d="M10366 2424 c-29 -44 -76 -165 -76 -194 0 -19 7 -20 165 -20 126 0
                165 3 165 13 0 7 -51 63 -114 126 l-114 114 -26 -39z"/>
                <path d="M11313 2348 c-61 -62 -109 -119 -106 -125 6 -15 333 -19 333 -4 0 45
                -88 241 -108 241 -4 0 -57 -51 -119 -112z"/>
                <path d="M10882 2338 c-17 -17 -15 -32 7 -52 16 -14 23 -15 41 -6 31 17 24 64
                -10 68 -14 2 -31 -3 -38 -10z"/>
                <path d="M10846 2159 c-68 -81 17 -194 110 -144 89 48 56 175 -46 175 -30 0
                -44 -6 -64 -31z"/>
                <path d="M10670 2126 c-19 -23 -8 -61 18 -64 44 -7 67 32 36 62 -19 20 -38 20
                -54 2z"/>
                <path d="M11106 2127 c-21 -16 -18 -45 7 -61 37 -23 77 35 41 61 -10 7 -21 13
                -24 13 -3 0 -14 -6 -24 -13z"/>
                <path d="M10290 1970 c0 -29 43 -141 74 -195 l28 -48 116 116 c81 81 113 120
                109 131 -6 14 -29 16 -167 16 -152 0 -160 -1 -160 -20z"/>
                <path d="M11207 1978 c-3 -7 47 -66 111 -130 l116 -118 27 43 c27 44 79 177
                79 203 0 12 -28 14 -164 14 -122 0 -166 -3 -169 -12z"/>
                <path d="M10881 1901 c-14 -25 -5 -48 20 -56 27 -9 51 13 47 44 -4 34 -51 43
                -67 12z"/>
                <path d="M10662 1697 c-61 -62 -112 -115 -112 -119 0 -20 201 -108 247 -108
                10 0 13 34 13 164 0 140 -2 165 -16 170 -9 3 -16 6 -17 6 -1 0 -53 -51 -115
                -113z"/>
                <path d="M11033 1803 c-10 -3 -13 -47 -13 -169 0 -90 4 -164 8 -164 36 0 186
                61 239 98 16 10 -216 242 -234 235z"/>
                </g>
            </svg>
            
            
            
            `;
            finish.innerHTML = `
                <svg width="134" height="413" viewBox="0 0 134 413" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="0.5" y="0.5" width="133" height="412" fill="#333639"/>
                <rect x="0.5" y="0.5" width="133" height="412" stroke="black"/>
                <rect x="0.5" y="0.5" width="133" height="412" stroke="black" stroke-opacity="0.2"/>
                <rect x="0.5" y="0.5" width="133" height="412" stroke="black" stroke-opacity="0.2"/>
                <rect x="0.5" y="0.5" width="133" height="412" stroke="black" stroke-opacity="0.2"/>
                <rect x="6" y="7" width="61" height="57" fill="white"/>
                <rect x="67" y="64" width="61" height="57" fill="white"/>
                <rect x="6" y="121" width="61" height="57" fill="white"/>
                <rect x="67" y="178" width="61" height="57" fill="white"/>
                <rect x="6" y="235" width="61" height="57" fill="white"/>
                <rect x="67" y="292" width="61" height="57" fill="white"/>
                <rect x="6" y="349" width="61" height="57" fill="white"/>
                </svg>
            
            `

            btnA.dataset.id = dataCarList[i]["id"];
            btnB.dataset.id = dataCarList[i]["id"];
            select.dataset.id = dataCarList[i]["id"];
            remove.dataset.id = dataCarList[i]["id"];
            colorCar.dataset.car = dataCarList[i]["id"];

            carList.appendChild(carElem);
            carElem.appendChild(carContainer);
            carContainer.appendChild(btnA);
            carContainer.appendChild(btnB);
            carContainer.appendChild(nameCar);
            carElem.appendChild(colorCar);
            carElem.appendChild(carLine);
            carElem.appendChild(finish);
            carElem.appendChild(ghangeBtns);
            ghangeBtns.appendChild(select);
            ghangeBtns.appendChild(remove);

        }
    }


    async getNextCars(){
        win = null;
        if(carPageLocal >= 1) {
            carPageLocal++;
            const response = await fetch(`${baseUrl}/garage`);
            const dataCar = await response.json();
    
    
            const carHeader = document.querySelector('.car-header') as HTMLHeadElement;
            carHeader.innerHTML = `Garage (${dataCar.length})`;
    
            const carPage = document.querySelector('.car-page') as HTMLHeadElement; 
            carPage.innerHTML = `Page #${carPageLocal}`;
    
            const response2 = await fetch(`${baseUrl}/garage?_page=${carPageLocal}&_limit=7`);
            const dataCarList = await response2.json();
    
            const carList = document.querySelector('.car-list') as HTMLDivElement; 
            carList.innerHTML = '';
   
           for(let i = 0; i < dataCarList.length; i++){
            const carElem = document.createElement('div');
            const carContainer = document.createElement('div');
            const btnA = document.createElement('button');
            const btnB = document.createElement('button');
            const nameCar = document.createElement('p');
            const colorCar = document.createElement('div');
            const carLine = document.createElement('div');
            const finish = document.createElement('span');
            const ghangeBtns = document.createElement('div');
            const select = document.createElement('button');
            const remove = document.createElement('button');
            btnB.disabled = true;

            carElem.classList.add('car-elem');
            carContainer.classList.add('car-container');
            btnA.classList.add('btn-a');
            btnB.classList.add('btn-b');
            nameCar.classList.add('name-car');
            colorCar.classList.add('color-car');
            carLine.classList.add('car-line');
            finish.classList.add('finish');
            select.classList.add('select');
            remove.classList.add('remove');


            btnA.innerHTML = 'A';
            btnB.innerHTML = 'B';
            select.innerHTML = 'SELECT';
            remove.innerHTML = 'REMOVE';
            nameCar.innerHTML = `${dataCarList[i]["name"]} ${dataCarList[i]["model"] || ''}`;
            colorCar.innerHTML = `
            
            <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                width="1280.000000pt" height="640.000000pt" viewBox="0 0 1280.000000 640.000000"
                preserveAspectRatio="xMidYMid meet">
                <metadata>
                Created by potrace 1.15, written by Peter Selinger 2001-2017
                </metadata>
                <g transform="translate(0.000000,640.000000) scale(0.100000,-0.100000)"
                fill="${dataCarList[i]["color"]}" stroke="none">
                <path d="M3565 5336 c-106 -30 -101 -26 -108 -111 -4 -42 -9 -80 -12 -85 -6
                -10 -246 -105 -590 -234 -448 -167 -1052 -415 -1173 -483 -78 -43 -193 -91
                -250 -104 -23 -5 -98 -14 -165 -19 -67 -6 -167 -19 -222 -30 -154 -31 -340
                -49 -563 -57 l-203 -6 -43 -66 c-59 -91 -60 -95 -26 -130 37 -37 38 -65 3
                -150 -25 -62 -27 -78 -31 -256 l-4 -190 -38 -32 c-91 -78 -133 -209 -134 -418
                0 -194 11 -396 26 -482 13 -71 14 -74 72 -122 69 -58 130 -129 158 -184 64
                -126 534 -211 1384 -250 l92 -4 -6 119 c-6 142 8 256 49 383 112 352 394 622
                756 722 90 26 112 28 278 28 165 0 188 -2 278 -27 201 -56 361 -152 504 -302
                140 -145 222 -293 274 -492 21 -79 24 -109 23 -279 -1 -127 -6 -214 -16 -263
                l-15 -73 3006 7 c1653 4 3007 8 3009 9 1 1 -8 37 -20 81 -19 67 -22 105 -22
                259 -1 166 1 187 27 279 117 421 467 736 885 797 119 17 325 7 432 -21 239
                -63 453 -205 601 -399 70 -92 154 -267 185 -386 24 -88 27 -119 27 -260 1
                -116 -4 -181 -16 -234 -10 -41 -16 -75 -15 -76 2 -1 62 2 133 6 266 16 458 45
                525 79 48 24 97 81 127 146 l24 52 -16 157 c-15 152 -15 163 4 284 63 388 50
                680 -35 802 -134 193 -526 336 -1429 519 -737 149 -1322 209 -2033 210 -228 0
                -226 0 -347 85 -187 131 -1045 607 -1471 815 -383 187 -788 281 -1439 332
                -208 17 -1106 16 -1400 0 -121 -7 -314 -19 -430 -27 -302 -22 -286 -22 -341
                10 -140 81 -187 94 -269 71z m1885 -333 c6 -37 38 -238 71 -446 32 -209 66
                -422 75 -474 9 -52 15 -96 13 -97 -11 -9 -1699 29 -1951 44 -206 13 -417 36
                -485 54 -98 26 -198 119 -249 231 -35 75 -36 172 -5 255 17 45 30 61 68 86 83
                54 135 80 253 127 341 136 858 230 1460 267 269 16 270 16 511 18 l227 2 12
                -67z m630 47 c264 -18 777 -110 1029 -186 186 -56 445 -188 756 -387 211 -134
                274 -181 250 -185 -75 -12 -133 -50 -162 -106 -19 -35 -21 -136 -4 -179 l11
                -27 -907 2 -906 3 -59 160 c-110 302 -298 878 -298 916 0 6 95 2 290 -11z"/>
                <path d="M2633 3125 c-223 -40 -410 -141 -568 -306 -132 -138 -213 -283 -262
                -467 -22 -83 -26 -119 -26 -247 -1 -169 10 -236 65 -382 87 -230 271 -436 493
                -551 85 -44 178 -78 271 -98 107 -23 312 -23 419 1 392 84 699 375 802 761 23
                86 26 120 27 254 1 158 -5 199 -46 330 -98 310 -355 567 -668 669 -150 50
                -354 64 -507 36z m350 -301 c249 -56 457 -247 543 -499 25 -72 28 -95 28 -220
                1 -153 -15 -228 -74 -345 -94 -186 -283 -337 -485 -386 -96 -24 -268 -24 -360
                0 -320 84 -544 355 -562 681 -20 359 209 673 558 765 94 24 253 26 352 4z"/>
                <path d="M2600 2697 c-36 -13 -85 -36 -109 -51 l-44 -28 116 -115 c81 -82 120
                -114 131 -110 14 6 16 29 16 167 0 186 6 178 -110 137z"/>
                <path d="M2920 2561 c0 -139 2 -162 16 -168 11 -4 50 28 130 108 l115 114 -28
                22 c-34 28 -138 70 -193 79 l-40 7 0 -162z"/>
                <path d="M2282 2448 c-28 -36 -92 -191 -92 -225 0 -10 34 -13 165 -13 151 0
                165 1 165 18 0 15 -206 232 -221 232 -4 0 -11 -6 -17 -12z"/>
                <path d="M3222 2351 c-62 -59 -112 -115 -112 -124 0 -15 17 -17 165 -17 131 0
                165 3 165 13 0 40 -69 205 -95 227 -7 6 -48 -27 -123 -99z"/>
                <path d="M2781 2332 c-12 -22 11 -62 34 -62 8 0 21 10 29 22 20 28 4 58 -29
                58 -13 0 -29 -8 -34 -18z"/>
                <path d="M2749 2161 c-32 -33 -37 -67 -14 -110 29 -57 104 -64 151 -14 53 57
                9 153 -71 153 -27 0 -44 -8 -66 -29z"/>
                <path d="M2570 2125 c-26 -32 13 -81 48 -59 24 16 27 45 6 61 -23 17 -39 16
                -54 -2z"/>
                <path d="M3006 2124 c-20 -19 -20 -38 -2 -54 23 -19 61 -8 64 18 7 44 -32 67
                -62 36z"/>
                <path d="M2190 1975 c0 -29 41 -140 72 -194 l31 -53 117 117 c71 71 116 123
                113 131 -4 11 -40 14 -169 14 -141 0 -164 -2 -164 -15z"/>
                <path d="M3110 1972 c0 -9 51 -68 114 -131 l114 -114 31 54 c30 51 71 165 71
                195 0 11 -31 14 -165 14 -151 0 -165 -1 -165 -18z"/>
                <path d="M2780 1901 c-7 -15 -5 -24 8 -41 32 -40 85 -4 62 41 -14 25 -56 25
                -70 0z"/>
                <path d="M2562 1697 c-61 -62 -112 -115 -112 -119 0 -18 208 -108 249 -108 7
                0 11 54 11 164 0 140 -2 165 -16 170 -9 3 -16 6 -17 6 -1 0 -53 -51 -115 -113z"/>
                <path d="M2933 1803 c-15 -6 -19 -333 -4 -333 46 0 251 88 251 108 0 9 -223
                232 -230 231 -3 0 -11 -3 -17 -6z"/>
                <path d="M10700 3119 c-390 -84 -696 -376 -797 -759 -31 -117 -41 -292 -24
                -411 33 -227 150 -453 318 -609 267 -250 643 -344 993 -249 117 32 283 118
                380 196 487 396 518 1128 67 1560 -97 93 -166 140 -290 198 -137 64 -235 86
                -407 91 -120 3 -162 0 -240 -17z m445 -313 c238 -81 409 -258 486 -506 30 -96
                33 -289 5 -388 -110 -400 -513 -637 -911 -536 -149 38 -313 147 -402 267 -176
                238 -203 533 -71 797 34 69 60 103 138 180 77 78 111 104 181 139 129 65 207
                81 364 77 109 -3 143 -7 210 -30z"/>
                <path d="M10703 2700 c-54 -19 -153 -71 -153 -80 0 -3 51 -57 114 -119 80 -80
                119 -112 130 -108 14 5 16 29 16 167 l0 160 -27 -1 c-16 0 -52 -9 -80 -19z"/>
                <path d="M11020 2561 c0 -139 2 -162 16 -168 22 -8 247 216 234 232 -17 20
                -163 84 -207 91 l-43 7 0 -162z"/>
                <path d="M10366 2424 c-29 -44 -76 -165 -76 -194 0 -19 7 -20 165 -20 126 0
                165 3 165 13 0 7 -51 63 -114 126 l-114 114 -26 -39z"/>
                <path d="M11313 2348 c-61 -62 -109 -119 -106 -125 6 -15 333 -19 333 -4 0 45
                -88 241 -108 241 -4 0 -57 -51 -119 -112z"/>
                <path d="M10882 2338 c-17 -17 -15 -32 7 -52 16 -14 23 -15 41 -6 31 17 24 64
                -10 68 -14 2 -31 -3 -38 -10z"/>
                <path d="M10846 2159 c-68 -81 17 -194 110 -144 89 48 56 175 -46 175 -30 0
                -44 -6 -64 -31z"/>
                <path d="M10670 2126 c-19 -23 -8 -61 18 -64 44 -7 67 32 36 62 -19 20 -38 20
                -54 2z"/>
                <path d="M11106 2127 c-21 -16 -18 -45 7 -61 37 -23 77 35 41 61 -10 7 -21 13
                -24 13 -3 0 -14 -6 -24 -13z"/>
                <path d="M10290 1970 c0 -29 43 -141 74 -195 l28 -48 116 116 c81 81 113 120
                109 131 -6 14 -29 16 -167 16 -152 0 -160 -1 -160 -20z"/>
                <path d="M11207 1978 c-3 -7 47 -66 111 -130 l116 -118 27 43 c27 44 79 177
                79 203 0 12 -28 14 -164 14 -122 0 -166 -3 -169 -12z"/>
                <path d="M10881 1901 c-14 -25 -5 -48 20 -56 27 -9 51 13 47 44 -4 34 -51 43
                -67 12z"/>
                <path d="M10662 1697 c-61 -62 -112 -115 -112 -119 0 -20 201 -108 247 -108
                10 0 13 34 13 164 0 140 -2 165 -16 170 -9 3 -16 6 -17 6 -1 0 -53 -51 -115
                -113z"/>
                <path d="M11033 1803 c-10 -3 -13 -47 -13 -169 0 -90 4 -164 8 -164 36 0 186
                61 239 98 16 10 -216 242 -234 235z"/>
                </g>
            </svg>
            
            
            
            `;
            finish.innerHTML = `
                <svg width="134" height="413" viewBox="0 0 134 413" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="0.5" y="0.5" width="133" height="412" fill="#333639"/>
                <rect x="0.5" y="0.5" width="133" height="412" stroke="black"/>
                <rect x="0.5" y="0.5" width="133" height="412" stroke="black" stroke-opacity="0.2"/>
                <rect x="0.5" y="0.5" width="133" height="412" stroke="black" stroke-opacity="0.2"/>
                <rect x="0.5" y="0.5" width="133" height="412" stroke="black" stroke-opacity="0.2"/>
                <rect x="6" y="7" width="61" height="57" fill="white"/>
                <rect x="67" y="64" width="61" height="57" fill="white"/>
                <rect x="6" y="121" width="61" height="57" fill="white"/>
                <rect x="67" y="178" width="61" height="57" fill="white"/>
                <rect x="6" y="235" width="61" height="57" fill="white"/>
                <rect x="67" y="292" width="61" height="57" fill="white"/>
                <rect x="6" y="349" width="61" height="57" fill="white"/>
                </svg>
            
            `

            btnA.dataset.id = dataCarList[i]["id"];
            btnB.dataset.id = dataCarList[i]["id"];
            select.dataset.id = dataCarList[i]["id"];
            remove.dataset.id = dataCarList[i]["id"];
            colorCar.dataset.car = dataCarList[i]["id"];

            carList.appendChild(carElem);
            carElem.appendChild(carContainer);
            carContainer.appendChild(btnA);
            carContainer.appendChild(btnB);
            carContainer.appendChild(nameCar);
            carElem.appendChild(colorCar);
            carElem.appendChild(carLine);
            carElem.appendChild(finish);
            carElem.appendChild(ghangeBtns);
            ghangeBtns.appendChild(select);
            ghangeBtns.appendChild(remove);
        }
        }

        const reset = document.querySelector('.reset') as HTMLButtonElement;
        const race = document.querySelector('.race') as HTMLButtonElement;
        reset.disabled = true;
        race.disabled = false;

    }

    async getPrevCars(){
        win = null;
        if(carPageLocal > 1) {
            --carPageLocal;
            const response = await fetch(`${baseUrl}/garage`);
            const dataCar = await response.json();
    
    
            const carHeader = document.querySelector('.car-header') as HTMLHeadElement;
            carHeader.innerHTML = `Garage (${dataCar.length})`;
    
            const carPage = document.querySelector('.car-page') as HTMLHeadElement; 
            carPage.innerHTML = `Page #${carPageLocal}`;
    
            const response2 = await fetch(`${baseUrl}/garage?_page=${carPageLocal}&_limit=7`);
            const dataCarList = await response2.json();
    
            const carList = document.querySelector('.car-list') as HTMLDivElement; 
            carList.innerHTML = '';
   
           for(let i = 0; i < dataCarList.length; i++){
            const carElem = document.createElement('div');
            const carContainer = document.createElement('div');
            const btnA = document.createElement('button');
            const btnB = document.createElement('button');
            const nameCar = document.createElement('p');
            const colorCar = document.createElement('div');
            const carLine = document.createElement('div');
            const finish = document.createElement('span');
            const ghangeBtns = document.createElement('div');
            const select = document.createElement('button');
            const remove = document.createElement('button');

            carElem.classList.add('car-elem');
            carContainer.classList.add('car-container');
            btnA.classList.add('btn-a');
            btnB.classList.add('btn-b');
            nameCar.classList.add('name-car');
            colorCar.classList.add('color-car');
            carLine.classList.add('car-line');
            finish.classList.add('finish');
            select.classList.add('select');
            remove.classList.add('remove');
            btnB.disabled = true;


            btnA.innerHTML = 'A';
            btnB.innerHTML = 'B';
            select.innerHTML = 'SELECT';
            remove.innerHTML = 'REMOVE';
            nameCar.innerHTML = `${dataCarList[i]["name"]} ${dataCarList[i]["model"] || ''}`;
            colorCar.innerHTML = `
            
            <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                width="1280.000000pt" height="640.000000pt" viewBox="0 0 1280.000000 640.000000"
                preserveAspectRatio="xMidYMid meet">
                <metadata>
                Created by potrace 1.15, written by Peter Selinger 2001-2017
                </metadata>
                <g transform="translate(0.000000,640.000000) scale(0.100000,-0.100000)"
                fill="${dataCarList[i]["color"]}" stroke="none">
                <path d="M3565 5336 c-106 -30 -101 -26 -108 -111 -4 -42 -9 -80 -12 -85 -6
                -10 -246 -105 -590 -234 -448 -167 -1052 -415 -1173 -483 -78 -43 -193 -91
                -250 -104 -23 -5 -98 -14 -165 -19 -67 -6 -167 -19 -222 -30 -154 -31 -340
                -49 -563 -57 l-203 -6 -43 -66 c-59 -91 -60 -95 -26 -130 37 -37 38 -65 3
                -150 -25 -62 -27 -78 -31 -256 l-4 -190 -38 -32 c-91 -78 -133 -209 -134 -418
                0 -194 11 -396 26 -482 13 -71 14 -74 72 -122 69 -58 130 -129 158 -184 64
                -126 534 -211 1384 -250 l92 -4 -6 119 c-6 142 8 256 49 383 112 352 394 622
                756 722 90 26 112 28 278 28 165 0 188 -2 278 -27 201 -56 361 -152 504 -302
                140 -145 222 -293 274 -492 21 -79 24 -109 23 -279 -1 -127 -6 -214 -16 -263
                l-15 -73 3006 7 c1653 4 3007 8 3009 9 1 1 -8 37 -20 81 -19 67 -22 105 -22
                259 -1 166 1 187 27 279 117 421 467 736 885 797 119 17 325 7 432 -21 239
                -63 453 -205 601 -399 70 -92 154 -267 185 -386 24 -88 27 -119 27 -260 1
                -116 -4 -181 -16 -234 -10 -41 -16 -75 -15 -76 2 -1 62 2 133 6 266 16 458 45
                525 79 48 24 97 81 127 146 l24 52 -16 157 c-15 152 -15 163 4 284 63 388 50
                680 -35 802 -134 193 -526 336 -1429 519 -737 149 -1322 209 -2033 210 -228 0
                -226 0 -347 85 -187 131 -1045 607 -1471 815 -383 187 -788 281 -1439 332
                -208 17 -1106 16 -1400 0 -121 -7 -314 -19 -430 -27 -302 -22 -286 -22 -341
                10 -140 81 -187 94 -269 71z m1885 -333 c6 -37 38 -238 71 -446 32 -209 66
                -422 75 -474 9 -52 15 -96 13 -97 -11 -9 -1699 29 -1951 44 -206 13 -417 36
                -485 54 -98 26 -198 119 -249 231 -35 75 -36 172 -5 255 17 45 30 61 68 86 83
                54 135 80 253 127 341 136 858 230 1460 267 269 16 270 16 511 18 l227 2 12
                -67z m630 47 c264 -18 777 -110 1029 -186 186 -56 445 -188 756 -387 211 -134
                274 -181 250 -185 -75 -12 -133 -50 -162 -106 -19 -35 -21 -136 -4 -179 l11
                -27 -907 2 -906 3 -59 160 c-110 302 -298 878 -298 916 0 6 95 2 290 -11z"/>
                <path d="M2633 3125 c-223 -40 -410 -141 -568 -306 -132 -138 -213 -283 -262
                -467 -22 -83 -26 -119 -26 -247 -1 -169 10 -236 65 -382 87 -230 271 -436 493
                -551 85 -44 178 -78 271 -98 107 -23 312 -23 419 1 392 84 699 375 802 761 23
                86 26 120 27 254 1 158 -5 199 -46 330 -98 310 -355 567 -668 669 -150 50
                -354 64 -507 36z m350 -301 c249 -56 457 -247 543 -499 25 -72 28 -95 28 -220
                1 -153 -15 -228 -74 -345 -94 -186 -283 -337 -485 -386 -96 -24 -268 -24 -360
                0 -320 84 -544 355 -562 681 -20 359 209 673 558 765 94 24 253 26 352 4z"/>
                <path d="M2600 2697 c-36 -13 -85 -36 -109 -51 l-44 -28 116 -115 c81 -82 120
                -114 131 -110 14 6 16 29 16 167 0 186 6 178 -110 137z"/>
                <path d="M2920 2561 c0 -139 2 -162 16 -168 11 -4 50 28 130 108 l115 114 -28
                22 c-34 28 -138 70 -193 79 l-40 7 0 -162z"/>
                <path d="M2282 2448 c-28 -36 -92 -191 -92 -225 0 -10 34 -13 165 -13 151 0
                165 1 165 18 0 15 -206 232 -221 232 -4 0 -11 -6 -17 -12z"/>
                <path d="M3222 2351 c-62 -59 -112 -115 -112 -124 0 -15 17 -17 165 -17 131 0
                165 3 165 13 0 40 -69 205 -95 227 -7 6 -48 -27 -123 -99z"/>
                <path d="M2781 2332 c-12 -22 11 -62 34 -62 8 0 21 10 29 22 20 28 4 58 -29
                58 -13 0 -29 -8 -34 -18z"/>
                <path d="M2749 2161 c-32 -33 -37 -67 -14 -110 29 -57 104 -64 151 -14 53 57
                9 153 -71 153 -27 0 -44 -8 -66 -29z"/>
                <path d="M2570 2125 c-26 -32 13 -81 48 -59 24 16 27 45 6 61 -23 17 -39 16
                -54 -2z"/>
                <path d="M3006 2124 c-20 -19 -20 -38 -2 -54 23 -19 61 -8 64 18 7 44 -32 67
                -62 36z"/>
                <path d="M2190 1975 c0 -29 41 -140 72 -194 l31 -53 117 117 c71 71 116 123
                113 131 -4 11 -40 14 -169 14 -141 0 -164 -2 -164 -15z"/>
                <path d="M3110 1972 c0 -9 51 -68 114 -131 l114 -114 31 54 c30 51 71 165 71
                195 0 11 -31 14 -165 14 -151 0 -165 -1 -165 -18z"/>
                <path d="M2780 1901 c-7 -15 -5 -24 8 -41 32 -40 85 -4 62 41 -14 25 -56 25
                -70 0z"/>
                <path d="M2562 1697 c-61 -62 -112 -115 -112 -119 0 -18 208 -108 249 -108 7
                0 11 54 11 164 0 140 -2 165 -16 170 -9 3 -16 6 -17 6 -1 0 -53 -51 -115 -113z"/>
                <path d="M2933 1803 c-15 -6 -19 -333 -4 -333 46 0 251 88 251 108 0 9 -223
                232 -230 231 -3 0 -11 -3 -17 -6z"/>
                <path d="M10700 3119 c-390 -84 -696 -376 -797 -759 -31 -117 -41 -292 -24
                -411 33 -227 150 -453 318 -609 267 -250 643 -344 993 -249 117 32 283 118
                380 196 487 396 518 1128 67 1560 -97 93 -166 140 -290 198 -137 64 -235 86
                -407 91 -120 3 -162 0 -240 -17z m445 -313 c238 -81 409 -258 486 -506 30 -96
                33 -289 5 -388 -110 -400 -513 -637 -911 -536 -149 38 -313 147 -402 267 -176
                238 -203 533 -71 797 34 69 60 103 138 180 77 78 111 104 181 139 129 65 207
                81 364 77 109 -3 143 -7 210 -30z"/>
                <path d="M10703 2700 c-54 -19 -153 -71 -153 -80 0 -3 51 -57 114 -119 80 -80
                119 -112 130 -108 14 5 16 29 16 167 l0 160 -27 -1 c-16 0 -52 -9 -80 -19z"/>
                <path d="M11020 2561 c0 -139 2 -162 16 -168 22 -8 247 216 234 232 -17 20
                -163 84 -207 91 l-43 7 0 -162z"/>
                <path d="M10366 2424 c-29 -44 -76 -165 -76 -194 0 -19 7 -20 165 -20 126 0
                165 3 165 13 0 7 -51 63 -114 126 l-114 114 -26 -39z"/>
                <path d="M11313 2348 c-61 -62 -109 -119 -106 -125 6 -15 333 -19 333 -4 0 45
                -88 241 -108 241 -4 0 -57 -51 -119 -112z"/>
                <path d="M10882 2338 c-17 -17 -15 -32 7 -52 16 -14 23 -15 41 -6 31 17 24 64
                -10 68 -14 2 -31 -3 -38 -10z"/>
                <path d="M10846 2159 c-68 -81 17 -194 110 -144 89 48 56 175 -46 175 -30 0
                -44 -6 -64 -31z"/>
                <path d="M10670 2126 c-19 -23 -8 -61 18 -64 44 -7 67 32 36 62 -19 20 -38 20
                -54 2z"/>
                <path d="M11106 2127 c-21 -16 -18 -45 7 -61 37 -23 77 35 41 61 -10 7 -21 13
                -24 13 -3 0 -14 -6 -24 -13z"/>
                <path d="M10290 1970 c0 -29 43 -141 74 -195 l28 -48 116 116 c81 81 113 120
                109 131 -6 14 -29 16 -167 16 -152 0 -160 -1 -160 -20z"/>
                <path d="M11207 1978 c-3 -7 47 -66 111 -130 l116 -118 27 43 c27 44 79 177
                79 203 0 12 -28 14 -164 14 -122 0 -166 -3 -169 -12z"/>
                <path d="M10881 1901 c-14 -25 -5 -48 20 -56 27 -9 51 13 47 44 -4 34 -51 43
                -67 12z"/>
                <path d="M10662 1697 c-61 -62 -112 -115 -112 -119 0 -20 201 -108 247 -108
                10 0 13 34 13 164 0 140 -2 165 -16 170 -9 3 -16 6 -17 6 -1 0 -53 -51 -115
                -113z"/>
                <path d="M11033 1803 c-10 -3 -13 -47 -13 -169 0 -90 4 -164 8 -164 36 0 186
                61 239 98 16 10 -216 242 -234 235z"/>
                </g>
            </svg>
            
            
            
            `;
            finish.innerHTML = `
                <svg width="134" height="413" viewBox="0 0 134 413" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="0.5" y="0.5" width="133" height="412" fill="#333639"/>
                <rect x="0.5" y="0.5" width="133" height="412" stroke="black"/>
                <rect x="0.5" y="0.5" width="133" height="412" stroke="black" stroke-opacity="0.2"/>
                <rect x="0.5" y="0.5" width="133" height="412" stroke="black" stroke-opacity="0.2"/>
                <rect x="0.5" y="0.5" width="133" height="412" stroke="black" stroke-opacity="0.2"/>
                <rect x="6" y="7" width="61" height="57" fill="white"/>
                <rect x="67" y="64" width="61" height="57" fill="white"/>
                <rect x="6" y="121" width="61" height="57" fill="white"/>
                <rect x="67" y="178" width="61" height="57" fill="white"/>
                <rect x="6" y="235" width="61" height="57" fill="white"/>
                <rect x="67" y="292" width="61" height="57" fill="white"/>
                <rect x="6" y="349" width="61" height="57" fill="white"/>
                </svg>
            
            `

            btnA.dataset.id = dataCarList[i]["id"];
            btnB.dataset.id = dataCarList[i]["id"];
            select.dataset.id = dataCarList[i]["id"];
            remove.dataset.id = dataCarList[i]["id"];
            colorCar.dataset.car = dataCarList[i]["id"];

            carList.appendChild(carElem);
            carElem.appendChild(carContainer);
            carContainer.appendChild(btnA);
            carContainer.appendChild(btnB);
            carContainer.appendChild(nameCar);
            carElem.appendChild(colorCar);
            carElem.appendChild(carLine);
            carElem.appendChild(finish);
            carElem.appendChild(ghangeBtns);
            ghangeBtns.appendChild(select);
            ghangeBtns.appendChild(remove);
            }
        }

    }



    removeCar(event: Event){
        const target = event.target as HTMLElement;
        const id: string | undefined = target.dataset.id;
        console.log(id);
   }

   async generateNewCar(){
    function makeOneCar(){
        function randomInteger():number {
            const min = 0;
            const max = 12;
            const rand:number = min + Math.random() * (max - min);
            console.log(Math.round(rand));
            return Math.round(rand);
            
          }
        const list = {
            name: carNames[0][randomInteger()],
            model: carNames[1][randomInteger()],
            color: carNames[2][randomInteger()],
        }
            return list;
    }
        for(let i = 0; i < 100; i++){

    
            const car = makeOneCar();
    
            await fetch(`${baseUrl}/garage`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(car)
              });
    
              this.getCars()
        }
        const reset = document.querySelector('.reset') as HTMLButtonElement;
        const race = document.querySelector('.race') as HTMLButtonElement;
        reset.disabled = true;
        race.disabled = false;
        
   }




}

export const appCars: AppCars = new AppCars(
    {
        selector: 'app-content',
        template: `
        <div class="madeCar">
            <input class="create-text" type="text">
            <input class="create-color" type="color">
            <button class="made-create">CREATE</button>
        </div>
        <div class="changedCar">
            <input class="change-text" type="text" disabled>
            <input class="change-color" type="color" disabled>
            <button class="made-change" disabled>CHANGE</button>
        </div>
        <button class="race">RACE</button>
        <button class="reset" disabled>RESET</button>
        <button class="generate">GENERATE NEW CAR</button>
        <h1 class="car-header"></h1>
        <h2 class="car-page"></h2>
        <div class="car-list"></div>
        <button class="prev-car">Prev</button>
        <button class="next-car">Next</button>
        <p class="wincar"></p>
        `
    }
)