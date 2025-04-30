import { Player, system, world, Vector3 } from "@minecraft/server";
import { CACHE_RELEASE } from "./database_config";

export type ValueType = boolean | number | string | Vector3 | undefined | Object;

console.log = (msg: string) => {
    world.getPlayers({tags:['admin']}).forEach(p => p.sendMessage(`[MCBE-Database] ${msg}`));
}

function access(target: any, _: string, __: PropertyDescriptor) {
    target.lastUpdate = Date.now();
}

class Database<T extends ValueType> {

    readonly name: string;
    lastAccessed: number;

    readonly #MEMORY: Map<string, T>;
    readonly #propertyName: string;

    constructor(name: string) {
        this.name = name;
        
        this.lastAccessed = Date.now();
        this.#propertyName = `database:db_${this.name}`;
        this.#MEMORY = new Map<string, T>();
        
        this.#fetch();
    }

    #fetch() {
        if (world.getDynamicProperty(this.#propertyName) === undefined) world.setDynamicProperty(this.#propertyName, '{}');
        try {
            const storableData = JSON.parse(world.getDynamicProperty(this.#propertyName) as string) as Record<string, T>;
            for (const [k, v] of Object.entries(storableData)) this.#MEMORY.set(k, v);
        } catch (err) { throw err; }
    }

    save() {
        try {
            const storableData = Object.fromEntries(this.#MEMORY);
            world.setDynamicProperty(this.#propertyName, JSON.stringify(storableData));
            console.log(`Saved Database ${this.name}.`);
        } catch (err) { throw err; }
    }

    @access get(key: string) { return this.#MEMORY.get(key); }
    @access getAll() { return Object.fromEntries(this.#MEMORY); }
    @access keys() { return Array.from(this.#MEMORY.keys()); }
    @access values() { return Array.from(this.#MEMORY.values()); }
    @access size() { return this.#MEMORY.size; }

    @access set(key: string, value: T) { this.#MEMORY.set(key, value); }
    @access delete(key: string) { this.#MEMORY.delete(key); }

    @access clear() { this.#MEMORY.clear(); }
}


class CacheCleaner {

    static enable(databases: Map<string, Database<any>>) {
        new this(databases);
    }

    readonly cacheInstance: Map<string, Database<any>>;

    private constructor(databases: Map<string, Database<any>>) {
        this.cacheInstance = databases;
        system.runInterval(this.#releaseCache.bind(this), CACHE_RELEASE.EXECUTION_INTERVAL * 20);
    }

    #releaseCache() {
        const databases = Array.from(this.cacheInstance.entries());
        if (databases.length === 0) return;
        databases.filter(([, db]) => Date.now() - db.lastAccessed >= CACHE_RELEASE.EXECUTION_INTERVAL * 1000);

        for (const info of databases) {    
            const [name, instance] = info;
            instance.save();
            this.cacheInstance.delete(name);
            console.log(`Release Database '${name}'.`);
        }
    }

}

export class DatabaseManager {

    static get instance() { return (this.#instance || (this.#instance = new this)); }
    static #instance: DatabaseManager;

    readonly #databases: Map<string, Database<any>>;

    private constructor() {
        this.#databases = new Map<string, Database<any>>();
        if (CACHE_RELEASE.ENABLE) CacheCleaner.enable(this.#databases);
        this.#addListener();
    }

    #addListener() {
        system.beforeEvents.shutdown.subscribe(() => this.saveAllDatabase());
    }

    saveAllDatabase() {
        this.#databases.forEach(db => db.save());
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
        for (const data in db.getAll()) {
            const [key, value] = data;
            player.sendMessage(`- [${key}: ${value}]`);
        }
    }

}