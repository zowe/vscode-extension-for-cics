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

import { IUpdateProfile } from "@zowe/imperative";

export const addProfileHtml = (message?: IUpdateProfile) => {
  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${message ? "Update" : "Create"} CICS Profile</title>
  
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
  
      .bx--content {
        width: 90%;
        display: flex;
        flex-direction: column;
        align-items: left;

        background-color: var(--vscode-editor-background);
      }
  
      .two-input-container {
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        width: 100%;
        padding: 1rem 0;
      }
      .three-input-container {
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        width: 100%;
        padding: 1rem 0;
      }
      .TLScontainer{
        padding: 0 0 0 0;
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

      .float-child-left {
        width: 35%;
        float: left;
        text-align: left;
        width:fit-content;
        padding: 0% 3% 0% 0%;
      } 
      .float-child-right {
        width: 65%;
        float: left;
        text-align: left;
        width:fit-content;
      } 

      h1, h2, h3, h4, p, label {
        color: var(--vscode-editor-foreground) !important;
      }

      p {
        text-align: left;
      }
    </style>
    <body onload="initialize()">
      <div class="bx--content">
        <div style="padding:0 0 1rem 0 ">

        </div>
        <h3 style="text-align:left">Connection Details</h3>
  
        <div class="three-input-container">
          <div style="width: 20%; padding: 0% 2% 0% 0%">
              <div class="bx--select">
                <label for="protocol-select" class="bx--label">Protocol</label>
                <div class="bx--select-input__wrapper">
                  <select id="protocol-select" class="bx--select-input" onload="renderRU()" onchange="renderRU()">
                    <option class="bx--select-option" value="http" ${message?.profile!.protocol === "http" ? `selected="selected"` : ""}>
                      HTTP
                    </option>
                    <option class="bx--select-option" value="https" ${message?.profile!.protocol === "https" ? `selected="selected"` : ""}>
                      HTTPS
                    </option>
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

          <div style="width: 60%; padding: 0% 1% 0% 1%">
              <label for="host-input" class="bx--label">Host URL</label>
              <div class="bx--text-input__field-wrapper">
                <input
                  id="host-input"
                  type="text"
                  class="bx--text-input"
                  placeholder="example.cics.host.com"
                  oninput="handleHostInputName()"
                  ${message?.profile!.host ? `value =${message.profile.host}` : undefined}
                />
              </div>
          </div>
  
          <div style="width: 20%; padding: 0% 0% 0% 2%">
            <label for="port-input" class="bx--label">Port</label>
            <div class="bx--text-input__field-wrapper">
              <input
                id="port-input"
                type="text"
                class="bx--text-input"
                placeholder="12345"
                ${message?.profile!.port ? `value =${message.profile.port}` : undefined}
              />
            </div>
          </div>
        </div>
  


          <div class="TLScontainer" id="ru-selection-container" width:100%">

              <div class="float-child-left">
                <label style="font-size:16px">Only accept trusted TLS certificates</label>
              </div>
              <div class="float-child-right">
                <div class="bx--radio-button-group ">
                  <div class="bx--radio-button-wrapper">
                    <input id="radio-button-true" class="bx--radio-button" type="radio" value="true" name="radio-button" tabindex="0" ${message?.profile!.rejectUnauthorized ? `checked="checked"` : ""}>
                    <label for="radio-button-true" class="bx--radio-button__label">
                      <span class="bx--radio-button__appearance" style="background-color:white"></span>
                      <span class="bx--radio-button__label-text">True</span>
                    </label>
                  </div>

                  <div class="bx--radio-button-wrapper">
                    <input id="radio-button-false" class="bx--radio-button" type="radio" value="false" name="radio-button" tabindex="0" ${!message?.profile!.rejectUnauthorized ? `checked="checked""` : ""}>
                    <label for="radio-button-false" class="bx--radio-button__label">
                      <span class="bx--radio-button__appearance" style="background-color:white"></span>
                      <span class="bx--radio-button__label-text">False</span>
                    </label>
                  </div>

                </div>
              </div>


          </div>

          <div class="two-input-container">
            <label for="name-input" class="bx--label">Profile Name</label>
            <div class="bx--text-input__field-wrapper">
              <input
                id="name-input"
                type="text"
                class="bx--text-input"
                placeholder="This name is used to identify the profile"
                onchange=(function(){inputFieldChanged=true;})()
                ${message?.name ? `value =${message.name}` : undefined}
                ${message ? `readonly` : ""}
                
              />
            </div>
          </div>
  
        <h3>User Details</h3>
  
        <div class="two-input-container">
          <div style="width:50%; padding: 0 1.5% 0 0">
            <label for="user-input" class="bx--label">User ID</label>
            <div class="bx--text-input__field-wrapper">
              <input
                id="user-input"
                type="text"
                class="bx--text-input"
                placeholder=""
                ${message?.profile!.user ? `value =${message.profile.user}` : undefined}
              />
            </div>
          </div>
  
          <div style="width:50%; padding: 0 0 0 1.5%">
            <label for="password-input" class="bx--label">Password</label>
            <div class="bx--text-input__field-wrapper">
              <input
                id="password-input"
                type="password"
                class="bx--text-input"
                placeholder=""
                ${message?.profile!.password ? `value =${message.profile.password}` : undefined}
              />
            </div>
          </div>
        </div>
        <h3>CICS Details <span style="font-size:20px"><em>(Optional)</em></span></h3>
  
        <p>Narrow down the search by specifying a plex, or a plex AND a region/system group for profiles that contain plexes. Otherwise specify a region/system group.</p>
  
        <div class="two-input-container">
          <div style="width:50%; padding: 0 1.5% 0 0">
            <label for="region-input" class="bx--label">Region Name or System Group</label>
            <div class="bx--text-input__field-wrapper">
              <input
                id="region-input"
                type="text"
                class="bx--text-input"
                placeholder=""
                ${message?.profile!.regionName ? `value =${message.profile.regionName}` : undefined}
              />
            </div>
          </div>
  
          <div style="width:50%; padding: 0 0 0 1.5%">
            <label for="plex-input" class="bx--label">Plex Name</label>
            <div class="bx--text-input__field-wrapper">
              <input
                id="plex-input"
                type="text"
                class="bx--text-input"
                placeholder=""
                ${message?.profile!.cicsPlex ? `value =${message.profile.cicsPlex}` : undefined}
              />
            </div>
          </div>
        </div>
        <button
          onclick="createSession()"
          class="bx--btn bx--btn--primary"
          style="width:30%"
          type="button">${message ? "Update" : "Create"} Profile</button>
      </div>
  
      <script>

        let inputFieldChanged = false;

        function createSession() {
          let data = {
            profile: {
              name: document.getElementById("name-input").value.toString().trim(),
              host: document.getElementById("host-input").value,
              port: parseInt(document.getElementById("port-input").value),
              user: document.getElementById("user-input").value,
              password: document.getElementById("password-input").value,
              rejectUnauthorized:
                checkRadioButtons() === "true" ? true : false,
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
        };

        function checkRadioButtons() {
          const radios = document.getElementsByName("radio-button");
          for (var i = 0, length = radios.length; i < length; i++) {
            if (radios[i].checked) {
              return radios[i].value;
            }
          }
        }

        function onLoadRenderRU() {
          if (${message?.profile!.protocol === "https"}) {
            setContentsEnabled("ru-selection-container");
          } else if (${message?.profile!.protocol === "http"}) {
            setContentsDisabled("ru-selection-container");
          }
        }

        function renderRU() {
          if (document.getElementById("protocol-select").value === "https") {
            setContentsEnabled("ru-selection-container");
          } else if (document.getElementById("protocol-select").value === "http") {
            setContentsDisabled("ru-selection-container");
          }
        }

        function setContentsDisabled(id) {
          const nodes = document.getElementById(id).getElementsByTagName('*');
          for(let i = 0; i < nodes.length; i++){
               nodes[i].disabled = true;
          }
        }

        function setContentsEnabled(id) {
          const nodes = document.getElementById(id).getElementsByTagName('*');
          for(let i = 0; i < nodes.length; i++){
               nodes[i].disabled = false;
          }
        }

        function setFocusToInputBox(){
          document.getElementById("host-input").focus();
        }

        function initialize(){
          setFocusToInputBox();
          renderRU();
        }

        function handleHostInputName(){
          if (${!message}){
            if(document.getElementById("name-input").value===""){
              inputFieldChanged=false;
            }
            if(!inputFieldChanged){
              document.getElementById("name-input").value = document.getElementById("host-input").value.split(".")[0];
            }
          }
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
      <title>${title}</title>
      <style>
      * {
        background-color: var(--vscode-editor-background);
        color: var(--vscode-editor-foreground);
      }

      thead th {
        position: sticky;
        top: 0;
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
        padding: 0.3rem 0.5rem;
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
              row.children[0].innerText.toUpperCase().includes(e.target.value.toUpperCase()) ? '' : 'none';  
        }
      }
    });
  </script>
  </body>
  </html>`;
};
