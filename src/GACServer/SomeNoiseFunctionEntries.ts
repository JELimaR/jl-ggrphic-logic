import { inRange } from "../BuildingModel/Math/basicMathFunctions"
import RandomNumberGenerator from "../BuildingModel/Math/RandomNumberGenerator"
import JCell from "../BuildingModel/Voronoi/JCell"
import NoiseMapValuesGenerator, { INoiseFunctionEntry } from "./NoiseMapValuesGenerator"

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


const nvg = new NoiseMapValuesGenerator(RandomNumberGenerator.makeRandomInt(16));
const fert1 = nvg.generateNewFunction(fertEntry);
const fert2 = nvg.generateNewFunction(fertEntry2);

export const fertFunc = (cell: JCell) => {
  return inRange(fert1(cell) * 0.7 + 0.45 * fert2(cell),0,1);
}