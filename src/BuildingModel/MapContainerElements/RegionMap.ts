import JCell from '../Voronoi/JCell';
import Point from '../Geom/Point';
// import RandomNumberGenerator from "../Geom/RandomNumberGenerator";
import JDiagram from '../Voronoi/JDiagram';
import JVertex from '../Voronoi/JVertex';
import JEdge from '../Voronoi/JEdge';
import LineMap from './LineMap';
import { IDiagramContainer, ICellContainer } from './containerInterfaces';
import MapElement from '../MapElement';

export interface IRegionMapInfo {
	cells: number[];
	neighborList: number[];
	limitCellList: number[];
	area: number;
}
/*
export interface IJRegionTreeNode {
	id: string;
	region: JRegionMap;
}
*/
export default class RegionMap extends MapElement<IRegionMapInfo> implements IDiagramContainer, ICellContainer  {

	private _diagram: JDiagram;
	private _cells: Map<number, JCell>;
	private _neighborList: Map<number, JCell>;
  private _isUpdatedNeigbourList = false;
	private _limitCellList: Map<number, JCell>;
  private _isUpdatedLimitList = false;
	private _area: number;

	constructor(diag: JDiagram, info?: IRegionMapInfo) {
		super();
		this._diagram = diag;
		if (info) {
			this._cells = new Map<number, JCell>();
			info.cells.forEach((id: number) => {
				this._cells.set(id, this.diagram.cells.get(id)!);
			})
      this._neighborList = new Map<number, JCell>();
      info.neighborList.forEach((id: number) => {
				this._neighborList.set(id, this.diagram.cells.get(id)!);
			})
      this._limitCellList = new Map<number, JCell>();
      info.limitCellList.forEach((id: number) => {
				this._limitCellList.set(id, this.diagram.cells.get(id)!);
			})
			this._area = info.area;
		} else {
			this._cells = new Map<number, JCell>();
			this._neighborList = new Map<number, JCell>();
			this._limitCellList = new Map<number, JCell>();
			this._area = 0;
		}
	}

	get diagram(): JDiagram { return this._diagram }
	get area(): number { return this._area;	}
	get cells(): Map<number, JCell> {return this._cells}
	
	forEachCell(func: (c: JCell) => void): void {
		this._cells.forEach((cell: JCell) => func(cell));
	}

	getLimitCells(): JCell[] {
    this.updateLimitCellList();
		return [...this._limitCellList.values()]
	}

	getNeightboursCells(): JCell[] {
    this.updateNeigbourCellList();
		return [...this._neighborList.values()]
	}

	getLimitLines(): LineMap[] {
		const out: LineMap[] = [];

		const verticesLimits: Map<string,JVertex> = new Map<string,JVertex>(); // map para evitar agregar el mismo vertex
		this.getLimitCells().forEach((cell: JCell) => {
			const cellVertices = cell.voronoiVertices.map((p: Point) => this.diagram.vertices.get(p.id)!);
			cellVertices.forEach((v: JVertex) => {
				this.diagram.getCellsAssociated(v).forEach((aso: JCell) => {
					if (!this.isInRegion(aso)) verticesLimits.set(v.id, v);
				})
			})
		})
		this.sortVerticesList([...verticesLimits.values()]).forEach((verts: JVertex[]) => {
			const line: LineMap = new LineMap(this.diagram);
			verts.forEach((elem: JVertex) => line.addVertex(elem));
			line.close();
			out.push(line);
		})
		// if (out.length == 0) throw new Error(`en una region debe haber al menos un LineMap limit`)

		return out;
	}

