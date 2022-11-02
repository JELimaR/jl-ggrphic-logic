
const MAXROT = 23;

interface IDay {
	d: number;
	m: number;
}

interface ITempPerDay {
	idm: IDay;
	tempLat: number;
}

/**
 * Temperatura en funcion de la latitud y el dia
 */
export const calculateDayTempLat = (lat: number, day: number): number => {
	const ROT: number = MAXROT * Math.sin((day + 77) / 378 * 2 * Math.PI);
	return (Math.cos((lat - ROT) * Math.PI / 180) + 0.4) / 1.4;
}

/**
 * Arreglo con Temperatura por día en funcion de la latitud
 */
export const generateTempLatArrPerDay = (lat: number): ITempPerDay[] => {
	const daysArr: IDay[] = [];
	// let rotDayArr: number[] = [];

	for (let d = 1; d <= 378; d++) {
		daysArr.push({
			d,
			m: (Math.floor((d - 1) / 63) * 2 + 1) + (((d - 1) % 63) > 31 ? 1 : 0)
		})
	}

	const out: ITempPerDay[] = [];
	daysArr.forEach((idm: IDay) => {
		const tmpValue = calculateDayTempLat(lat, idm.d);
		out.push({
			tempLat: tmpValue,
			idm: idm
		})
	})

	return out;
}

/**
 * Arreglo con Temperatura media por mes en funcion de la latitud
 */
export const generateTempLatArrPerMonth = (lat: number): { month: number, tempLat: number }[] => {
	const out: { month: number, tempLat: number }[] = [];

	const tempPerDay: ITempPerDay[] = generateTempLatArrPerDay(lat);

	for (let m = 1; m <= 12; m++) {
		let mtemp = 0;
		let cant = 0;
		tempPerDay
			.filter((val: ITempPerDay) => val.idm.m === m)
			.forEach((itpd: ITempPerDay) => {
				mtemp += itpd.tempLat;
				cant += 1;
			})
		out.push({
			month: m,
			tempLat: mtemp / cant
		})
	}

	return out;
}

export const calculateMonthTempLat = (lat: number, month: number): number => {
	const tempArr = generateTempLatArrPerMonth(lat);
	return tempArr[month].tempLat;
}

/**
 * Temperatura media anual en funcion de la latitud
 */
export const calculateTempPromPerLat = (lat: number): number => {
	let out = 0;

	const tempPerDay: ITempPerDay[] = generateTempLatArrPerDay(lat);

	tempPerDay.forEach((itpd: ITempPerDay) => {
		out += itpd.tempLat;
	})

	return out / 378;
}

/**
 * Temperatura minima anual en funcion de la latitud
 */
export const calculateTempMinPerLat = (lat: number): number => {
	const tempPerDay: ITempPerDay[] = generateTempLatArrPerDay(lat);
	return Math.min(...tempPerDay.map((itpd: ITempPerDay) => itpd.tempLat));
}

export const calculateTempMaxPerLat = (lat: number): number => {
	const tempPerDay: ITempPerDay[] = generateTempLatArrPerDay(lat);
	return Math.max(...tempPerDay.map((itpd: ITempPerDay) => itpd.tempLat));
}


export const parametertoRealTemp = (tv: number): number => {
	return tv * 74 - 45;
}