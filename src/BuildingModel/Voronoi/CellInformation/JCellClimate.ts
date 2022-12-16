/* eslint-disable no-case-declarations */
/* eslint-disable no-irregular-whitespace */
import { getArrayOfN, inRange, number2Precition } from "../../Math/basicMathFunctions";
import { TypeInformationKey } from "../../TypeInformationKey";
import JCell from "../JCell";
import JCellGeneric, { IJCellGenericInfo } from "./JCellGeneric";

/**
 * A: Af, As, Aw Am
 * B: BWh, BWk, BSh, BSk
 * C: Cfa, Cfb, Cfc, Cwa, Cwb, Cwc, Csa, Csb, Csc
 * D: Dfa, Dfb, Dfc, Dfd, Dwa, Dwb, Dwc, Dwd, Dsa, Dsb, Dsc, Dsd
 * E: ET, EF
 */
export type TKoppenType = 'A' | 'B' | 'C' | 'D' | 'E';
export type TKoppenTypeObject<T> = { [key in TKoppenType]: T }
export type TKoppenSubType =
  | 'Af' | 'AwAs' | 'Am'
  | 'BWh' | 'BWk' | 'BSh' | 'BSk'
  | 'Cfa' | 'Cfb' | 'Cfc' | 'Cwa' | 'Cwb' | 'Cwc' | 'Csa' | 'Csb' | 'Csc'
  | 'Dfa' | 'Dfb' | 'Dfc' | 'Dfd' | 'Dwa' | 'Dwb' | 'Dwc' | 'Dwd' | 'Dsa' | 'Dsb' | 'Dsc' | 'Dsd'
  | 'ET' | 'EF';
export type TKoppenSubTypeObject<T> = { [key in TKoppenSubType]: T }

export const koppenColors: TKoppenSubTypeObject<string> = {
  Af: '#0000FF', Am: '#0077FF', AwAs: '#46A9FA',
  BWh: '#FF0000', BWk: '#FF9695', BSh: '#F5A301', BSk: '#FFDB63',
  Csa: '#FFFF00', Csb: '#C6C700', Csc: '#969600',
  Cwa: '#96FF96', Cwb: '#63C764', Cwc: '#329633',
  Cfa: '#C6FF4E', Cfb: '#66FF33', Cfc: '#33C701',
  Dsa: '#FF00FF', Dsb: '#C600C7', Dsc: '#963295', Dsd: '#966495',
  Dwa: '#ABB1FF', Dwb: '#5A77DB', Dwc: '#4C51B5', Dwd: '#320087',
  Dfa: '#00FFFF', Dfb: '#38C7FF', Dfc: '#007E7D', Dfd: '#00455E',
  ET: '#B2B2B2', EF: '#686868',
}

export interface IJCellClimateInfo extends IJCellGenericInfo {
  id: number;
  tempMonth: number[];
  precipMonth: number[];
}

export interface IMaxPrecipValues {
  annual: number;
  monthly: number[];
}

export default class JCellClimate extends JCellGeneric {
  private _tempMonth: number[];
  private _precipMonth: number[];
  constructor(cell: JCell, info: IJCellClimateInfo) {
    super(cell);
    this._tempMonth = info.tempMonth.map((t: number) => number2Precition(t));
    this._precipMonth = info.precipMonth.map((p: number) => number2Precition(p));
  }

  get tempMonth(): number[] { return this._tempMonth }
  get precipMonth(): number[] { return this._precipMonth }

  // temp
  get tempMonthMin(): number { return Math.min(...this._tempMonth) }
  get tempMonthMax(): number { return Math.max(...this._tempMonth) }
  get tempMed(): number { return this._tempMonth.reduce((p: number, c: number) => c + p, 0) / 12 }

  get tempMedAnnualVar(): number { return Math.abs(this.tempMonthMax - this.tempMonthMin) }
  get DTarr(): number[] {
    const precipFactor = this.precipMonth.map((p: number) => (1-inRange(12*p/this.pumbral,0,1)) ** 3);
    const heightFactor = inRange((this.cell.info.height - 0.2)/0.8, 0, 1) ** 3;
    const DTFactor = precipFactor.map((pf: number) => 1.0 * (0.8 * pf + 0.2 * heightFactor) + 1.0025);
    let out = DTFactor.map((dtf: number) => 0.28 * this.tempMedAnnualVar * dtf + 2);
    out.forEach((v: number, i:number) => {
      const prev = i === 0 ? 11 : i-1;
      const next = i === 11 ? 0 : i+1;
      out[i] = 0.5 * v + 0.25 * (out[next] + out[prev])
    })
    return out;
  }
  get tempMinArr(): number[] {
    const DT = this.DTarr;
    return this.tempMonth.map((t: number, i: number) => t - DT[i]);
  }
  get tempMaxArr(): number[] {
    const DT = this.DTarr;
    return this.tempMonth.map((t: number, i: number) => t + DT[i]);
  }
  get tempMin(): number { return Math.min(...this.tempMinArr) }
  get tempMax(): number { return Math.max(...this.tempMaxArr) }

