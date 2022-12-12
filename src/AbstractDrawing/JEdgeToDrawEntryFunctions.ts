import * as chroma from 'chroma-js';

import JEdge from '../BuildingModel/Voronoi/JEdge';
import JVertex from '../BuildingModel/Voronoi/JVertex';
import JVertexFlux from '../BuildingModel/Voronoi/VertexInformation/JVertexFlux';

import IDrawingParameters from './IDrawingParameters';

export const fluxMedia = () => {
	const colorScale: chroma.Scale = chroma.scale('Spectral').domain([1, 0]);
	return (edge: JEdge): IDrawingParameters => {
		let verts: JVertex[] = edge.vertices;
		let fluxPromValue: number = Math.min(verts[0].info.vertexFlux.annualFlux, verts[1].info.vertexFlux.annualFlux);
    fluxPromValue = 5*(fluxPromValue/JVertexFlux.maxFluxValues.annualMaxFlux) ** 0.4;
    // console.log(fluxPromValue)
		return {
			fillColor: 'none',
			strokeColor: colorScale(1).hex(),
			lineWidth: fluxPromValue,
			dashPattern: [1, 0]
		}
	}
}

export const fluxMonth = (month: number) => {
	const colorScale: chroma.Scale = chroma.scale('Spectral').domain([1, 0]);
	return (edge: JEdge): IDrawingParameters => {
		let verts: JVertex[] = edge.vertices;
    let fluxPromValue: number = Math.min(verts[0].info.vertexFlux.monthFlux[month-1], verts[1].info.vertexFlux.monthFlux[month-1]);
    fluxPromValue = 5*(fluxPromValue/JVertexFlux.maxFluxValues.monthMaxFlux[month-1]) ** 0.4;
		return {
			fillColor: 'none',
			strokeColor: colorScale(0.15).hex(),
			// lineWidth: fluxPromValue,
			dashPattern: [1, 0]
		}
	}
}

export const navMonth = (month: number) => {
	const colorScale: chroma.Scale = chroma.scale('Spectral').domain([1, 0]);
	return (edge: JEdge): IDrawingParameters => {
		let verts: JVertex[] = edge.vertices;
    let val = Math.min(
      verts[0].info.vertexFlux.navLevelMonth[month-1], 
      verts[1].info.vertexFlux.navLevelMonth[month-1]
    );
    let color: string = colorScale(val/3).hex();
    return {
      fillColor: 'none',
      strokeColor: color,
    }
	}
}

export const colors = (dd: IDrawingParameters) => {
	return (_e: JEdge) => { return dd }
}