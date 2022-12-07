import { Site } from 'voronoijs';
import AzgaarReaderData from '../../DataFileLoadAndSave/AzgaarReaderData';
import InformationFilesManager from '../../DataFileLoadAndSave/InformationFilesManager';
import { IPoint } from '../../BuildingModel/Math/Point';
import RandomNumberGenerator from '../../BuildingModel/Math/RandomNumberGenerator';
import JDiagram from '../../BuildingModel/Voronoi/JDiagram';

const XDIF = 360;
const YDIF = 180;

export default class VoronoiSitesGenerator {
  getAzgaarSites(): Site[] {
    const ard = AzgaarReaderData.instance;
    return ard.getSites();
  }

  getSecSites(jd: JDiagram, AREA: number): {
    p: IPoint;
    cid: number;
  }[] {
    const ifm = InformationFilesManager._instance;

    let subSitesData: { p: IPoint, cid: number }[] = ifm.loadSubSites(AREA);
    if (subSitesData.length == 0) {
      subSitesData = jd.getSubSites(AREA);
      ifm.saveSubSites(subSitesData, AREA);
    }

    return subSitesData;
  }

  getRandomSites(count: number): Site[] {
    const out: Site[] = [];
    const randFunc = RandomNumberGenerator.makeRandomFloat(count);

    for (let i = 0; i < count; i++) {
      const pos: IPoint = this.randomSite(randFunc);
      out.push({ id: i, x: pos.x, y: pos.y });
    }
    return out;
  }

  private randomSite(randFloat: () => number): IPoint {
    const x = Math.round(randFloat() * XDIF * 1000000) / 1000000 - XDIF / 2;
    const y = Math.round(randFloat() * YDIF * 1000000) / 1000000 - YDIF / 2;
    return { x, y };
  }
}
