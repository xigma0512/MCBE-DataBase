import { Player, system, world } from "@minecraft/server";
import { SimulatedPlayer } from "@minecraft/server-gametest";

import { ValueType } from "./Database.d"

class Database<T extends ValueType> {

    readonly name: string;
    
    readonly #MEMORY: Map<string, T>;
    readonly #propertyName: string;

    /** Create */
    constructor(name: string) {
        this.name = name;
        this.#propertyName = `database:db_${this.name}`;
        this.#MEMORY = new Map<string, T>();
        this.#fetch();
    }

    /** Fetch data from dynamic property */
    #fetch() {
        if (world.getDynamicProperty(this.#propertyName) === undefined) {
            world.setDynamicProperty(this.#propertyName, '{}');
            console.warn(`The DynamicProperty '${this.#propertyName}' is undefined. It is being set to default value '{}'.`);
        }

        try {
            const storableData = JSON.parse(world.getDynamicProperty(this.#propertyName) as string) as Record<string, T>;
            for (const [k, v] of Object.entries(storableData)) this.#MEMORY.set(k, v);
        } catch (err) { throw err; }
    }

    /** Upload(save) data to dynamic property */
    save() {
        try {
            const storableData = Object.fromEntries(this.#MEMORY);
            world.setDynamicProperty(this.#propertyName, JSON.stringify(storableData));
        } catch (err) { throw err; }
    }

    /** Read */
    get(key: string) {
        try {
            if (!this.#MEMORY.has(key)) {
                throw new Error(`Cannot found key '${key}' in Database '${this.name}'.`);
            }
            return this.#MEMORY.get(key);
        } catch { return undefined; }
    }
    getAll() { return Object.fromEntries(this.#MEMORY); }
    keys() { return Array.from(this.#MEMORY.keys()); }
    values() { return Array.from(this.#MEMORY.values()); }
    size() { return this.#MEMORY.size; }

    /** Update */
    set(key: string, value: T) { this.#MEMORY.set(key, value); }

    /** Delete */
    delete(key: string) { this.#MEMORY.delete(key); }
    clear() { this.#MEMORY.clear(); }
}

export class DatabaseManager {

    static #instance: DatabaseManager;
    static get instance() { return (this.#instance || (this.#instance = new this)); }

    readonly #databases: Map<string, Database<any>>;

    private constructor() {
        this.#databases = new Map<string, Database<any>>();
        this.#addListener();
    }

    #addListener() {
        system.beforeEvents.shutdown.subscribe(() => this.saveAllDatabase());
    }

    saveAllDatabase() {
        for (const [name, db] of this.#databases) {
            db.save();
            console.warn(`Saved Database ${name}.`);
        }
    }

    getDatabase<T extends ValueType>(name: string) {
        if (!this.#databases.has(name)) {
            this.#databases.set(name, new Database<T>(name));
        }
        return this.#databases.get(name) as Database<T>;
    }

    printElements(databaseName: string, player: Player) {
        const db = this.getDatabase(databaseName);
        player.sendMessage(`[Database]: ${databaseName} (size: ${db.size()})`);
        if (player instanceof SimulatedPlayer) player.chat(`[Database]: ${databaseName} (size: ${db.size()})`); // TEST CODE
        for (const data in db.getAll()) {
            const [key, value] = data;
            player.sendMessage(`- [${key}: ${value}]`);
            if (player instanceof SimulatedPlayer) player.chat(`- [${key}: ${value}]`); // TEST CODE
        }
    }


    /** TEST **/
    removeAllInstance() {
        this.#databases.clear();
        return this.#databases;
    }

}