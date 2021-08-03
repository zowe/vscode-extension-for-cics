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
import { ProfileManagement } from '../../utils/profileManagement';

suite('Profile Management Tests', async () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Contains Zowe Explorer APIs', () => {
		assert.strictEqual(ProfileManagement.apiDoesExist(), true);
	});
	test('Able to retrieve ProfilesCache', () => {
		assert.strictEqual(ProfileManagement.getProfilesCache() ? true : false, true);
	});
	test('Includes cics profile type', () => {
		assert.strictEqual(ProfileManagement.getProfilesCache().getAllTypes().includes('cics'), true);
	});

});
