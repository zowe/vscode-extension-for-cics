/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 *
 */

import * as commandUtils from "../../../src/utils/commandUtils";

describe("Command Utils tests", () => {
  describe("splitCmciErrorMessage", () => {
    const testError = "Test\nCmci Error\nresp:1\nresp2:2\nresp_alt:3\neibfn_alt:4";
    it("should return something", () => {
      const response = commandUtils.splitCmciErrorMessage(testError);
      expect(response).toEqual(["1", "2", "3", "4"]);
    });
  });
});
