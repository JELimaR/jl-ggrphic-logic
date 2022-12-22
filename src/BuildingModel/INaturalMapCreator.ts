import JDiagram from './Voronoi/JDiagram';
import IslandMap from './MapContainerElements/Natural/IslandMap';
import FluxRouteMap from "./MapContainerElements/Natural/FluxRouteMap";
import RiverMap from "./MapContainerElements/Natural/RiverMap";
import LakeMap from './MapContainerElements/Natural/LakeMap';


export default interface INaturalMapCreator {
	generateVoronoiDiagramInfo: (AREA: number) => JDiagram;
	generateRiverMaps: (diag: JDiagram) => IRiverMapGeneratorOut;
	generateIslandMaps: (diag: JDiagram) => IslandMap[];
	generateLakeMaps: (diag: JDiagram) => LakeMap[];
  generateAGRMap: (diagram: JDiagram) => any;
	// verifyDiagramInfoExists
}

export interface IRiverMapGeneratorOut {
	fluxRoutes: Map<number, FluxRouteMap>;
	rivers: Map<number, RiverMap>;
}