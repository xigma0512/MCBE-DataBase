import * as GameTest from "@minecraft/server-gametest";

import { DatabaseManager } from "../Database";
import { TestUtils } from "./TestUtils";

class DatabaseTest {

    static readonly TEST_CASES = [
        GameTest.register(this.name, 'setting_data', (test: GameTest.Test) => {
            
            TestUtils.clearAllData();
            
            // basic setting function
            test.succeedIf(() => {
                const db = DatabaseManager.instance.getDatabase<string>('foobar');
                db.set('foo', 'bar');
                test.assert(db.get('foo') === 'bar', "db.get('foo') should equal to 'bar'.");
            });
        
        }),
        GameTest.register(this.name, 'data_consistency', (test: GameTest.Test) => {
            
            TestUtils.clearAllData();

            // two instance using same database, the change should be update
            test.succeedIf(() => {
                const inst = DatabaseManager.instance.getDatabase<string>('foobar2');
                const other_inst = DatabaseManager.instance.getDatabase<string>('foobar2');
                inst.set('foo', 'bar2');
                test.assert(other_inst.get('foo') === inst.get('foo'), 'the value of key "foo" should be the same');
            });

        }),
        GameTest.register(this.name, 'fetch_and_saveData', (test: GameTest.Test) => {

            TestUtils.clearAllData();

            // is saveData working?
            test.succeedIf(() => {
                const dbName = 'fetch_test';
                const db = DatabaseManager.instance.getDatabase<string>(dbName);
                db.set('k', 'v');
                db.set('foo', 'bar');

                db.saveData();

                const data = TestUtils.getRawData(dbName);
                if (data['k'] !== 'v' || data['foo'] !== 'bar') test.fail('the data was not save');
            });

        })
    ];

}

function setup(builders: GameTest.RegistrationBuilder[]) {
    for (const builder of builders) {
        builder.structureName('db:gametest').tag('database_test');
    }
}

setup(DatabaseTest.TEST_CASES);