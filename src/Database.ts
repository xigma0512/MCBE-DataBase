import { world } from "@minecraft/server";
import { ValueType } from "./Database.d"

export class Database<T extends ValueType> {

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