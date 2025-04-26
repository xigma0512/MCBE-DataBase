import { world } from "@minecraft/server";
import { ValueType } from "./Database.d"

class Database<T extends ValueType> {

    readonly name: string;
    
    readonly #MEMORY: Map<string, T>;
    readonly #propertyName: string;

    constructor(name: string) {
        this.name = name;
        this.#propertyName = `database:db_${this.name}`;
        this.#MEMORY = new Map<string, T>();

        this.#fetch();
    }

    #fetch() {
        if (world.getDynamicProperty(this.#propertyName) === undefined) {
            world.setDynamicProperty(this.#propertyName, '{}');
            console.warn(`The DynamicProperty '${this.#propertyName}' is undefined. It is being set to default value '{}'.`);
        }

        const storableData = JSON.parse(world.getDynamicProperty(this.#propertyName) as string) as Record<string, T>;
        for (const [k, v] of Object.entries(storableData)) this.#MEMORY.set(k, v);
    }

    saveData() {
        const storableData = Object.fromEntries(this.#MEMORY);
        world.setDynamicProperty(this.#propertyName, JSON.stringify(storableData));
    }

    get(key: string) {
        if (!this.#MEMORY.has(key)) {
            throw new Error(`Cannot found key '${key}' in Database '${this.name}'.`);
        }
        return this.#MEMORY.get(key);
    }

    set(key: string, value: T) {
        this.#MEMORY.set(key, value);
    }

}

export class DatabaseManager {

    static #instance: DatabaseManager;
    static get instance() { return (this.#instance || (this.#instance = new this)); }

    readonly #databases: Map<string, Database<any>>;

    private constructor() {
        this.#databases = new Map<string, Database<any>>();
    }

    getDatabase<T extends ValueType>(name: string) {
        if (!this.#databases.has(name)) {
            this.#databases.set(name, new Database<T>(name));
        }
        return this.#databases.get(name)! as Database<T>;
    }


    /** TEST **/
    removeAllInstance() {
        this.#databases.clear();
        return this.#databases;
    }

}