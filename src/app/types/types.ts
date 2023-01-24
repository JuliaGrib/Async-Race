const baseUrl = 'http://127.0.0.1:3000';

export interface IConfigComponent {
    selector: string,
    template: string,
    el?: Element | null
  }

  export interface WinnerCarElem {
    id: number,
    time: number,
    wins: number,
  }

  export interface paramMove {
    velocity: number,
    distance: number,
  }

  export const winCar =  async (id: string | null | undefined): Promise<void> => {
    const body = document.querySelector('body') as HTMLBodyElement;
    body.style.background = `url(https://i.gifer.com/6SSp.gif)`;
    body.style.backgroundRepeat = 'no-repeat';
    body.style.backgroundSize = 'cover';
    const p = document.querySelector('.wincar') as HTMLParagraphElement;
    const response = await fetch(`${baseUrl}/garage?id=${id}`);
    const dataCar = await response.json();
    p.innerHTML = `Win ${dataCar[0]["name"]} ${dataCar[0]["model"] || ''} `;
  }