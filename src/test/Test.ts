import * as GameTest from "@minecraft/server-gametest";
import { Database } from "../Database";

class DatabaseTest {

    static readonly TEST_CASES = [
        GameTest.register(this.name, 'setting_data', (test: GameTest.Test) => {
            // basic setting function
            test.succeedIf(() => {
                const db = new Database<string>('foobar');
                db.set('foo', 'bar');
                test.assert(db.get('foo') === 'bar', "db.get('foo') should equal to 'bar'.");
            });
        }),
        GameTest.register(this.name, 'data_consistency', (test: GameTest.Test) => {
            // two instance using same database, the change should be update
            const inst = new Database<string>('foobar2');
            const other_inst = new Database<string>('foobar2');
            inst.set('foo', 'bar2');
            test.assert(other_inst.get('foo') === inst.get('foo'), 'the value of key "foo" should be the same');
        })
    ];

}

function setup(builders: GameTest.RegistrationBuilder[]) {
    for (const builder of builders) {
        builder.structureName('db:gametest').tag('test');
    }
}

setup(DatabaseTest.TEST_CASES);