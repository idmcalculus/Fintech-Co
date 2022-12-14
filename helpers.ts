export const distance = (lat1: number, long1: number, lat2: number, long2: number) => {
	const Radius = 6371; // km
	const dLat = (lat2 - lat1) * Math.PI / 180;
	const dLong = (long2 - long1) * Math.PI / 180;
	const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
		Math.sin(dLong / 2) * Math.sin(dLong / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return Radius * c;
}
