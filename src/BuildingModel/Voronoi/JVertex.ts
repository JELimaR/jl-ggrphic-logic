/* eslint-disable no-extra-boolean-cast */
import Point, { IPoint } from '../Geom/Point';
import JVertexInformation from './VertexInformation/JVertexInformation';
import JEdge from "./JEdge";

export interface IJVertexInfo {
	point: IPoint,
	edgeIds: string[],
}

export default class JVertex {
	private _point: Point;
	private _edges: JEdge[];

	private _vertexInformation: JVertexInformation;
	constructor(point: Point, edges: JEdge[]) {
		this._point = point;
		if (!(edges.length == 2 || edges.length == 3)) {
			console.log(point.getInterface())
			console.log(edges.map((e: JEdge) => e.getInterface()))
			if (edges.length !== 6) // borrar esto
				throw new Error(`deben haber 3 edges o 2 edges bordes y hay: ${edges.length}`)
		}
		this._edges = edges;

		this._vertexInformation = new JVertexInformation(this);

	}

	get id(): string { return this._point.id }
	get point(): Point { return this._point }
	get edges(): JEdge[] { return this._edges }
	get cellIds(): number[] {
		const list: Set<number> = new Set<number>();
		this._edges.forEach((e: JEdge) => {
			list.add(e.lSite.id)
			if (!!e.rSite) list.add(e.rSite.id)
		})
		return Array.from(list)
	}
	get neighborsId(): string[] {
		const out: string[] = [];
		this._edges.forEach((e: JEdge) => {
			if (e.vpA.id == this._point.id) out.push(e.vpB.id);
			else if (e.vpB.id == this._point.id) out.push(e.vpA.id);
			else throw new Error(``)
		})
		return out;
	}

	getEdgeFromNeighbour(v: JVertex): JEdge {
		let out: JEdge | undefined;
		this._edges.forEach((e: JEdge) => {
			if (e.vpA.id == v.point.id || e.vpB.id == v.point.id) {
				out = e;
			}
		})
		if (out) return out
		else throw Error(`los vertices ${v} y ${this} no son vecinos`)
	}

	isNeightbour(v: JVertex): boolean {
		let out = false;
		this.neighborsId.forEach((nid: string) => out = out || nid === v.id);
		return out;
	}

	/*
	 * Generic Information
	 */
	mark(): void { this._vertexInformation.mark = true }
	dismark(): void { this._vertexInformation.mark = false }
	isMarked(): boolean { return this._vertexInformation.mark }


	get info(): JVertexInformation { return this._vertexInformation }

	/** */
	getInterface(): IJVertexInfo {
		return {
			point: this._point.getInterface(),
			edgeIds: this._edges.map((e: JEdge) => e.id)
		}
	}

}