import * as GameTest from "@minecraft/server-gametest";

import { DatabaseManager } from "../Database";
import { TestUtils } from "./TestUtils";
import { Vector3 } from "@minecraft/server";

const TEST_CLASS_NAME = 'DatabaseTest';

/**
 * i wish i could set data in database
 */
setup(GameTest.register(TEST_CLASS_NAME, 'setting_data', (test: GameTest.Test) => {
    TestUtils.clearAllProperties();

    test.succeedIf(() => {
        const db = DatabaseManager.instance.getDatabase<string>('foobar_1');
        db.set('foo', 'bar');
        test.assert(db.get('foo') === 'bar', "db.get('foo') should equal to 'bar'.");
    });
}));


/**
 * i hope there will be no data conflicts
 */
setup(GameTest.register(TEST_CLASS_NAME, 'data_consistency', (test: GameTest.Test) => {
    TestUtils.clearAllProperties();

    test.succeedIf(() => {
        const inst = DatabaseManager.instance.getDatabase<string>('foobar_2');
        const other_inst = DatabaseManager.instance.getDatabase<string>('foobar_2');
        inst.set('foo', 'bar2');
        test.assert(other_inst.get('foo') === inst.get('foo'), 'the value of key "foo" should be the same');
    });
}));


/**
 * i wish i could save data manually by calling `Database.save()`
 */
setup(GameTest.register(TEST_CLASS_NAME, 'saveData', (test: GameTest.Test) => {
    TestUtils.clearAllProperties();

    test.succeedIf(() => {
        const dbName = 'foobar_3';
        const db = DatabaseManager.instance.getDatabase<string>(dbName);
        db.set('k', 'v');
        db.set('foo', 'bar');

        db.save();

        const data = TestUtils.getProperty(dbName);
        if (data === undefined) return test.fail("cannot get the data from database 'saveData_test'.");
        if (data['k'] !== 'v' || data['foo'] !== 'bar') test.fail('the data was not save');
    });
}));


/**
 * i wish old data could be fetched when i call `getDatabase()`
 */
setup(GameTest.register(TEST_CLASS_NAME, 'fetchData', (test: GameTest.Test) => {
    TestUtils.clearAllProperties();

    // set initial data
    const dbName = 'fetch_test'
    TestUtils.setProperty(dbName, 'foo', 'bar');
    TestUtils.setProperty(dbName, 'foo2', 'bar2');

    // clear all instance in this.#databases
    const inst = DatabaseManager.instance.access_databases_instance(); // for test
    inst.clear();
    if (inst.size > 0) test.fail("removeAllInstance should clear all instance in 'this.#databases'.");

    const db = DatabaseManager.instance.getDatabase<string>(dbName);
    if (db.get('foo') !== 'bar') test.fail("db('fetch_test')['foo'] should be equal to 'bar'.");
    if (db.get('foo2') !== 'bar2') test.fail("db('fetch_test')['foo2'] should be equal to 'bar2'.");

    test.succeed();
}));


/**
 * i wish data could be saved before i close the game
 */
setup(GameTest.register(TEST_CLASS_NAME, 'save_before_shutdown', (test: GameTest.Test) => {
    // call 'setting_data' test and shutdown the world, then call this test
    // 'setting_data' test will add ['foo':'bar'] into database 'foobar_1'
    const db = DatabaseManager.instance.getDatabase<string>('foobar_1');
    if (db.get('foo') !== 'bar') test.fail("data wasn't save before shutdown");
    test.succeed();
}), 'shutdown_test');


/** 
 * i want to get the whole data list, or keys/values from the list
 */
setup(GameTest.register(TEST_CLASS_NAME, 'getAll_keys_values', (test: GameTest.Test) => {
    TestUtils.clearAllProperties();
    
    TestUtils.setProperty('foobar_5', 'f1', 'b1');
    TestUtils.setProperty('foobar_5', 'f2', 'b2');
    TestUtils.setProperty('foobar_5', 'f3', 'b3');

    const foobar = DatabaseManager.instance.getDatabase<string>('foobar_5');
    
    const all = foobar.getAll();
    if (JSON.stringify(all) !== JSON.stringify({'f1': 'b1', 'f2': 'b2', 'f3': 'b3'})) test.fail(`getAll() fail`); 
    
    const keys = foobar.keys();
    if (JSON.stringify(keys) !== JSON.stringify(['f1', 'f2', 'f3'])) test.fail('keys() fail'); 
    
    const values = foobar.values();
    if (JSON.stringify(values) !== JSON.stringify(['b1', 'b2', 'b3'])) test.fail('values() fail'); 

    test.succeed();
}));


/** 
 * i want to print all element in the database
 */
setup(GameTest.register(TEST_CLASS_NAME, 'database_print_all_elements', (test: GameTest.Test) => {
    TestUtils.clearAllProperties();

    TestUtils.setProperty('foobar_6', 'f1', 'b1');
    TestUtils.setProperty('foobar_6', 'f2', 'b2');
    TestUtils.setProperty('foobar_6', 'f3', 'b3');

    const player = test.spawnSimulatedPlayer(test.worldLocation({x:0, y: 0, z: 0}));
    DatabaseManager.instance.printElements('foobar_6', player);
    test.succeed();
}));