  // precip
  get mediaPrecip(): number { return this.annualPrecip / 12 }

  get precipSemCalido(): number {
    let out = 0;
    for (const m of this.getMonthsSet().calido) {
      out += this._precipMonth[m - 1];
    }
    return out;
  }
  get precipSemFrio(): number {
    let out = 0;
    for (const m of this.getMonthsSet().frio) {
      out += this._precipMonth[m - 1];
    }
    return out;
  }

  /**
   * Pumbral = 20 * T + 280		si el 70 % o más de las precipitaciones anuales caen en el semestre más 	cálido;
   * Pumbral = 20 * T + 140   si el 70 % o más de las precipitaciones anuales caen en un lapso que abarca 	ambos semestres;
   * Pumbral = 20 * T         si menos del 30 % de las precipitaciones anuales caen en el semestre 	más cálido;
   */
  get pumbral(): number {
    let constante: number;
    if (this.precipSemCalido >= 0.7 * this.mediaPrecip) constante = 280;
    else if (this.precipSemCalido < 0.3 * this.mediaPrecip) constante = 0;
    else constante = 140;

    let out = (20 * this.tempMed + constante);
    return out <= .1 ? .1 : out;
  }

  getMonthsSet(): { calido: number[], frio: number[] } {
    return {
      calido: (this.cell.center.y < 0) ? [1, 2, 3, 4, 11, 12] : [5, 6, 7, 8, 9, 10],
      frio: (this.cell.center.y < 0) ? [5, 6, 7, 8, 9, 10] : [1, 2, 3, 4, 11, 12]
    }
  }

  getInterface(): IJCellClimateInfo {
    return {
      ...super.getInterface(),
      tempMonth: this._tempMonth,
      precipMonth: this._precipMonth
    }
  }

  /**
   * El lugar tiene un clima seco, B, cuando la precipitación anual P es menor que el umbral de precipitación: P < Pumbral.
   * Si no es el caso B, entonces se determina si es un caso A, C, D o E según la relación entre Tmín y Tmáx:
   * A	si Tmín > 18;
   * C	si Tmáx > 10 y 18 > Tmín > 0;
   * D	si Tmáx > 10 y Tmín < 0;
   * E	si Tmáx < 10.
   */
  koppenType(): TKoppenType | 'O' {
    if (!this.cell.info.isLand) return 'O';
    if (this.tempMonthMax < 10) return 'E'; // este no es el primero
    else if (this.annualPrecip < 1.0 * this.pumbral) return 'B'; //if (this.annualPrecip < 1.2 * this.pumbral) return 'B';
    else if (this.tempMonthMin > 18) return 'A';
    else if (this.tempMonthMax >= 10 && this.tempMonthMin > 0) return 'C'
    else if (this.tempMonthMax < 10) return 'E';
    else return 'D'
  }

  /**
   * Determinación de los subtipos de clima
     Para la determinación de los subtipos de clima en un lugar son necesarios los siguientes datos adicionales a los anteriores:
       Tmon10 número de meses en que la temperatura media es mayor que 10°C;
       Pseco precipitaciones durante el mes más seco del año;
       Psseco precipitaciones durante el mes más seco del verano;
       Pwseco precipitaciones durante el mes más seco del invierno;
       Pshum precipitaciones durante el mes más húmedo del verano;
       Pwhum precipitaciones durante el mes más húmedo del invierno;
   */
  get tmon10(): number {
    let out = 0;
    this._tempMonth.forEach((t: number) => out += t > 10 ? 1 : 0)
    return out;
  }
  get pseco(): number { return Math.min(...this._precipMonth) }
  get psseco(): number {
    let min = 900000;
    for (const m of this.getMonthsSet().calido) {
      if (min > this._precipMonth[m - 1]) min = this._precipMonth[m - 1];
    }
    return min
  }
  get pwseco(): number {
    let min = 900000;
    for (const m of this.getMonthsSet().frio) {
      if (min > this._precipMonth[m - 1]) min = this._precipMonth[m - 1];
    }
    return min
  }
  get pshum(): number {
    let max = 0;
    for (const m of this.getMonthsSet().calido) {
      if (max < this._precipMonth[m - 1]) max = this._precipMonth[m - 1];
    }
    return max
  }
  get pwhum(): number {
    let max = 0;
    for (const m of this.getMonthsSet().frio) {
      if (max < this._precipMonth[m - 1]) max = this._precipMonth[m - 1];
    }
    return max
  }