	// draw functions
	// buscar max x y min x en vez de 2.05
	getDrawerParameters(): {center: Point, XMAXDIS: number, YMAXDIS: number} {
		let XMIN = 180, YMIN = 90;
		let XMAX = -180, YMAX = -90;
		this.getLimitCells().forEach((cell: JCell) => {
      const bboxLimitsPoint = cell.getBBoxLimitsPoint();
			if (bboxLimitsPoint.minX < XMIN) XMIN = bboxLimitsPoint.minX;
			if (bboxLimitsPoint.minY < YMIN) YMIN = bboxLimitsPoint.minY;
			if (bboxLimitsPoint.maxX > XMAX) XMAX = bboxLimitsPoint.maxX;
			if (bboxLimitsPoint.maxY > YMAX) YMAX = bboxLimitsPoint.maxY;
		})
		return {
			center: new Point((XMAX-XMIN)/2 + XMIN, (YMAX-YMIN)/2+YMIN),
			XMAXDIS: (XMAX-XMIN),
			YMAXDIS: (YMAX-YMIN)
		}
	}
	
	private updateLimitCellList(): void {
    if (this._isUpdatedLimitList) {
      return;
    }
    this._limitCellList = new Map<number, JCell>();
    this.forEachCell((cell: JCell) => {
      const neighbours = cell.neighborsId;
      let islimit = false;
      for (let i = 0; i < neighbours.length && !islimit; i++) {
        if (!this.isInRegion(neighbours[i])) {
          islimit = true;
        }
      }
      if (islimit) {
        this._limitCellList.set(cell.id, cell);
      }
    })
    this._isUpdatedLimitList = true;
    /*
		this._limitCellList.forEach((cellId: number) => {
			const cell = this._cells.get(cellId) as JCell;
			// if (cell) {
				const neighbours = cell.neighborsId;
				let islimit = false;
				for (let i = 0; i < neighbours.length && !islimit; i++) {
					if (!this.isInRegion(neighbours[i])) {
						islimit = true;
					}
				}
				if (!islimit) {
					this._limitCellList.delete(cell.id);
				}
			// }	
		})
    */
	}

  private updateNeigbourCellList(): void {
    if (this._isUpdatedNeigbourList) {
      return;
    }
    this._neighborList = new Map<number, JCell>();
    this.getLimitCells().forEach((cell: JCell) => {
      this._diagram.getCellNeighbours(cell).forEach((nn: JCell) => {
        if (!this.isInRegion(nn)) this._neighborList.set(nn.id, nn);
      })
    })
    this._isUpdatedNeigbourList = true;
	}

	isInRegion(en: number | JCell): boolean { 
		return RegionMap.isInRegion(en, this);
	}

	addCell(c: JCell): void {
		if (this.isInRegion(c.id)) {
			return;
		}
		// if (c.info.isLand) { // ver esto
			this._cells.set(c.id, c);
			this._area += c.area;
			// this._limitCellList.add(c.id);
		// }
    this._neighborList.delete(c.id);
		c.neighborsId.forEach((id: number) => {
			const ncell = this.diagram.cells.get(id) as JCell;
			if (!this.isInRegion(ncell)) {
				// this._neighborList.add(id);
			}
		})
		
		// this.updateLimitCellList();
    this._isUpdatedNeigbourList = false;
    this._isUpdatedLimitList = false;
	}

