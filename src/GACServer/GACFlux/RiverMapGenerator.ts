import JDiagram from "../../BuildingModel/Voronoi/JDiagram";
import InformationFilesManager from '../../DataFileLoadAndSave/InformationFilesManager';
import JCellClimate from '../../BuildingModel/Voronoi/CellInformation/JCellClimate'
import JVertex from "../../BuildingModel/Voronoi/JVertex";
import JVertexFlux, { IJVertexFluxInfo, IMaxFluxValues } from "../../BuildingModel/Voronoi/VertexInformation/JVertexFlux";
import MapGenerator from "../MapGenerator";
import FluxRouteMap, { IFluxRouteMapInfo } from "../../BuildingModel/MapContainerElements/Natural/FluxRouteMap";
import RiverMap, { IRiverMapInfo } from "../../BuildingModel/MapContainerElements/Natural/RiverMap";
import { getArrayOfN, heightParamToMeters } from "../../BuildingModel/Math/basicMathFunctions";
import { IRiverMapGeneratorOut } from "../../BuildingModel/INaturalMapCreator";
import { FLUXLIMITPARAM } from "../constants";
import JCellHeight from "../../BuildingModel/Voronoi/CellInformation/JCellHeight";

export default class RiverMapGenerator extends MapGenerator<IRiverMapGeneratorOut> {

  constructor(d: JDiagram) {
    super(d);
  }

  generate(): IRiverMapGeneratorOut {
    const fluxRoutesOut: Map<number, FluxRouteMap> = new Map<number, FluxRouteMap>();
    const riversOut: Map<number, RiverMap> = new Map<number, RiverMap>();
    // cargar datos
    const dim = InformationFilesManager.instance;
    const verticesDataLoaded: IJVertexFluxInfo[] = dim.loadMapElementData(this.diagram.secAreaProm, JVertexFlux.getTypeInformationKey());
    const fluxRoutesDataLoaded: IFluxRouteMapInfo[] = dim.loadMapElementData(this.diagram.secAreaProm, FluxRouteMap.getTypeInformationKey());
    const riversDataLoaded: IRiverMapInfo[] = dim.loadMapElementData(this.diagram.secAreaProm, RiverMap.getTypeInformationKey());

    console.log(`Generating flux and water drain route`)
    console.time(`flux and water drain route`)
    if (verticesDataLoaded.length == 0 || fluxRoutesDataLoaded.length == 0) {
      this.setFluxValuesAndRoads(fluxRoutesOut);
    } else {
      // setear vertices flux data
      verticesDataLoaded.forEach((ivfi: IJVertexFluxInfo) => {
        const v: JVertex = this.diagram.vertices.get(ivfi.id) as JVertex;
        v.info.setFluxInfo(ivfi);
      })
      // setear flux routes
      fluxRoutesDataLoaded.forEach((ifri: IFluxRouteMapInfo) => {
        const fr: FluxRouteMap = new FluxRouteMap(ifri.id, this.diagram, ifri);
				fluxRoutesOut.set(fr.id, fr);
      })
    }
    console.timeEnd(`flux and water drain route`)

    console.log(`Generating rivers`)
    console.time(`rivers`)
    if (riversDataLoaded.length === 0) {
      this.setRivers(fluxRoutesOut, riversOut);
      console.log('rivers generados', riversOut.size)
      console.time('nav')
      this.evalAllRiversNavigabilityFromSea(riversOut);
      console.timeEnd('nav')
    } else {
      riversDataLoaded.forEach((iri: IRiverMapInfo) => {
        const river: RiverMap = new RiverMap(iri.id, this.diagram, iri);
				riversOut.set(river.id, river);
      })
    }
    console.timeEnd(`rivers`)

    // gruardar todo
    if (verticesDataLoaded.length === 0) {
      const verticesArr: JVertexFlux[] = [];
      this.diagram.forEachVertex((vertex: JVertex) => verticesArr.push(vertex.info.vertexFlux))
      dim.saveMapElementData<IJVertexFluxInfo, JVertexFlux>(
        verticesArr,
        this.diagram.secAreaProm,
        JVertexFlux.getTypeInformationKey()
      );
    }
    if (fluxRoutesDataLoaded.length === 0) {
    	dim.saveMapElementData<IFluxRouteMapInfo, FluxRouteMap>(
        [...fluxRoutesOut.values()],
        this.diagram.secAreaProm,
        FluxRouteMap.getTypeInformationKey()
      );
    }
    if (riversDataLoaded.length === 0) {
    	dim.saveMapElementData<IRiverMapInfo, RiverMap>(
        [...riversOut.values()],
        this.diagram.secAreaProm,
        RiverMap.getTypeInformationKey()
      );
    }

    // set max flux values
    let maxFluxValues: IMaxFluxValues = {annualMaxFlux: 0, monthMaxFlux: getArrayOfN(12,0)};
    this.diagram.forEachVertex((v: JVertex) => {
      const vfannual = v.info.vertexFlux.annualFlux;
      if (vfannual > maxFluxValues.annualMaxFlux) maxFluxValues.annualMaxFlux = vfannual;
      maxFluxValues.monthMaxFlux.forEach((val: number, i: number) => {
        if (v.info.vertexFlux.monthFlux[i] > val) {
          maxFluxValues.monthMaxFlux[i] = v.info.vertexFlux.monthFlux[i];
        }
      })
    })
    JVertexFlux.maxFluxValues = maxFluxValues;
    // set cells flux values

    // console.log('routes cant', this._waterRoutesMap.size)
    // console.log('rivers cant', this._rivers.size)
    return {
      fluxRoutes: fluxRoutesOut,
      rivers: riversOut
    }
  }

