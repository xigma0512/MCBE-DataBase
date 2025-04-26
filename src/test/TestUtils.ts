import { world } from "@minecraft/server";
import { ValueType } from "../Database.d";

export class TestUtils {
    
    static getRawData<T extends ValueType>(name: string) {
        const dbName = `database:db_${name}`;
        try {
            return JSON.parse(world.getDynamicProperty(dbName) as string) as Record<string, T>;
        } catch {
            return undefined;
        }
    }
    
    static setRawData(name: string, key: string, value: ValueType) {
        const rawData = this.getRawData(name) ?? {};
        const dbName = `database:db_${name}`;
        rawData[key] = value;
        world.setDynamicProperty(dbName, JSON.stringify(rawData));
    }

    static clearAllData() {
        world.clearDynamicProperties();
    }

}