	addRegion(reg: RegionMap): void {
		let areDisjoint = true;
		reg.forEachCell((c: JCell) => {
			if (!this.isInRegion(c.id)) {
				this._cells.set(c.id, c);
			} else {
				areDisjoint = false;
			}
		})
		if (areDisjoint) {
			this._area += reg._area;
		} else {
			this._area = 0;
			this._cells.forEach((c: JCell) => {
				this._area += c.area;
			})
		}
		// reg._limitCellList.forEach((lcv: number) => { this._limitCellList.add(lcv) });
		// reg._neighborList.forEach((nv: number) => { this._neighborList.add(nv) });
		// this._neighborList.forEach((nv: number) => {
		// 	if (this.isInRegion(nv)) this._neighborList.delete(nv);
		// });
    this._isUpdatedNeigbourList = false;
    this._isUpdatedLimitList = false;
		this.updateLimitCellList();
    this.updateNeigbourCellList();
	}
/*
	growing(ent: {cant: number, supLim?: number, regFather?: RegionMap}): void {
		ent.supLim = ent.supLim || Infinity;
		for (let i=0; i<ent.cant && this.area < ent.supLim; i++) {
			this.growingOnes(ent.regFather);
		}
	}

	private growingOnes(regFather?: RegionMap) {
		if (this._neighborList.size === 0) return;
		const list = [...this._neighborList]
		list.forEach((nid: number) => {
			const cell: JCell = this.diagram.cells.get(nid) as JCell;
			if (!cell.info.isLand || (!(regFather && !regFather.isInRegion(nid)))) {
				this.addCell(cell);
				this._neighborList.delete(nid);
			}
		})
	}

	divideInSubregions(plist: Point[][], landOnly = false): RegionMap[] {
		if (plist.length === 0) {
			throw new Error('plist most have points arrays')
		}
		const subs: RegionMap[] = [];
		const used: Map<number, number> = new Map<number,number>(); // cambiar
		const randFunc = RandomNumberGenerator.makeRandomFloat(plist.length);
		plist.forEach((points: Point[]) => {
			if (points.length === 0) {
				throw new Error('points most have points')
			}
			const newSR: RegionMap = new RegionMap(this.diagram);
			subs.push(newSR);
			points.forEach((p: Point) => {
				const centerCell: JCell = this.diagram.getCellFromPoint(p);
				if (landOnly && !centerCell.info.isLand) throw Error(`la celda es agua\nx: ${p.x};y: ${p.y}`)
				if (landOnly && !this.isInRegion(centerCell)) throw new Error(`la celda ${centerCell} no esta en la region\nx: ${p.x};y: ${p.y}`)
				centerCell.mark();
				newSR.addCell(centerCell);
				used.set(centerCell.id, centerCell.id);
			})
		})
		
		let prevUsedSize = 0;
		for (let i=0; i < 1000 && prevUsedSize < used.size && used.size < this._cells.size; i++) {
			prevUsedSize = used.size;
			subs.forEach((jsr: RegionMap) => {
				jsr.growingOnesInDivide(this, used, randFunc, landOnly);
			})
		}
		this._cells.forEach((c: JCell) => {
			if (!c.isMarked()) {
				this.addCellToNearestRegion(c, subs);
			}
		})

		this.diagram.dismarkAllCells();

		return subs;
	}

	private growingOnesInDivide(regFather: RegionMap, used: Map<number, number>, randFunc: ()=>number, landOnly: boolean)  {
		if (this._neighborList.size === 0) return;
		const list = [...this._neighborList];
		list.forEach((e: number) => {
			const cell: JCell = this.diagram.cells.get(e) as JCell;
			let randValue: boolean;
			if (!cell.info.isLand && landOnly) {
				randValue = false;
			} else {
				randValue = (cell.info.isLand) ? randFunc() < 0.5 : randFunc() < 0.25;
			}
			if (randValue) {
				// si cell is land entonces debe estar en regFather y ademas no debe estar marcado
				if ((!cell.info.isLand || regFather.isInRegion(cell)) && !cell.isMarked()) {
					if (cell.info.isLand) used.set(cell.id, cell.id)
					cell.mark();
					this.addCell(cell);
					this._neighborList.delete(e);
				}
			}
		})
	}

	private addCellToNearestRegion(cell: JCell, subs: RegionMap[]) {
		const dist: number[] = [];
		subs.forEach((sr: RegionMap) => { 
			dist.push( sr.minDistanceToCell(cell) );
		})

		const minDist = Math.min(...dist);
		const indexMin = dist.indexOf(minDist);
		subs[indexMin].addCell(cell);
	}
*/
	getInterface(): IRegionMapInfo {
    //
		const cells: number[] = [];
		this._cells.forEach((c: JCell) => {cells.push(c.id)});
    //
    const neighborList: number[] = [];
		this.getNeightboursCells().forEach((c: JCell) => {neighborList.push(c.id)});
    //
    const limitCellList: number[] = [];
		this.getLimitCells().forEach((c: JCell) => {limitCellList.push(c.id)});
		return {
			cells,
			neighborList,
			limitCellList,
			area: this.area
		}
	}

