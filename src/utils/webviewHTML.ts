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

export const addProfileHtml = () => {
  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Create CICS Profile</title>
  
      <link
        rel="stylesheet"
        href="https://unpkg.com/carbon-components/css/carbon-components.min.css"
      />
    </head>
    <style>
      :root {
        font-size: 16px;
      }
      * {
        padding: 0;
        margin: 0;
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
      }
      body {
        width: 100%;
        height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;

        background-color: var(--vscode-editor-background);
      }
  
      /*       color: var(--vscode-editor-foreground);  */
  
      .bx--content {
        width: 90%;
        display: flex;
        flex-direction: column;
        align-items: center;

        background-color: var(--vscode-editor-background);
      }
  
      .two-input-container {
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        width: 100%;
        padding: 1rem 0;
      }
      .port-container {
        max-width: 20%;
        min-width: 75px;
      }
  
      .host-container {
        max-width: 70%;
        min-width: 250px;
      }
  
      .select-container {
        max-width: 40%;
        padding: 1rem 0;
      }
  
      .user-input {
        max-width: 46%;
      }
  
      h2 {
        padding: 1rem 0;
      }

      h1, h2, p, label {
        color: var(--vscode-editor-foreground) !important;
      }
    </style>
    <body>
      <div class="bx--content">
        <h1>Create CICS Profile</h1>
  
        <div
          class="
            bx--form-item bx--text-input-wrapper
            host-container
            two-input-container
          "
        >
          <label for="name-input" class="bx--label">Profile Name</label>
          <div class="bx--text-input__field-wrapper">
            <input
              id="name-input"
              type="text"
              class="bx--text-input"
              placeholder="This name is used to identify the profile"
            />
          </div>
        </div>
  
        <h2>Connection Details</h2>
  
        <div class="two-input-container">
          <div class="bx--form-item bx--text-input-wrapper host-container">
            <label for="host-input" class="bx--label">Host URL</label>
            <div class="bx--text-input__field-wrapper">
              <input
                id="host-input"
                type="text"
                class="bx--text-input"
                placeholder="example.cics.host.com"
              />
            </div>
          </div>
  
          <div class="bx--form-item bx--text-input-wrapper port-container">
            <label for="port-input" class="bx--label">Port</label>
            <div class="bx--text-input__field-wrapper">
              <input
                id="port-input"
                type="text"
                class="bx--text-input"
                placeholder="12345"
              />
            </div>
          </div>
        </div>
  
        <div class="two-input-container">
          <div class="bx--form-item select-container">
            <div class="bx--select">
              <label for="protocol-select" class="bx--label">Protocol</label>
              <div class="bx--select-input__wrapper">
                <select id="protocol-select" class="bx--select-input">
                  <option class="bx--select-option" value="https" selected>
                    HTTPS
                  </option>
                  <option class="bx--select-option" value="http">HTTP</option>
                </select>
                <svg
                  focusable="false"
                  preserveAspectRatio="xMidYMid meet"
                  style="will-change: transform"
                  xmlns="http://www.w3.org/2000/svg"
                  class="bx--select__arrow"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                >
                  <path d="M8 11L3 6 3.7 5.3 8 9.6 12.3 5.3 13 6z"></path>
                </svg>
              </div>
            </div>
          </div>
  
          <div class="bx--form-item select-container">
            <div class="bx--select">
              <label for="ruSelect" class="bx--label">Reject Unauthorized</label>
              <div class="bx--select-input__wrapper">
                <select id="ruSelect" class="bx--select-input">
                  <option class="bx--select-option" value="true" selected>
                    True
                  </option>
                  <option class="bx--select-option" value="false">False</option>
                </select>
                <svg
                  focusable="false"
                  preserveAspectRatio="xMidYMid meet"
                  style="will-change: transform"
                  xmlns="http://www.w3.org/2000/svg"
                  class="bx--select__arrow"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                >
                  <path d="M8 11L3 6 3.7 5.3 8 9.6 12.3 5.3 13 6z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
  
        <h2>User Details</h2>
  
        <div class="two-input-container">
          <div class="bx--form-item bx--text-input-wrapper user-input">
            <label for="user-input" class="bx--label">User ID</label>
            <div class="bx--text-input__field-wrapper">
              <input
                id="user-input"
                type="text"
                class="bx--text-input"
                placeholder=""
              />
            </div>
          </div>
  
          <div class="bx--form-item bx--text-input-wrapper user-input">
            <label for="password-input" class="bx--label">Password</label>
            <div class="bx--text-input__field-wrapper">
              <input
                id="password-input"
                type="password"
                class="bx--text-input"
                placeholder=""
              />
            </div>
          </div>
        </div>
        <h2>CICS Details</h2>
  
        <p>Only 1 of the below is required</p>
  
        <div class="two-input-container">
          <div class="bx--form-item bx--text-input-wrapper user-input">
            <label for="region-input" class="bx--label">Region Name</label>
            <div class="bx--text-input__field-wrapper">
              <input
                id="region-input"
                type="text"
                class="bx--text-input"
                placeholder=""
              />
            </div>
          </div>
  
          <div class="bx--form-item bx--text-input-wrapper user-input">
            <label for="plex-input" class="bx--label">Plex Name</label>
            <div class="bx--text-input__field-wrapper">
              <input
                id="plex-input"
                type="text"
                class="bx--text-input"
                placeholder=""
              />
            </div>
          </div>
        </div>
        <button
          onclick="createSession()"
          class="bx--btn bx--btn--primary"
          type="button"
        >
          Create Profile
        </button>
      </div>
  
      <script>
        function createSession() {
          let data = {
            profile: {
              name: document.getElementById("name-input").value.toString().trim(),
              hostname: document.getElementById("host-input").value,
              port: parseInt(document.getElementById("port-input").value),
              user: document.getElementById("user-input").value,
              password: document.getElementById("password-input").value,
              rejectUnauthorized:
                document.getElementById("ruSelect").value === "true" ? true : false,
              protocol: document.getElementById("protocol-select").value,
              cicsPlex: document.getElementById("plex-input").value.toString().trim().length === 0 ? undefined : document.getElementById("plex-input").value.toString().trim(),
              regionName: document.getElementById("region-input").value.toString().trim().length === 0 ? undefined : document.getElementById("region-input").value.toString().trim(),
            },
            name: document.getElementById("name-input").value.toString().trim(),
            type: "CICS",
            overwrite: true,
          };

          const vscode = acquireVsCodeApi();
          vscode.postMessage(data);
        }

      </script>
    </body>
  </html>
  
  
`;
};

export const getAttributesHtml = (title: string, webText: string) => {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <title>${title}"</title>
      <style>
      * {
        background-color: var(--vscode-editor-background);
        color: var(--vscode-editor-foreground);
      }
      table {
        border:1px solid var(--vscode-editor-foreground);
        width: 90%;
      }
      th {
        border:1px solid var(--vscode-editor-foreground);
      }
      .colHeading {
        width: 30%;
      }
      td {
        border:1px solid var(--vscode-editor-foreground);
        padding: 1rem 0.5rem;
      }
      h1 {
        width: 100%;
        text-align: center;
        padding: 0.5rem 0;
        text-decoration: underline;
      }
      .valueHeading {
        padding: 0.7rem 0.5rem;
        text-align: left;
      }
      .headingTH {
        padding: 0.7rem 0.5rem;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      div {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }
      input {
        text-align: center;
        margin: 0.2rem 0;
        border:1px solid var(--vscode-editor-foreground);
        border-radius: 5px;
      }
      </style>
  </head>
  <body>
  <h1>${title}</h1>
  <div>
  <table id="resultsTable">
  ${webText}
  </table>
  
  </div>
  <script>
    document.getElementById("searchBox").addEventListener("keyup", (e) => {
      let tableRows = document.getElementsByTagName("tr");
      for(let row of tableRows){
        if(row.children[1].innerText !== 'Value'){
          row.style.display = 
              row.children[0].innerText.includes(e.target.value) ? '' : 'none';  
        }
      }
    });
  </script>
  </body>
  </html>`;
};
