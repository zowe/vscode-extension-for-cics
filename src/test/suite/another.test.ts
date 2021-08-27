/*
* This program and the accompanying materials are made available under the terms of the
* Eclipse Public License v2.0 which accompanies this distribution, and is available at
* https://www.eclipse.org/legal/epl-v20.html
*
* SPDX-License-Identifier: EPL-2.0
*
* Copyright Contributors to the Zowe Project.
*
*/

import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';

suite('Another suite', async () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('true equals true', () => {
        assert.strictEqual(true, true);
    });
    test('9 = 9', () => {
        assert.strictEqual(9, 9);
    });

});