  koppenSubType(): TKoppenSubType | 'O' {
    if (!this.cell.info.isLand) return 'O';

    switch (this.koppenType()) {
      // A
      case 'A':
        if (this.pseco > 60) return 'Af'
        if (this.pseco >= 200 - this.annualPrecip / 25) return 'Am'//100 - this.annualPrecip/25 return 'Am'
        return 'AwAs';
      // B
      case 'B':
        if (this.annualPrecip < 0.5 * this.pumbral) { //(this.mediaPrecip < .5 * this.pumbral) {
          if (this.tempMed >= 16) return 'BWh' //if (this.tmed >= 18) return 'BWh'
          else return 'BWk'
        } else {
          if (this.tempMed >= 16) return 'BSh'// if (this.tmed >= 18) return 'BSh'
          else return 'BSk'
        }
      // C
      case 'C':
        let tfc: 'a' | 'b' | 'c';
        if (this.tempMonthMax >= 22) tfc = 'a';
        else if (this.tmon10 >= 4) tfc = 'b';
        else tfc = 'c';
        if (this.psseco < 40 && this.psseco < this.pwhum / 3) return 'Cs' + tfc as TKoppenSubType;
        if (this.pwseco < this.pshum / 10) return 'Cw' + tfc as TKoppenSubType;
        return 'Cf' + tfc as TKoppenSubType;
      // D
      case 'D':
        let tfd: 'a' | 'b' | 'c' | 'd';
        if (this.tempMonthMax >= 22) tfd = 'a';
        else if (this.tmon10 >= 4) tfd = 'b';
        else if (this.tempMonthMin < -25) tfd = 'd';  //( this.tmin < -38 ? 'd' : 'c'));
        else tfd = 'c';
        if (this.psseco < 40 && this.psseco < this.pwhum / 3) return 'Ds' + tfd as TKoppenSubType;
        if (this.pwseco < this.pshum / 10) return 'Dw' + tfd as TKoppenSubType;
        return 'Df' + tfd as TKoppenSubType;
      // E
      default:
        if (this.tempMonthMax > 0) return 'ET'
        return 'EF'
    }

  }

  // calculo de holdridge life zone
  get bioTemperature(): number {
    let out = 0;
    this._tempMonth.forEach((t: number) => {
      let temp = (t < 0) ? 0 : t;
      if (temp > 24)
        temp = temp - 3 * this.cell.center.y / 100 * ((t - 24) ** 2);
      out += inRange(temp / 12, 0, 24);
    })
    return out;
  }
  get annualPrecip(): number {
    return this._precipMonth.reduce((p: number, c: number) => c + p, 0);
  }
  get potentialEvapotrasnpirationRate(): number {
    return (this.bioTemperature * 70) / this.annualPrecip;
  }

  get altitudinalBelt(): TAltitudinalBelt {
    const BT = this.bioTemperature;
    if (BT < 1.5) return 'Alvar'
    if (BT < 3) return 'Alpine'
    if (BT < 6) return 'Subalpine'
    if (BT < 12) return 'Montane'
    if (BT < 18) return 'LowerMontane'
    if (BT < 24) return 'Premontane'
    else return 'Basal'
  }

  get humidityProvince(): THumidityProvinces {
    const AP = this.annualPrecip;
    /*
    if (AP < 125) return 'SuperArid'
    if (AP < 250) return 'Perarid'
    if (AP < 500) return 'Arid'
    if (AP < 1000) return 'SemiArid'
    if (AP < 2000) return 'Subhumid'
    if (AP < 4000) return 'humid'
    if (AP < 8000) return 'Perhumid'
    else return 'SuperHumid'
    */

    if (AP < 125) return 'SuperArid'
    if (AP < 250) return 'Perarid'
    if (AP < 500) return 'Arid'
    if (AP < 1000) return 'SemiArid'
    if (AP < 1800) return 'Subhumid'
    if (AP < 3600) return 'humid'
    if (AP < 6000) return 'Perhumid'
    else return 'SuperHumid'

    /*
    const PET = this.potentialEvapotrasnpirationRate;
    if (PET > 16) return 'SuperArid'
    if (PET > 8) return 'Perarid'
    if (PET > 4) return 'Arid'
    if (PET > 2) return 'SemiArid'
    if (PET > 1) return 'Subhumid'
    if (PET > 0.5) return 'humid'
    if (PET > 0.25) return 'Perhumid'
    else return 'SuperHumid'
    */
  }

