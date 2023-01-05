import { createNoise2D, NoiseFunction2D } from "simplex-noise";
import { inRange } from "../BuildingModel/Math/basicMathFunctions";
import RandomNumberGenerator from "../BuildingModel/Math/RandomNumberGenerator";
import JCell from "../BuildingModel/Voronoi/JCell";
import JVertexFlux from "../BuildingModel/Voronoi/VertexInformation/JVertexFlux";
import JDiagram from "../BuildingModel/Voronoi/JDiagram";
import MapController from "../MapController";

export interface INoiseFunctionEntry {
  harmonics: number;
  fundamental: number;
  noiseExponent: number;
  genExponent: number;
  hExponent: number;
  hMin: number;
  fluxExponent: number;
  fluxNegative: boolean;
}

export type TNoiseFunction = (cell: JCell) => number;

export default class NoiseMapValuesGenerator {
  private _seedGen: (N: number) => number;
  private _diagram: JDiagram;

  static _instance: NoiseMapValuesGenerator;
  private static get instance(): NoiseMapValuesGenerator {
    if (!this._instance)
      this._instance = new NoiseMapValuesGenerator(RandomNumberGenerator.makeRandomInt(16), MapController.instance.naturalMap.diagram);
    return this._instance;
  }

  private constructor(seedGen: (N: number) => number, d: JDiagram) {
    this._seedGen = seedGen;
    this._diagram = d;
  }

  generateNewFunction(nfe: INoiseFunctionEntry): (cell: JCell) => number {
    const noiseFunc = this.create();

    const h = nfe.harmonics;
    const f = nfe.fundamental;
    const ne = nfe.noiseExponent;
    const ge = nfe.genExponent;
    const he = nfe.hExponent;
    const hm = nfe.hMin;
    const fe = nfe.fluxExponent;
    const fn = nfe.fluxNegative;
    return (c: JCell) => {
      if (c.info.height < hm) return 0;
      let out = 0;
      let sum = 0;
      for (let i = 0; i < h; i++) {
        const param = 2 ** i;
        out += 1 / param * this.evalNoiseFunc(noiseFunc, c, param * f);
        sum += 1 / param;
      }

      out = (out / sum) ** ne;
      out *= ((c.info.height - hm) / (1 - hm)) ** he;

      out *= (fn ? (1 - this.annualFluxCell(c)) : this.annualFluxCell(c)) ** fe;
      out = out ** ge;
      return Math.round(out * 10000) / 10000;
    }
  }

  private evalNoiseFunc(func: (x: number, y: number) => number, c: JCell, scale: number): number {
    const xdist = (1 - Math.abs(c.center.x / 180));
    const ydist = (1 - Math.abs(c.center.y / 90));
    const xmask = inRange((xdist / (1 - 80 / 180)) ** 0.1, 0, 1);
    const ymask = inRange((ydist / (1 - 40 / 90)) ** 0.1, 0, 1);
    const XDIV = 180 / scale;
    const YDIV = 90 / scale;
    return /*xmask * ymask */ (func(c.center.x / XDIV, c.center.y / YDIV) + 1) / 2;
  }

  private create(): NoiseFunction2D {
    const seed = this._seedGen(18000);
    console.log('seed:', seed)
    return createNoise2D(RandomNumberGenerator.makeRandomFloat(seed));
  }
  private annualFluxCell(cell: JCell): number {
    if (cell.info.heightType !== 'land') return 0;
    const vasso = this._diagram.getVerticesAssociated(cell);
    const arr = vasso.map(v =>
      (v.info.vertexFlux.annualFlux / JVertexFlux.annualMaxFlux) ** (1 / 3)
    );
    return Math.max(...arr);
  }


  /******************** */
  private static  _fertFunc: TNoiseFunction;
  static get fertFunc(): TNoiseFunction {
    if (!this._fertFunc) {
      const nvg = this.instance;
      const fert1 = nvg.generateNewFunction(fertEntry);
      const fert2 = nvg.generateNewFunction(fertEntry2);
  
      this._fertFunc = (cell: JCell) => {
        return inRange(fert1(cell) * 0.7 + 0.45 * fert2(cell), 0, 1);
      }
    }
    return this._fertFunc;
  }

  private static  _fishLevelNoiseFunc: TNoiseFunction;
  static get fishLevelNoiseFunc(): TNoiseFunction {
    if (!this._fishLevelNoiseFunc) {
      const nvg = this.instance;
      const marineF = nvg.generateNewFunction(seaFishingEntry);
      this._fishLevelNoiseFunc = (cell: JCell) => {
        return inRange(marineF(cell), 0, 1)
      }
    }

    return this._fishLevelNoiseFunc
  }
}

const fertEntry: INoiseFunctionEntry = {
  fundamental: 6,
  harmonics: 6,
  noiseExponent: 1,

  genExponent: 0.22,

  hExponent: 0.0,
  hMin: 0.2,

  fluxExponent: 0,
  fluxNegative: false,
}

const fertEntry2: INoiseFunctionEntry = {
  fundamental: 3,
  harmonics: 6,
  noiseExponent: 2,

  genExponent: 1.8,

  hExponent: 0.0,
  hMin: 0.2,

  fluxExponent: 0,
  fluxNegative: false,
}

const seaFishingEntry: INoiseFunctionEntry = {
  fundamental: 6,
  harmonics: 6,
  noiseExponent: 1,

  genExponent: 0.22,

  hExponent: 0.0,
  hMin: 0.0,

  fluxExponent: 0,
  fluxNegative: false,
}

const matCons: INoiseFunctionEntry = {
  fundamental: 3,
  harmonics: 6,
  noiseExponent: 1.2,

  genExponent: 0.86,

  hExponent: 0.37,
  hMin: 0.33,

  fluxExponent: 0,
  fluxNegative: false,
}

const matLux1: INoiseFunctionEntry = {
  fundamental: 7,
  harmonics: 3,
  noiseExponent: 1.5,

  genExponent: 2,

  hExponent: 0.1,
  hMin: 0.71,

  fluxExponent: 0,
  fluxNegative: false,
}

const matLux2: INoiseFunctionEntry = {
  fundamental: 6,
  harmonics: 6,
  noiseExponent: 2,

  genExponent: 1.4,

  hExponent: 0.1,
  hMin: 0.4,

  fluxExponent: 0.1,
  fluxNegative: false,
}

const auxEntry: INoiseFunctionEntry = {
  fundamental: 6,
  harmonics: 6,
  noiseExponent: 2,

  genExponent: 1.4,

  hExponent: 0.1,
  hMin: 0.4,

  fluxExponent: 0.1,
  fluxNegative: false,
}