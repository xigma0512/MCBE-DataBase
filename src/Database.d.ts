import { Player, Vector3 } from "@minecraft/server";

/**
 * Defines the types of values that can be stored in the database.
 */
declare type ValueType = boolean | number | string | Vector3 | undefined;

/**
 * A simple key-value database stored in dynamic properties.
 * @template T The type of values stored in the database.
 */
declare class Database<T extends ValueType> {

    /**
     * The unique name of the database.
     */
    readonly name: string;
    
    /**
     * The timestamp (in milliseconds since the epoch) when this database instance was last accessed.
     */
    lastAccessed: number;

    /**
     * @internal
     * Instances should typically be obtained via DatabaseManager.getDatabase.
     */
    private constructor();

    /**
     * Saves the current state of the database (all element in memory)
     * to the world's dynamic properties.
     */
    save(): void;

    /**
     * Gets a value from the database by key.
     * @param key The key to look up.
     * @returns The value associated with the key, or undefined if the key is not found.
     */
    get(key: string): T | undefined;

    /**
     * Gets all elements as a standard JavaScript object.
     * Note: The object keys will always be strings.
     * @returns An object containing all data currently in the database.
     */
    getAll(): Record<string, T>;

    /**
     * Gets an array of all keys present in the database.
     * @returns An array of strings representing the keys.
     */
    keys(): string[];

    /**
     * Gets an array of all values present in the database.
     * @returns An array of values of type T.
     */
    values(): T[];

    /**
     * Gets number of elements in database 
     * @returns The total number of entries in the database.
     */
    size(): number;

    /**
     * Sets or updates a value in the database for a given key.
     * @param key The key to set.
     * @param value The value to store, must be of type T or a compatible type.
     */
    set(key: string, value: T): void;

    /**
     * Deletes a key-value pair from the database.
     * @param key The key to delete.
     * @returns True if the key was found and successfully deleted, false otherwise.
     */
    delete(key: string): boolean;

    /**
     * Removes all key-value pairs from the database, effectively emptying it.
     */
    clear(): void;
}

/**
 * Manages instances of Database classes, ensuring singletons per database name.
 * This class is implemented as a singleton, accessed via `DatabaseManager.instance`.
 */
declare class DatabaseManager {
    /**
     * Provides the singleton instance of the DatabaseManager.
     */
    static readonly instance: DatabaseManager;

    /**
     * @internal
     * Private constructor for the singleton DatabaseManager.
     */
    private constructor();

    /**
     * Save data of all database to dynamic properties
     */
    saveAllDatabase(): void;

    /**
     * Gets or creates a Database instance for a given unique name.
     * @template T The expected type of values stored in this database.
     * @param name The unique name of the database to get or create.
     * @returns The Database instance for the specified name, typed with T.
     */
    getDatabase<T extends ValueType>(name: string): Database<T>;

    /**
     * Prints the contents (keys and values) of a specified database to a player's chat.
     * Useful for debugging or inspecting database contents in-game.
     * @param databaseName The name of the database whose contents should be printed.
     * @param player The player who should receive the chat messages.
     */
    printElements(databaseName: string, player: Player): void;
}