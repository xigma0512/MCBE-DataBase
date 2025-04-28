import { world } from "@minecraft/server";
import { ValueType } from "../Database";

export class TestUtils {
    
    static getProperty<T extends ValueType>(name: string) {
        const dbName = `database:db_${name}`;
        try {
            return JSON.parse(world.getDynamicProperty(dbName) as string) as Record<string, T>;
        } catch {
            return undefined;
        }
    }
    
    static setProperty(name: string, key: string, value: ValueType) {
        const rawData = this.getProperty(name) ?? {};
        const dbName = `database:db_${name}`;
        rawData[key] = value;
        world.setDynamicProperty(dbName, JSON.stringify(rawData));
    }

    static clearAllProperties() {
        world.clearDynamicProperties();
    }

}