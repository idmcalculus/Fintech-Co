import { AMQPClient } from '@cloudamqp/amqp-client';
import { getCustomersWithinDistance } from './controllers/customers';
import { Customer } from './model/customers';
import { config } from 'dotenv';

config();

const amqpClient = new AMQPClient(process.env.AMPQ_CLOUDAMQP_URL || 'amqp://127.0.0.1:5672'); // process.env.AMPQ_URL if on local machine

const main = async () => {
	try {
		const customersWithinDistance: Customer[] = await getCustomersWithinDistance(100);
		const customersWithinDistanceSorted: Customer[] = customersWithinDistance.sort((a: { id: string; }, b: { id: string; }) => a.id.localeCompare(b.id));
		const customersWithinDistanceSortedIds: string = customersWithinDistanceSorted.map((customer: Customer) => customer.id).join('\n');
		
		const amqp = await amqpClient.connect();
		const channel = await amqp.channel();
		const queue = await channel.queue();
		const consumer = await queue.subscribe({noAck: true}, async (msg) => {
			console.log(msg.bodyToString());
			await consumer.cancel();
		});
		await queue.publish(`Customers Within 100km of Fintech Co's HQ \n\n${customersWithinDistanceSortedIds}`);
	} catch (e: any) {
		console.error(e);
	}
}

main();