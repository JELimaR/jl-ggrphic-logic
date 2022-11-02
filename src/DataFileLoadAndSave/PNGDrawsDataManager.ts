import * as fs from 'fs';
// import Jimp from 'jimp';


export default class PNGDrawsDataManager {
  static _instance: PNGDrawsDataManager;

  private _dirPath = '';

  private constructor() { /** */ }

  static get instance(): PNGDrawsDataManager {
    if (!this._instance) {
      this._instance = new PNGDrawsDataManager();
    }
    return this._instance;
  }

  static configPath(path: string): void {
    this.instance._dirPath = path;
    fs.mkdirSync(this.instance._dirPath, { recursive: true });
  }

  // height drawing
  // readHeight(): Jimp {
  //   const type = 'image/png'
  //   const buffer = fs.readFileSync(this._dirPath + `/h.png`);
  //   const imageData = Jimp.decoders[type](buffer);
  //   return new Jimp(imageData);
  // }

  // readHeight2(): Jimp {
  //   const type = 'image/png'
  //   const buffer = fs.readFileSync(this._dirPath + `/hazgaar.png`);
  //   const imageData = Jimp.decoders[type](buffer);
  //   return new Jimp(imageData);
  // }

}