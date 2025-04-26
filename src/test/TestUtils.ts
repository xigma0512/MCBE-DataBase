import { world } from "@minecraft/server";
import { ValueType } from "../Database.d";

export class TestUtils {
    
    static getRawData<T extends ValueType>(name: string) {
        const dbName = `database:db_${name}`;
        return JSON.parse(world.getDynamicProperty(dbName) as string) as Record<string, T>;
    }

    static clearAllData() {
        world.clearDynamicProperties();
    }

}