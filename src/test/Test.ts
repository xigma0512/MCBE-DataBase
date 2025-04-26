import * as GameTest from "@minecraft/server-gametest";
import { Database } from "../Database";


class DatabaseTest {

    static readonly TEST_CASES = [
        GameTest.register(this.name, 'setting_data', (test: GameTest.Test) => {
            test.succeedIf(() => {
                const db = new Database<string>('foobar');
                db.set('foo', 'bar');
                test.assert(db.get('foo') === 'bar', "db.get('foo') should equal to 'bar'.");
            });
        })
    ];

}

function setup(builders: GameTest.RegistrationBuilder[]) {
    for (const builder of builders) {
        builder.structureName('db:gametest').tag('test');
    }
}

setup(DatabaseTest.TEST_CASES);