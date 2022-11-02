import JDiagram from './Voronoi/JDiagram';
import IslandMap from './MapContainerElements/Natural/IslandMap';
import RiverMap from './MapContainerElements/Natural/RiverMap';
import FluxRouteMap from './MapContainerElements/Natural/FluxRouteMap';
import INaturalMapCreator, { IRiverMapGeneratorOut } from './INaturalMapCreator';
import LakeMap from './MapContainerElements/Natural/LakeMap';

export default class NaturalMap {

	private _diagram: JDiagram;
	private _creator: INaturalMapCreator;

	// map elements estos elementos son generados despues y no en el constructor
	private _islands: IslandMap[] = [];
	private _lakes: LakeMap[] = [];
	private _fluxRoutes: Map<number, FluxRouteMap> = new Map<number, FluxRouteMap>();
	private _rivers: Map<number, RiverMap> = new Map<number, RiverMap>();

	constructor(AREA: number, nwmc: INaturalMapCreator) {
		this._creator = nwmc;
		this._diagram = this._creator.generateVoronoiDiagramInfo(AREA)
	}

	get diagram(): JDiagram { return this._diagram }
	get islands(): IslandMap[] {
		if (this._islands.length === 0)
			this._islands = this._creator.generateIslandMaps(this._diagram);
		return this._islands;
	}
	get fluxRoutes(): Map<number, FluxRouteMap>  {
		if (this._fluxRoutes.size === 0) {
			this.setFluxElements();
		}
		return this._fluxRoutes;
	}
	get rivers(): Map<number, RiverMap> {
		if (this._rivers.size === 0) {
			this.setFluxElements();
		}
		return this._rivers;
	}

	get lakes(): LakeMap[] {
		if (this._lakes.length === 0)
			this._lakes = this._creator.generateLakeMaps(this._diagram);
		return this._lakes;
	}

	private setFluxElements() {
		const iro: IRiverMapGeneratorOut = this._creator.generateRiverMaps(this._diagram);
		this._fluxRoutes = iro.fluxRoutes;
		this._rivers = iro.rivers;
	}

	/* otras funciones genericas */
	get riverLengthSorted(): RiverMap[] { // mover esta funcion a algo superior a world
		let out: RiverMap[] = [];
		this.rivers.forEach((river: RiverMap) => out.push(river));
		out = out.sort((a: RiverMap, b: RiverMap) => b.length - a.length)
		return out;
	}

}