  get lifeZone(): ILifeZone {
    const AB = this.altitudinalBelt;
    const HP = this.humidityProvince;
    let maxHPIdx: number;
    let minABIdx: number;

    switch (AB) {
      case 'Alvar':
        maxHPIdx = 0
        minABIdx = 1
        break;
      case 'Alpine':
        maxHPIdx = 3
        minABIdx = 2
        break;
      case 'Subalpine':
        maxHPIdx = 4
        minABIdx = 6
        break;
      case 'Montane':
        maxHPIdx = 5
        minABIdx = 11
        break;
      case 'LowerMontane':
        maxHPIdx = 6
        minABIdx = 17
        break;
      case 'Premontane':
        maxHPIdx = 6
        minABIdx = 24
        break;
      case 'Basal': default:
        maxHPIdx = 7
        minABIdx = 31
        break;
    }

    const id = minABIdx + inRange(humidityProvinceToNumber[HP], 0, maxHPIdx) as keyof typeof lifeZonesList;

    return lifeZonesList[id];
  }

  // statics
  private static _maxPrecipValues: IMaxPrecipValues = {
    annual: -1,
    monthly: getArrayOfN(12, 0)
  }

  static set maxPrecipValues(mpv: IMaxPrecipValues) { this._maxPrecipValues = mpv }
  static get maxAnnualPrecip(): number { return this._maxPrecipValues.annual }
  static get maxMonthlyPrecip(): number[] { return this._maxPrecipValues.monthly }

  static getTypeInformationKey(): TypeInformationKey {
    return 'cellClimate';
  }
}
/*
Polar (glacial)	0 a 1,5 ºC	Nival
Subpolar (tundra)	1,5 a 3 ºC	Alpino
Boreal	3 a 6 ºC	Subalpino
Templado frío	6 a 12 ºC	Montano
Templado cálido	12 a 18 ºC	Montano bajo
Subtropical	18 a 24 ºC	Premontano
Tropical	mayor de 24 ºC	Basal
*/
export type TAltitudinalBelt =
  | 'Alvar'
  | 'Alpine'
  | 'Subalpine'
  | 'Montane'
  | 'LowerMontane'
  | 'Premontane'
  | 'Basal'

export const altitudinalBeltToNumber = {
  'Alvar': 0,
  'Alpine': 1,
  'Subalpine': 2,
  'Montane': 3,
  'LowerMontane': 4,
  'Premontane': 5,
  'Basal': 6
}

export type THumidityProvinces =
  | 'SuperArid'
  | 'Perarid'
  | 'Arid'
  | 'SemiArid'
  | 'Subhumid'
  | 'humid'
  | 'Perhumid'
  | 'SuperHumid'

export const humidityProvinceToNumber = {
  'SuperArid': 0,
  'Perarid': 1,
  'Arid': 2,
  'SemiArid': 3,
  'Subhumid': 4,
  'humid': 5,
  'Perhumid': 6,
  'SuperHumid': 7
}

export interface ILifeZone { id: number, desc: string, desc2: string, color: string }
export type TypeLifeZoneKey =
  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20
  | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30
  | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38;

export type TLifeZoneObject<T> = { [key in TypeLifeZoneKey]: T }