	minDistanceToCell(cell: JCell): number {
		let out = Infinity;
		this.getLimitCells().forEach((clim: JCell) => {
			const dist = Point.geogDistance(clim.center, cell.center);
			if (dist < out) out = dist;
		})
		return out;
	}

	// distance between
	static minDistanceBetweenRegions(reg1: RegionMap, reg2: RegionMap): number {
		let out = Infinity;
		reg1.getLimitCells().forEach((c1: JCell) => {
			reg2.getLimitCells().forEach((c2: JCell) => {
				const dist = Point.geogDistance(c1.center, c2.center);
				if (dist < out) out = dist;
			})
		})
		return out;
	}

	static intersect(reg1: RegionMap, reg2: RegionMap): RegionMap {
		const out: RegionMap = new RegionMap(reg1.diagram);
		if (reg1.cells.size < reg2.cells.size) {
			reg1.forEachCell((c1: JCell) => {
				if (RegionMap.isInRegion(c1, reg2))
					out.addCell(c1);
			})
		} else {
			reg2.forEachCell((c2: JCell) => {
				if (RegionMap.isInRegion(c2, reg1))
					out.addCell(c2);
			})
		}
		return out;
	}

	static existIntersection(reg1: RegionMap, reg2: RegionMap): boolean {
		let out = false;
		const it = reg1._cells.values();
		for (let i=0; i < reg1._cells.size && !out ; i++ ) {
			const c1: JCell = it.next().value;
			out = RegionMap.isInRegion(c1, reg2);
		}
		return out;
	}

	static isInRegion(en: number | JCell, reg: RegionMap): boolean { // borrar
		const id: number = (en instanceof JCell) ? en.id : en;
		return reg.cells.has(id);
	}

		// 
	private sortVerticesList(verts: JVertex[]): Map<string, JVertex[]> {
		const out: Map<string, JVertex[]> = new Map<string, JVertex[]>();
		
		const qeueMap: Map<string, JVertex> = new Map<string, JVertex>();
		verts.forEach((v: JVertex) => qeueMap.set(v.id, v));

		while (qeueMap.size > 0) {
			
			const [cv] = qeueMap.values();
			qeueMap.delete(cv.id);
			const arr: JVertex[] = [cv];
			cv.mark();

			let nqeue: JVertex[] = this.findVertexNeigboursInArrayNotMarked(cv, qeueMap);
			while (nqeue.length > 0) {
				const nv = nqeue[0];
				qeueMap.delete(nv.id);
				arr.push(nv);
				nv.mark();
				nqeue = this.findVertexNeigboursInArrayNotMarked(nv, qeueMap);
			}

			out.set(cv.id, arr);
		}

		this.diagram.dismarkAllVertices();
		return out;
	}

  private findVertexNeigboursInArrayNotMarked(v: JVertex, list: Map<string, JVertex>): JVertex[] {
    const out: JVertex[] = [];
    this.diagram.getVertexNeighbours(v).forEach((nv: JVertex) => {
      const edgeAso: JEdge = nv.getEdgeFromNeighbour(v);
      let isEdgeLimit: boolean
      if (!edgeAso.rSite) {
        isEdgeLimit = this.isInRegion(edgeAso.lSite.id);
      } else {
        isEdgeLimit =
          (this.isInRegion(edgeAso.lSite.id) && !this.isInRegion(edgeAso.rSite.id))
          || (!this.isInRegion(edgeAso.lSite.id) && this.isInRegion(edgeAso.rSite.id))
      }
      if (isEdgeLimit && list.has(nv.id) && !nv.isMarked()) out.push(nv)
    })
    return out;
  }
}