  private setFluxValuesAndRoads(fluxRoutesMap: Map<number, FluxRouteMap>) {
    const verticesArr: JVertex[] = [];
    this.diagram.forEachVertex((v: JVertex) => {
      if (v.info.vertexHeight.heightType == 'land') {
        verticesArr.push(v);
      }
      const finfo: IJVertexFluxInfo = {
        id: v.id,
        fluxMonth: getArrayOfN(12, 0),
        fluxRouteIds: [],
        riverIds: [],
        navLevelMonth: getArrayOfN(12,-1)
      };
      v.info.setFluxInfo(finfo);
    });
    verticesArr.sort((a: JVertex, b: JVertex) => b.info.height - a.info.height);
    let id = -1;

    // generate roads
    verticesArr.forEach((v: JVertex) => {
      if (!v.isMarked()) {
        id++;

        const route: FluxRouteMap = new FluxRouteMap(id, this.diagram);
        let curr: JVertex = v;
        const currFluxArr: number[] = getArrayOfN(12, 0);

        this.fluxCalcIteration(curr, currFluxArr, route);

        while (curr.info.vertexHeight.heightType !== 'coast' && curr.info.vertexHeight.heightType !== 'lakeCoast') {
          const mhv: JVertex = this.getMinHeightNeighbour(curr);
          if (mhv.info.height < curr.info.height) {
            curr = mhv;

            this.fluxCalcIteration(curr, currFluxArr, route);
          } else {
            break;
          }
        }
        fluxRoutesMap.set(id, route);
      }
    })

    this.diagram.dismarkAllVertices();
  }

  private fluxCalcIteration(curr: JVertex, currFluxArr: number[], route: FluxRouteMap) {
    curr.mark();
    const vClimate = curr.info.vertexClimate;
    const vFlux = curr.info.vertexFlux;

    if (vFlux.fluxRouteIds.length == 0) {
      vClimate.precipMonth.forEach((p: number, i: number) => {
        currFluxArr[i] += (100 * (12 * p) - 10 * (vClimate.pumbral)) / JCellClimate.maxAnnualPrecip;
        if (currFluxArr[i] < 0) currFluxArr[i] = 0;
      })
    }
    route.addVertex(curr);
    // update flux
    const newFluxArr: number[] = vFlux.monthFlux.map((f: number, i: number) => {
      return f + currFluxArr[i];
    });

    // update vertexFlux
    vFlux.monthFlux.forEach((_f: number, i: number) => {
      vFlux.monthFlux[i] = newFluxArr[i];
    });
    vFlux.fluxRouteIds.push(route.id);
  }

  private setRivers(fluxRoutesMap: Map<number, FluxRouteMap>, rivers: Map<number, RiverMap>) {
    const FLUXLIMIT = this.diagram.vertices.size * FLUXLIMITPARAM;
    fluxRoutesMap.forEach((fluxRoute: FluxRouteMap, id: number) => {

      const river: RiverMap = new RiverMap(id, this.diagram);

      let vertex: JVertex;
      for (vertex of fluxRoute.vertices) {

        const medFlux: number = vertex.info.vertexFlux.annualFlux / 12; // usar med o min o max ?
        const maxFlux: number = Math.max(...vertex.info.vertexFlux.monthFlux);
        // if ((medFlux > FLUXLIMIT || river.vertices.length > 0) && !vertex.isMarked()) {
        if ((maxFlux > FLUXLIMIT || river.vertices.length > 0) && !vertex.isMarked()) {
          river.addVertex(vertex)
          vertex.mark()
        } else if (vertex.isMarked()) {
          river.addVertex(vertex)
          break;
        }
      }

      if (river.vertices.length > 1) {
        river.forEachVertex((v: JVertex) => {
          v.info.vertexFlux.riverIds.push(river.id);
        })
        rivers.set(id, river);
      }
    })

    this.diagram.dismarkAllVertices();
  }

