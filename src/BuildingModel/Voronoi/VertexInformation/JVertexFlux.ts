import { getArrayOfN } from "../../Math/basicMathFunctions";
import { TypeInformationKey } from "../../TypeInformationKey";
import JVertex from "../JVertex";
import JVertexGeneric, { IJVertexGenericInfo } from "./JVertexGeneric";

export interface IJVertexFluxInfo extends IJVertexGenericInfo {
	id: string;

	fluxMonth: number[];
	fluxRouteIds: number[];
	riverIds: number[];
  navLevelMonth: number[];
}

export interface IMaxFluxValues {
  annualMaxFlux: number;
  monthMaxFlux: number[];
}

export default class JVertexFlux extends JVertexGeneric {

	private _fluxMonth: number[];
	private _fluxRouteIds: number[] = [];
	private _riverIds: number[] = [];
  private _navLevelMonth: number[] = [];

	constructor(vertex: JVertex, info: IJVertexFluxInfo) {
		super(vertex)
		this._fluxMonth = [...info.fluxMonth];
		this._fluxRouteIds = [...info.fluxRouteIds];
    this._navLevelMonth = [...info.navLevelMonth];

		if (info.riverIds.length > 3) throw new Error(``)
		this._riverIds = [...info.riverIds];
	}

	get annualFlux(): number { return this._fluxMonth.reduce((p: number, c: number) => c + p, 0) }
	get monthFlux(): number[] { return this._fluxMonth }
	get minFlux(): number { return Math.min(...this._fluxMonth) }

  get navLevelMonth(): number[] { return this._navLevelMonth }
  get minNavLevel(): number { return Math.min(...this._navLevelMonth) }

	get riverIds(): number[] { return this._riverIds }
	get fluxRouteIds(): number[] { return this._fluxRouteIds }

	getInterface(): IJVertexFluxInfo {
		return {
			...super.getInterface(),
			fluxMonth: [...this._fluxMonth],
			fluxRouteIds: this._fluxRouteIds,
			riverIds: this._riverIds,
      navLevelMonth: this._navLevelMonth
		}
	}

  private static _maxFluxValues: IMaxFluxValues = {annualMaxFlux: 0, monthMaxFlux: getArrayOfN(12,0)};
  static set maxFluxValues(mfv: IMaxFluxValues) {this._maxFluxValues = mfv}
  static get maxFluxValues(): IMaxFluxValues {return this._maxFluxValues }

	static getTypeInformationKey(): TypeInformationKey {
		return 'vertexFlux';
	}
}