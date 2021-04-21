import { commands, window, WebviewPanel } from "vscode";

export function getShowAttributesCommand() {
  return commands.registerCommand(
    "cics-extension-for-zowe.showAttributes",
    async (node) => {
      if (node) {
        const program = node.program;

        const attributeHeadings = Object.keys(program);
        let webText = `<tr><th class="headingTH">Attribute <input type="text" id="searchBox" /></th><th class="valueHeading">Value</th></tr>`;
        for (const heading of attributeHeadings) {
          webText += `<tr><th class="colHeading">${heading}</th><td>${program[heading]}</td></tr>`;
        }

        const webviewHTML = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>${program.program}"</title>
            <style>
            table {
              border:1px solid #eeeeee;
              width: 90%;
            }
            th {
              border:1px solid #eeeeee;
            }
            .colHeading {
              width: 30%;
            }
            td {
              border:1px solid #eeeeee;
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
            }
            </style>
        </head>
        <body>
        <h1>${program.program}</h1>
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
        const column = window.activeTextEditor
          ? window.activeTextEditor.viewColumn
          : undefined;
        const panel: WebviewPanel = window.createWebviewPanel(
          "zowe",
          `Attributes - ${program.program}`,
          column || 1,
          { enableScripts: true }
        );
        panel.webview.html = webviewHTML;
      } else {
        window.showErrorMessage("No CICS program selected");
      }
    }
  );
}

export function getShowRegionAttributes() {
  return commands.registerCommand(
    "cics-extension-for-zowe.showRegionAttributes",
    async (node) => {
      if (node) {
        const region = node.region;

        const attributeHeadings = Object.keys(region);
        let webText = `<tr><th class="headingTH">Attribute <input type="text" id="searchBox" /></th><th class="valueHeading">Value</th></tr>`;
        for (const heading of attributeHeadings) {
          webText += `<tr><th class="colHeading">${heading}</th><td>${region[heading]}</td></tr>`;
        }

        const webviewHTML = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>${region.applid}"</title>
            <style>
            table {
              border:1px solid #eeeeee;
              width: 90%;
            }
            th {
              border:1px solid #eeeeee;
            }
            .colHeading {
              width: 30%;
            }
            td {
              border:1px solid #eeeeee;
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
            }
            </style>
        </head>
        <body>
        <h1>${region.applid}</h1>
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
        const column = window.activeTextEditor
          ? window.activeTextEditor.viewColumn
          : undefined;
        const panel: WebviewPanel = window.createWebviewPanel(
          "zowe",
          `Attributes - ${region.applid}`,
          column || 1,
          { enableScripts: true }
        );
        panel.webview.html = webviewHTML;
      } else {
        window.showErrorMessage("No CICS region selected");
      }
    }
  );
}