  private evalAllRiversNavigabilityFromSea(rivers: Map<number, RiverMap>) {

    // inicializar
    this.intialVerticesEval()

    rivers.forEach((rm: RiverMap) => {
      const iniInfo = rm.ini.info.vertexFlux;
      if (iniInfo.navLevelMonth[0] === -1) this.evalRiverVertices(rm, rivers);
    })
    
  }
  private intialVerticesEval() {
    this.diagram.forEachVertex((v: JVertex) => {
      const finfo = v.info.vertexFlux;
      const tempMonth = v.info.vertexClimate.tempMonth;
      const ht = v.info.vertexHeight.heightType;
      if (ht === 'coast' || ht === 'lakeCoast')
        finfo.navLevelMonth.forEach((_, i: number) => 
          finfo.navLevelMonth[i] = tempMonth[i] > -8 ? 3 : 0
        )
      else if (ht === 'ocean' || ht === 'lake')
        finfo.navLevelMonth.forEach((_, i: number) => 
          finfo.navLevelMonth[i] =  tempMonth[i] > -8 ? 4 : 0
        )
    })
  }
  /**
   * Esta funcion debe estar acá debido a que se modifica vertexInfo
   */
  private evalRiverVertices (river: RiverMap, rivers: Map<number, RiverMap>) {
    const fluxInfo = river.fin.info.vertexFlux;
    if (fluxInfo.navLevelMonth[0] === -1) { // desemboca en otro river que no fue evaluado
      const oid = fluxInfo.riverIds[0] === river.id ? fluxInfo.riverIds[1] : fluxInfo.riverIds[0];
      const other: RiverMap = rivers.get(oid) as RiverMap;
      this.evalRiverVertices(other, rivers);
    }
  
    for (let idx: number = river.vertices.length - 2; idx > -1; idx--) {
      const prevV = river.vertices[idx+1];
      const currV = river.vertices[idx];
      const currInfo = currV.info.vertexFlux;
      const prevInfo = prevV.info.vertexFlux;
  
      for (let m = 1; m <= 12; m++) {
        const currLevel = evalIndEdgeNavLevel(currV, prevV, m, this.diagram);
        currInfo.navLevelMonth[m-1] = Math.min(prevInfo.navLevelMonth[m-1], currLevel);
      }
    }
  }

  private getMinHeightNeighbour(vertex: JVertex): JVertex {
    const narr: JVertex[] = this.diagram.getVertexNeighbours(vertex);
    let out: JVertex = narr[0], minH = 2;
    narr.forEach((nc: JVertex) => {
      if (nc.info.height < minH && vertex.id !== nc.id) { // la segunda condicion se debe a que un vertex puede ser vecino de si mismo
        out = nc;
        minH = nc.info.height;
      }
    })
    return out;
  }

}

/**
 * evalIndEdgeNav
 * @param prevV 
 * @param currV 
 * @param month 
 */
export const evalIndEdgeNavLevel = (currV: JVertex, prevV: JVertex, month: number, diagram: JDiagram): number => {
  const edge = diagram.getEdgeFromVertices(prevV, currV);

  const difH = heightParamToMeters(currV.info.height) - 
    heightParamToMeters(prevV.info.height);
  const dist = edge.length;

  const desnivel = 0.1*difH/dist; // cm per m

  if (desnivel > 10)
    return 0;
  else 
    return Math.min(
      evalIndVertexNavLevel(prevV, month, diagram),
      evalIndVertexNavLevel(currV, month, diagram)
    );
}

/**
 * evalIndVertexNav
 * @param vertex 
 * @param month 
 */
export const evalIndVertexNavLevel = (vertex: JVertex, month: number, diagram: JDiagram): number => {  
  let out: number = 0;
  const VSIZE_FLUXLIMIT = diagram.vertices.size * FLUXLIMITPARAM;
  const flux = vertex.info.vertexFlux.monthFlux[month-1];
  const temp = vertex.info.vertexClimate.tempMonth[month-1];
  const heightMeters = heightParamToMeters(vertex.info.vertexHeight.height);

  if (flux > VSIZE_FLUXLIMIT * 25 && temp > -5 && heightMeters < 1000) 
    out = 3;
  else if (flux > VSIZE_FLUXLIMIT * 15 && temp > -5 && heightMeters < 1500)
    out = 2;
  else if (flux > VSIZE_FLUXLIMIT * 5 && temp > -5 && heightMeters < 2500)
    out = 1;
  else 
    out = 0;
  
  return out;
}
