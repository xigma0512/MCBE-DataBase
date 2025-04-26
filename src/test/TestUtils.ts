import { world } from "@minecraft/server";
import { ValueType } from "../Database.d";

export class TestUtils {
    
    static getRawData<T extends ValueType>(name: string) {
        return JSON.parse(world.getDynamicProperty(name) as string) as Record<string, T>;
    }

    static clearAllData() {
        world.clearDynamicProperties();
    }

}