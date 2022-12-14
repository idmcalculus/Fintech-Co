export class Customer {
	id: string;
	lat: number;
	long: number;
	constructor(id: string, lat: number, long: number) {
		this.id = id;
		this.lat = lat;
		this.long = long;
	}
}