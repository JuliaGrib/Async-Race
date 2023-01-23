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