import * as GameTest from "@minecraft/server-gametest";

import { DatabaseManager } from "../Database";
import { TestUtils } from "./TestUtils";

const TEST_CLASS_NAME = 'DatabaseTest';

setup(GameTest.register(TEST_CLASS_NAME, 'setting_data', (test: GameTest.Test) => {
    TestUtils.clearAllData();
    // basic setting function
    test.succeedIf(() => {
        const db = DatabaseManager.instance.getDatabase<string>('foobar');
        db.set('foo', 'bar');
        test.assert(db.get('foo') === 'bar', "db.get('foo') should equal to 'bar'.");
    });
}));


setup(GameTest.register(TEST_CLASS_NAME, 'data_consistency', (test: GameTest.Test) => {
    TestUtils.clearAllData();
    // two instance using same database, the change should be update
    test.succeedIf(() => {
        const inst = DatabaseManager.instance.getDatabase<string>('foobar2');
        const other_inst = DatabaseManager.instance.getDatabase<string>('foobar2');
        inst.set('foo', 'bar2');
        test.assert(other_inst.get('foo') === inst.get('foo'), 'the value of key "foo" should be the same');
    });
}));


setup(GameTest.register(TEST_CLASS_NAME, 'saveData', (test: GameTest.Test) => {
    TestUtils.clearAllData();
    // is saveData working?
    test.succeedIf(() => {
        const dbName = 'saveData_test';
        const db = DatabaseManager.instance.getDatabase<string>(dbName);
        db.set('k', 'v');
        db.set('foo', 'bar');

        db.saveData();

        const data = TestUtils.getRawData(dbName);
        if (data === undefined) return test.fail("cannot get the data from database 'saveData_test'.");
        if (data['k'] !== 'v' || data['foo'] !== 'bar') test.fail('the data was not save');
    });
}));


setup(GameTest.register(TEST_CLASS_NAME, 'fetchData', (test: GameTest.Test) => {
    TestUtils.clearAllData();

    // set initial data
    const dbName = 'fetch_test'
    TestUtils.setRawData(dbName, 'foo', 'bar');
    TestUtils.setRawData(dbName, 'foo2', 'bar2');

    // clear all instance in this.#databases
    const after = DatabaseManager.instance.removeAllInstance(); // for test
    if (after.size > 0) test.fail("removeAllInstance should clear all instance in 'this.#databases'.");

    const db = DatabaseManager.instance.getDatabase<string>(dbName);
    if (db.get('foo') !== 'bar') test.fail("db('fetch_test')['foo'] should be equal to 'bar'.");
    if (db.get('foo2') !== 'bar2') test.fail("db('fetch_test')['foo2'] should be equal to 'bar2'.");

    test.succeed();
}));


setup(GameTest.register(TEST_CLASS_NAME, 'save_before_shutdown', (test: GameTest.Test) => {
    // call 'setting_data' test and shutdown the world, then call this test
    // 'setting_data' test will add ['foo':'bar'] into database 'foobar'
    const db = DatabaseManager.instance.getDatabase<string>('foobar');
    if (db.get('foo') !== 'bar') test.fail("data wasn't save before shutdown");
    test.succeed();
}), 'shutdown_test');

function setup(builder: GameTest.RegistrationBuilder, tag: string = 'batch_test') {
    builder.structureName('db:gametest').tag(tag);
}