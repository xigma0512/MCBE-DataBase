import * as GameTest from "@minecraft/server-gametest";

class DatabaseTest {

    static readonly TEST_CASES = [];

}

function setup(builders: GameTest.RegistrationBuilder[]) {
    for (const builder of builders) {
        builder.structureName('db:gametest').tag('test');
    }
}

setup(DatabaseTest.TEST_CASES);