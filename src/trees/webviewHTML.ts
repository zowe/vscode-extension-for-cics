export const addProfileHtml = () => {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Add Session</title>
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
    h1 {
      margin: 1.5rem 0;
      font-size: 2.6rem;
      color: var(--vscode-editor-foreground);
    }
    input,
    select {
      background-color: var(--vscode-editor-background);
      color: var(--vscode-editor-foreground);
      text-align: center;
      padding: 0.7rem 0;
      width: 70%;
      font-size: 1rem;
      border: 1px solid var(--vscode-editor-foreground);
      border-radius: 1rem;
    }
    .inputs {
      margin: 2rem 0;
      padding: 2rem 0;
      width: 80%;
      border: 1px solid var(--vscode-editor-foreground);
      border-radius: 1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      -webkit-box-shadow: 0px 0px 30px 6px rgba(238, 238, 238, 0.7);
      box-shadow: 0px 0px 30px 6px rgba(238, 238, 238, 0.7);
    }
    .input-container {
      display: flex;
      flex-direction: column;
      width: 80%;
      padding: 1rem 0;
    }
    .input-container > label,
    .input-half-container > label {
      width: 100%;
      color: var(--vscode-editor-foreground);
      padding: 1rem 0;
      font-size: 1.2rem;
    }
    .input-container > input,
    .input-container > select,
    .input-half-container > input,
    .input-half-container > select {
      width: 100%;
    }
    .inputs > button {
      width: 40%;
      padding: 0.5rem 0;
      font-size: 1.2rem;
    }
    .select-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
      width: 80%;
    }
    .input-half-container {
      width: 40%;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
  </style>
  <body>
    <div class="inputs">
      <h1>Add Session</h1>
      <div class="input-container">
        <label for="sessionName">Name of the profile: </label>
        <input type="text" id="sessionName" />
      </div>

      <div class="input-container">
        <label for="sessionHost">Host: </label>
        <input type="text" id="sessionHost" />
      </div>

      <div class="input-container">
        <label for="sessionPort">Port: </label>
        <input type="text" id="sessionPort" />
      </div>

      <div class="input-container">
        <label for="sessionUser">User: </label>
        <input type="text" id="sessionUser" />
      </div>

      <div class="input-container">
        <label for="sessionPassword">Password: </label>
        <input type="password" id="sessionPassword" />
      </div>

      <div class="select-container">
        <div class="input-half-container">
          <label for="sessionRegion">Region: </label>
          <input type="text" id="sessionRegion" />
        </div>

        <div class="input-half-container">
          <label for="sessionCicsPlex">Cics Plex: </label>
          <input type="text" id="sessionCicsPlex" />
        </div>
      </div>

      <div class="select-container">
        <div class="input-half-container">
          <label for="sessionProtocol">Protocol: </label>
          <select id="sessionProtocol">
            <option value="http">HTTP</option>
            <option value="https">HTTPS</option>
          </select>
        </div>
        <div class="input-half-container">
          <label for="sessionRejectUnauthorised">Reject Unauthorised: </label>
          <select id="sessionRejectUnauthorised">
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        </div>
      </div>

      <button onclick="createSession()">Create Profile</button>
    </div>

    <script>
      function createSession() {
        const session = {
          type: "basic",
          hostname: document.getElementById("sessionHost").value,
          port: parseInt(document.getElementById("sessionPort").value),
          user: document.getElementById("sessionUser").value,
          password: document.getElementById("sessionPassword").value,
          rejectUnauthorized:
            document.getElementById("sessionRejectUnauthorised").value ===
            "true"
              ? true
              : false,
          protocol: document.getElementById("sessionProtocol").value,
        };
        const data = {
          session: session,
          name: document.getElementById("sessionName").value,
          region: document.getElementById("sessionRegion").value,
          cicsPlex: document.getElementById("sessionCicsPlex").value,
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
