import { Voronoi, BoundingBox, Site, Diagram } from 'voronoijs';
import InformationFilesManager from '../../DataFileLoadAndSave/InformationFilesManager';
import { IPoint } from '../../BuildingModel/Geom/Point';
import JDiagram, { LoaderDiagram } from '../../BuildingModel/Voronoi/JDiagram';
import VoronoiSitesGenerator from './VoronoiSitesGenerator';

export default class VoronoiDiagramCreator {

	createRandomDiagram(count: number): JDiagram {
		console.time('compute random diagram');

		const bbox: BoundingBox = { xl: -180, xr: 180, yt: -90, yb: 90 };
		const vor = new Voronoi();

		console.time('Generate Sites');
		const vsg = new VoronoiSitesGenerator();
		const sites: Site[] = vsg.getRandomSites(count);
		console.timeEnd('Generate Sites');

		const diagram: Diagram = vor.compute(sites, bbox);

		console.timeEnd('compute random diagram');

		return new JDiagram(diagram);
	}

	createAzgaarInitialDiagram(): JDiagram {
		console.time('Generate Sites');
		const vsg = new VoronoiSitesGenerator();
		const sites: Site[] = vsg.getAzgaarSites();
		console.timeEnd('Generate Sites');

		console.time('compute prim')
		const bbox: BoundingBox = { xl: -180, xr: 180, yt: -90, yb: 90 };
		const vor = new Voronoi();
		
		const diagram: Diagram = vor.compute(sites, bbox);
		console.timeEnd('compute prim')

		return new JDiagram(diagram);
	}

	createSubDiagram(jd: JDiagram, AREA: number): JDiagram {
		const ifm = InformationFilesManager._instance;
		console.time('compute sec')

		let out: JDiagram;

		console.log('Generating sub sites');
		console.time('Generate sub sites');

		const vsg = new VoronoiSitesGenerator();
		const subSitesData: { p: IPoint, cid: number }[] = vsg.getSecSites(jd, AREA);

		console.log('sites cant', subSitesData.length)
		const idi = ifm.loadDiagramValues(AREA);
		if (idi.cells.length !== 0) {
			console.timeEnd('Generate sub sites');
			console.log('diagram loaded')
			const loaded: LoaderDiagram = new LoaderDiagram(idi.cells, idi.edges, idi.vertices);
			out = new JDiagram(loaded, { d: jd, a: AREA, s: subSitesData });
		} else {
			const sites: Site[] = subSitesData.map((elem: { p: IPoint, cid: number }) => {
				return { id: 0, x: elem.p.x, y: elem.p.y }
			})
			console.timeEnd('Generate sub sites');
			
			const bbox: BoundingBox = { xl: -180, xr: 180, yt: -90, yb: 90 };
			const vor = new Voronoi();

			const diagram: Diagram = vor.compute(sites, bbox);
			out = new JDiagram(diagram, { d: jd, a: AREA, s: subSitesData });
			ifm.saveDiagramValues(out.getInterface(), AREA);
		}
		console.timeEnd('compute sec')

		return out;
	}

}