export const lifeZonesList: TLifeZoneObject<ILifeZone> = {
  1: { id: 1, desc: 'Desierto polar', desc2: 'Polar desert', color: '#FFFFFF' },
  2: { id: 2, desc: 'Tundra seca', desc2: 'Subpolar dry tundra', color: '#808080' },
  3: { id: 3, desc: 'Tundra húmeda', desc2: 'Subpolar moist tundra', color: '#608080' },
  4: { id: 4, desc: 'Tundra muy húmeda', desc2: 'Subpolar wet tundra', color: '#408090' },
  5: { id: 5, desc: 'Tundra pluvial', desc2: 'Subpolar rain tundra', color: '#2080C0' },
  6: { id: 6, desc: 'Desierto boreal', desc2: 'Boreal desert', color: '#A0A080' },
  7: { id: 7, desc: 'Matorral boreal seco', desc2: 'Boreal dry scrub', color: '#80A080' },
  8: { id: 8, desc: 'Bosque boreal húmedo', desc2: 'Boreal moist forest', color: '#60A080' },
  9: { id: 9, desc: 'Bosque boreal muy húmedo', desc2: 'Boreal wet forest', color: '#40A090' },
  10: { id: 10, desc: 'Bosque boreal pluvial', desc2: 'Boreal rain forest', color: '#20A0C0' },
  11: { id: 11, desc: 'Desierto templado frío', desc2: 'Cool temperate desert', color: '#C0C080' },
  12: { id: 12, desc: 'Matorral templado frío', desc2: 'Cool temperate desert scrub', color: '#A0C080' },
  13: { id: 13, desc: 'Estepa templada fría', desc2: 'Cool temperate steppe', color: '#80C080' },
  14: { id: 14, desc: 'Bosque húmedo templado frío', desc2: 'Cool temperate moist forest', color: '#60C080' },
  15: { id: 15, desc: 'Bosque muy húmedo templado frío', desc2: 'Cool temperate wet forest', color: '#40C090' },
  16: { id: 16, desc: 'Bosque pluvial templado frío', desc2: 'Cool temperate rain forest', color: '#20C0C0' },
  17: { id: 17, desc: 'Desierto templado cálido', desc2: 'Warm temperate desert', color: '#E0E080' },
  18: { id: 18, desc: 'Matorral xerófilo templado cálido', desc2: 'Warm temperate desert scrub', color: '#C0E080' },
  19: { id: 19, desc: 'Matorral espinoso templado cálido', desc2: 'Warm temperate thorn scrub', color: '#A0E080' },
  20: { id: 20, desc: 'Bosque seco templado cálido', desc2: 'Warm temperate dry forest', color: '#80E080' },
  21: { id: 21, desc: 'Bosque húmedo templado cálido', desc2: 'Warm temperate moist forest', color: '#60E080' },
  22: { id: 22, desc: 'Bosque muy húmedo templado cálido', desc2: 'Warm temperate wet forest', color: '#40E090' },
  23: { id: 23, desc: 'Bosque pluvial templado cálido', desc2: 'Warm temperate rain forest', color: '#20E0C0' },
  24: { id: 24, desc: 'Desierto subtropical', desc2: 'Subtropical desert', color: '#E0E080' },
  25: { id: 25, desc: 'Matorral xerófilo subtropical', desc2: 'Subtropical desert scrub', color: '#C0E080' },
  26: { id: 26, desc: 'Floresta espinosa subtropical', desc2: 'Subtropical thorn woodland', color: '#A0E080' },
  27: { id: 27, desc: 'Bosque seco subtropical', desc2: 'Subtropical dry forest', color: '#80E080' },
  28: { id: 28, desc: 'Selva húmeda subtropical', desc2: 'Subtropical moist forest', color: '#60E080' },
  29: { id: 29, desc: 'Selva muy húmeda subtropical', desc2: 'Subtropical wet forest', color: '#40E090' },
  30: { id: 30, desc: 'Selva pluvial subtropical', desc2: 'Subtropical rain forest', color: '#20E0C0' },
  31: { id: 31, desc: 'Desierto tropical', desc2: 'Tropical desert', color: '#FFFF80' },
  32: { id: 32, desc: 'Matorral xerófilo tropical', desc2: 'Tropical desert scrub', color: '#E0FF80' },
  33: { id: 33, desc: 'Floresta espinosa tropical', desc2: 'Tropical thorn woodland', color: '#C0FF80' },
  34: { id: 34, desc: 'Bosque muy seco tropical', desc2: 'Tropical very dry forest', color: '#A0FF80' },
  35: { id: 35, desc: 'Bosque seco tropical', desc2: 'Tropical dry forest', color: '#80FF80' },
  36: { id: 36, desc: 'Selva húmeda tropical', desc2: 'Tropical moist forest', color: '#60FF80' },
  37: { id: 37, desc: 'Selva muy húmeda tropical', desc2: 'Tropical wet forest', color: '#40FF80' },
  38: { id: 38, desc: 'Selva pluvial tropical', desc2: 'Tropical rain forest', color: '#20FFA0' },
}

/**
 * mas colores
    SORCHED				#999999
    BARE				#BBBBBB
    TUNDRA				#DDDDBB
    SNOW				#F8F8F8
    TAIGA				#CCD4BB
    SHRUBLAND			#C4CCBB
    TEMPERATE DESERT		#E4E8CA
    TEMPERATE RAIN FOREST		#A4C4A8
    TEMPERATE DECIDUOUS FOREST	#B4C9A9
    GRASSLAND			#C4D4AA
    TEMPERATE DESERT		#E4E8CA
    TROPICAL RAIN FOREST		#9CBBA9
    TROPICAL SEASONAL FOREST	#A9CCA4
    GRASSLAND			#C4D4AA
    SUBTROPICAL DESERT		#E9DDC7
 */