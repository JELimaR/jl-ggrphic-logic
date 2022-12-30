import { createNoise2D, NoiseFunction2D } from "simplex-noise";
import { inRange } from "../BuildingModel/Math/basicMathFunctions";
import RandomNumberGenerator from "../BuildingModel/Math/RandomNumberGenerator";
import JCell from "../BuildingModel/Voronoi/JCell";
import { annualFluxCell } from '../temporalAuxFunctions';
import JVertexFlux from "../BuildingModel/Voronoi/VertexInformation/JVertexFlux";

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

export default class NoiseMapValuesGenerator {
  private _seedGen: (N: number) => number;
  constructor(seedGen: (N: number) => number) {
    this._seedGen = seedGen;
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

      out *= (fn ? (1 - annualFluxCell(c)) : annualFluxCell(c)) ** fe;
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
}