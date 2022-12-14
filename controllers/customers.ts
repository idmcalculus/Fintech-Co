import Redis from 'ioredis';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';

import { distance } from '../helpers';
import { Customer } from '../model/customers';

const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
});

const customers = createReadStream('customers.txt');

const rl = createInterface({
	  input: customers,
	  crlfDelay: Infinity
});

const getCustomers = async (): Promise<Customer[]> => {
	const customers: Customer[] = [];

	for await (const line of rl) {
		const eachCustomer = line.split(',');
		const id = eachCustomer[0].split(':')[1].trim();
		const lat = parseFloat(eachCustomer[1].split(':')[1].trim());
		const long = parseFloat(eachCustomer[2].split(':')[1].trim());
		
		if (!id || !lat || !long) {
			console.warn(`Invalid data for customer: \n${id}\n`);
			continue;
		}

		customers.push(new Customer(id, lat, long));
	}

	return customers;
}

const getDistance = async (lat1: number, long1: number, lat2: number, long2: number) => {

	const key = `${lat1}-${long1}-${lat2}-${long2}`;
	const cachedDistance = await redis.get(key);

	if (cachedDistance) {
		return cachedDistance;
	}

	const dist = distance(lat1, long1, lat2, long2);
	await redis.set(key, dist);
	return dist;
}



export const getCustomersWithinDistance = async (dist: number): Promise<Customer[]> => {
	const customers: Customer[] = await getCustomers();

	const customersWithinDistance: Customer[] = [];
	
	for (const customer of customers) {
		const d = await getDistance(52.493256, 13.446082, customer.lat, customer.long);
		if (d <= dist) {
			customersWithinDistance.push(customer);
		}
	}

	return customersWithinDistance;
}
