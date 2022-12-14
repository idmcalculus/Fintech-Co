"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const amqp_client_1 = require("@cloudamqp/amqp-client");
const customers_1 = require("./controllers/customers");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const amqpClient = new amqp_client_1.AMQPClient(process.env.AMPQ_CLOUDAMQP_URL || 'amqp://127.0.0.1:5672'); // process.env.AMPQ_URL if on local machine
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const customersWithinDistance = yield (0, customers_1.getCustomersWithinDistance)(100);
        const customersWithinDistanceSorted = customersWithinDistance.sort((a, b) => a.id.localeCompare(b.id));
        const customersWithinDistanceSortedIds = customersWithinDistanceSorted.map((customer) => customer.id).join('\n');
        const amqp = yield amqpClient.connect();
        const channel = yield amqp.channel();
        const queue = yield channel.queue();
        const consumer = yield queue.subscribe({ noAck: true }, (msg) => __awaiter(void 0, void 0, void 0, function* () {
            console.log(msg.bodyToString());
            yield consumer.cancel();
        }));
        yield queue.publish(`Customers Within 100km of Fintech Co's HQ \n\n${customersWithinDistanceSortedIds}`);
    }
    catch (e) {
        console.error(e);
    }
});
main();