/*
export interface IJContinentInfo extends IRegionMapInfo {
	id: number;
}

export class JContinentMap extends RegionMap {
	private _id: number;
	private _countries: JCountryMap[];
	private _states: Map<string,JStateMap>;

	constructor(id: number, diag: JDiagram, info?: IJContinentInfo | RegionMap) {
		const iri: IRegionMapInfo | undefined = (info instanceof RegionMap) ? info.getInterface() : info;
		super(diag, iri);
		this._id = id;
		this._states = new Map<string,JStateMap>();
		this._countries = [];

	}

	get id(): number { return this._id }
	get states(): Map<String, JStateMap> { return this._states}
	get countries(): JCountryMap[] { return this._countries }
	getInterface(): IJContinentInfo {
		return {
			...super.getInterface(),
			id: this._id,
		}
	}

	generateStates(): void {
		const loadedStates: IJStateInfo[] = dataFilaManager.loadStatesInfo(this.diagram.cells.size, this.id);
		
		if (loadedStates.length === 0) {
			let arr: RegionMap[] = this.divideInSubregions(statesPointsLists[this._id], true);
			arr.forEach((reg: RegionMap, idx: number) => {
				let state = new JStateMap(this._id, this.diagram, reg.getInterface());
				this._states.set(state.id, state);
			})
			dataFilaManager.saveStatesInfo(this._states, this.diagram.cells.size, this._id)
		} else {
			loadedStates.forEach((isi: IJStateInfo) => {
				let state = new JStateMap(this._id, this.diagram, isi);
				this._states.set(state.id, state);
			})
		}
	}
	
	setCountries() {
		const loadedCountries: IJCountryInfo[] = dataFilaManager.loadCountriesInfo(this.diagram.cells.size, this.id);

		if (loadedCountries.length === 0) {
			const list = countriesDivision[this._id];
			list.forEach((countriesIDs: string[], idx: number) => {
				let jcm: JCountryMap = new JCountryMap(this._id, this)
				countriesIDs.forEach((id: string) => {
					const jsm: JStateMap | undefined = this._states.get(id);
					if (jsm) {
						jcm.addState(jsm);
					}
				})
				this._countries.push(jcm);
			})
			dataFilaManager.saveCountriesInfo(this._countries, this.diagram.cells.size, this.id)
		} else {
			loadedCountries.forEach((ici: IJCountryInfo) => {
				const jcm: JCountryMap = new JCountryMap(this.id, this, ici);
				this.countries.push(jcm);
			})
		}
	}

}

export interface IJCountryInfo extends IRegionMapInfo {
	id: string;
	states: string[];
}

export class JCountryMap extends RegionMap {
	private static currId: number = 0;
	static getNewID(): number {
		this.currId++;
		return this.currId;
	}
	private _id: string;
	private _states: JStateMap[]

	constructor(contId: number, cont: JContinentMap, info?: IJCountryInfo | RegionMap) {
		const iri: IRegionMapInfo | undefined = (info instanceof RegionMap) ? info.getInterface() : info;
		super(cont.diagram, iri);
		this._states = [];
		if (info && !(info instanceof RegionMap)) {
			this._id = info.id;
			info.states.forEach((sid: string) => {
				const state: JStateMap | undefined = cont.states.get(sid);
				if (state) {
					this._states.push(state);
				}
			})
		} else {
			this._id = `CY${(contId+1)*1000+JCountryMap.getNewID()}C${contId}`;
		}
	}

	get id(): string {return this._id}
	get states(): JStateMap[] { return this._states}

	addState(state: JStateMap) {
		this._states.push(state);
		this.addRegion(state);
	}

	getInterface(): IJCountryInfo {
		return {
			id: this.id,
			states: this._states.map((st: JStateMap) => st.id),
			...super.getInterface()
		}
	}
}

export interface IJStateInfo extends IRegionMapInfo {
	id: string;
}

export class JStateMap extends RegionMap {

	private static currId: number = 0;
	static getNewID(): number {
		this.currId++;
		return this.currId;
	}
	private _id: string;

	constructor(contId: number, diag: JDiagram, info?: IRegionMapInfo) {
		super(diag, info);
		this._id = `S${(contId+1)*1000+JStateMap.getNewID()}C${contId}`;
	}

	get id(): string {return this._id}

	getInterface(): IJStateInfo {
		return {
			id: this._id,
			...super.getInterface()
		}
	}
}
*/