/** 
 * i want to delete elements or clear all element in database
 */
setup(GameTest.register(TEST_CLASS_NAME, 'database_clearAll_and_delete', (test: GameTest.Test) => {
    TestUtils.clearAllProperties();

    TestUtils.setProperty('foobar_7', 'f1', 'b1');
    TestUtils.setProperty('foobar_7', 'f2', 'b2');
    TestUtils.setProperty('foobar_7', 'f3', 'b3');

    const foobar = DatabaseManager.instance.getDatabase('foobar_7');
    foobar.delete('f2');
    if (foobar.get('f2') !== undefined) test.fail("delete foobar_7['f2'] fails");

    foobar.clear();
    if (foobar.keys().length > 0) test.fail("clear database 'foobar_7' fails");

    test.succeed();
}));

/**
 * test if database can store data with type of Vector3
 */
setup(GameTest.register(TEST_CLASS_NAME, 'can_save_vector3', (test: GameTest.Test) => {
    TestUtils.clearAllProperties();
    
    TestUtils.setProperty('foobar_8', 'f1', {x: 1, y: 1, z: 1});

    const foobar = DatabaseManager.instance.getDatabase<Vector3>('foobar_8');
    if (JSON.stringify(foobar.get('f1')) !== JSON.stringify({x: 1, y: 1, z: 1})) test.fail(``);
    test.succeed();
}));

/**
 * test if database cache can be clean in interval
 */
// setup(GameTest.register(TEST_CLASS_NAME, 'cache_cleaner', (test: GameTest.Test) => {
//     TestUtils.clearAllProperties();
//     DatabaseManager.instance.access_databases_instance().clear();;

//     const oldDbName = 'old';
//     const recentDbName = 'recent';
//     const oldData = { 'key1': 'value1', 'key2': 'value2' };
//     const recentData = { 'keyA': 'valueA', 'keyB': 'valueB' };

//     const oldDb = DatabaseManager.instance.getDatabase<any>(oldDbName);
//     oldDb.set('key1', 'value1');
//     oldDb.set('key2', 'value2');

//     const recentDb = DatabaseManager.instance.getDatabase<any>(recentDbName);
//     recentDb.set('keyA', 'valueA');

//     test.startSequence()
//         .thenIdle(100)
//         .thenExecute(() => {
//             const recentDbAfterWait = DatabaseManager.instance.getDatabase<string>(recentDbName);
//             if (recentDbAfterWait.get('keyA') === undefined) test.fail(`database old['keyA'] is undefined.`); 
//             recentDbAfterWait.set('keyB', 'valueB');
//         })
//         .thenExecute(() => {
//             const cache = DatabaseManager.instance.access_databases_instance();
//             test.assert(!cache.has(oldDbName), `Database '${oldDbName}' should be removed.`);
//             test.assert(cache.has(recentDbName), `Database '${recentDbName}' should remain.`);

//             const savedOldData = TestUtils.getProperty(oldDbName);
//             test.assert(savedOldData !== undefined, `Property for '${oldDbName}' should exist.`);
//             test.assert(JSON.stringify(savedOldData) === JSON.stringify(oldData), `Data for '${oldDbName}' not saved correctly.`);
            
//             const recentDbFromCache = cache.get(recentDbName);
//             test.assert(recentDbFromCache !== undefined, `Recent db instance must be in cache.`);
//             test.assert(JSON.stringify(Object.fromEntries(recentDbFromCache())) === JSON.stringify(recentData), `Data in recent db cache is wrong.`);
            
//             test.succeed();
//         });
// }));

/**
 * test if database can store data with type of Vector3
 */
setup(GameTest.register(TEST_CLASS_NAME, 'can_save_object', (test: GameTest.Test) => {
    type userinfo = {
        name: string,
        phone: number
    };
    const userinfoTable: Record<string, userinfo> = {
        'steve': {name: 'steve', phone: 55688},
        'alex': {name: 'alex', phone: 88655}
    };
    const database = DatabaseManager.instance.getDatabase<userinfo>('obj_test');
    for (const [username, phone] of Object.entries(userinfoTable)) {
        database.set(username, phone);
    }

    database.save();
    DatabaseManager.instance.access_databases_instance().clear(); // TEST FUNCTION

    const newInstance = DatabaseManager.instance.getDatabase<userinfo>('obj_test');
    const steve_info = newInstance.get('steve');
    if (steve_info === undefined) test.fail('where is steve??');
    if (steve_info!.name !== 'steve') test.fail('steve name false');
    if (steve_info!.phone !== 55688) test.fail('steve phone false');

    test.succeed();
}));

function setup(builder: GameTest.RegistrationBuilder, tag: string = 'batch_test') {
    builder.structureName('db:gametest').tag(tag).maxTicks(200);
}