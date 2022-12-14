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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomersWithinDistance = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const fs_1 = require("fs");
const readline_1 = require("readline");
const helpers_1 = require("../helpers");
const customers_1 = require("../model/customers");
const redis = new ioredis_1.default({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
});
const customers = (0, fs_1.createReadStream)('customers.txt');
const rl = (0, readline_1.createInterface)({
    input: customers,
    crlfDelay: Infinity
});
const getCustomers = () => __awaiter(void 0, void 0, void 0, function* () {
    var e_1, _a;
    const customers = [];
    try {
        for (var rl_1 = __asyncValues(rl), rl_1_1; rl_1_1 = yield rl_1.next(), !rl_1_1.done;) {
            const line = rl_1_1.value;
            const eachCustomer = line.split(',');
            const id = eachCustomer[0].split(':')[1].trim();
            const lat = parseFloat(eachCustomer[1].split(':')[1].trim());
            const long = parseFloat(eachCustomer[2].split(':')[1].trim());
            if (!id || !lat || !long) {
                console.warn(`Invalid data for customer: \n${id}\n`);
                continue;
            }
            customers.push(new customers_1.Customer(id, lat, long));
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (rl_1_1 && !rl_1_1.done && (_a = rl_1.return)) yield _a.call(rl_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return customers;
});
const getDistance = (lat1, long1, lat2, long2) => __awaiter(void 0, void 0, void 0, function* () {
    const key = `${lat1}-${long1}-${lat2}-${long2}`;
    const cachedDistance = yield redis.get(key);
    if (cachedDistance) {
        return cachedDistance;
    }
    const dist = (0, helpers_1.distance)(lat1, long1, lat2, long2);
    yield redis.set(key, dist);
    return dist;
});
const getCustomersWithinDistance = (dist) => __awaiter(void 0, void 0, void 0, function* () {
    const customers = yield getCustomers();
    const customersWithinDistance = [];
    for (const customer of customers) {
        const d = yield getDistance(52.493256, 13.446082, customer.lat, customer.long);
        if (d <= dist) {
            customersWithinDistance.push(customer);
        }
    }
    return customersWithinDistance;
});
exports.getCustomersWithinDistance = getCustomersWithinDistance;
