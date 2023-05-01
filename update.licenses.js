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

const { readFileSync, writeFileSync } = require("fs");

require("glob")("{src,resources}{/**/*.js,/**/*.ts,/**/*.md}", { ignore: ["**/node_modules/**", "**/out/**"] }, (globErr, filePaths) => {
  if (globErr) {
    console.log(globErr);
    return;
  }

  let alreadyContainedCopyright = 0;
  const header =
    "/*\n" +
    readFileSync("LICENSE_HEADER")
      .toString()
      .split(/\r?\n/g)
      .map((line) => {
        return ("* " + line).trim();
      })
      .join(require("os").EOL) +
    require("os").EOL +
    "*/" +
    require("os").EOL +
    require("os").EOL;

  try {
    for (const filePath of filePaths) {
      const file = readFileSync(filePath);
      let result = file.toString();
      const resultLines = result.split(/\r?\n/g);
      if (resultLines.join().indexOf(header.split(/\r?\n/g).join()) >= 0) {
        alreadyContainedCopyright++;
        continue; // already has copyright
      }
      const shebangPattern = require("shebang-regex");
      let usedShebang = "";
      result = result.replace(shebangPattern, (fullMatch) => {
        usedShebang = fullMatch + "\n"; // save the shebang that was used, if any
        return "";
      });
      // remove any existing copyright
      // Be very, very careful messing with this regex. Regex is wonderful.
      result = result.replace(/\/\*[\s\S]*?(License|SPDX)[\s\S]*?\*\/[\s\n]*/i, "");
      result = header + result; // add the new header
      result = usedShebang + result; // add the shebang back
      writeFileSync(filePath, result);
    }
  } catch (e) {
    console.log(e);
  }
});
