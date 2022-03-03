## Install the vNext Release version

### Install vNext

**Follow these steps**:

1. Download the [vNext-enabled Zowe Explorer for IBM CICS version](https://github.com/zowe/vscode-extension-for-cics/releases) from the Zowe Explorer for IBM CICS Github release page.
2. Open Visual Studio Code.
3. Navigate to the **Extensions** side-bar tab.
4. Click the three dots on the top right-hand corner of the side-bar window and select **Install from VSIX**.
4. Select the .vsix file to install.
5. Reload your Visual Studio Code window.

**Important:** Please use `Zowe Explorer v2.0.0-next.202202221200` or higher with this extension.

### Load a Profile

**Follow these steps**:

1. Navigate to the explorer tree.
2. Hover over **CICS**.
3. Click the `+` icon.
4. From the drop-down menu, select the profile that you want to use.

You can now use your global or project-specific profile.

## Profile Configuration

The global profile functionality simplifies profile management by enabling you to edit, store, and share mainframe configuration details in one location. You can use a text editor or an IDE to populate configuration files with connection details for your mainframe services. By default, your global configuration file is located in .zowe home folder, whereas a project-level configuration file is located in the main directory of your project.

**Note**: A project context takes precedence over global configuration.

### Manage a Profile

To add, delete, or update a profile, you must edit the team configuration file directly.

### Add a Profile

**Important:** Please ensure the cics entry is in the `zowe.schema.json` file. See [FAQs](#faqs) for more details.

**Follow these steps**:

1. Navigate to your project or global (loacted in `.zowe` folder) level Team Configuration file.
2. Open the `zowe.config.json` file.
3. Add a profile with cics properties inside `profiles`. e.g.
```
"profiles": {
   ...
   "cics_example": {
      "type": "cics",
      "properties": {
            "host": "replace-with-host-name",
            "port": replace-with-port-number,
            "rejectUnauthorized": true,
            "protocol": "http",
            "cicsPlex": "replace-with-plex-name",
            "user": "replace-with-user",
            "password": "replace-with-password"
      }
   },
   ...
}
```
4. Save the file and then refresh Zowe Explorer. 

   To refresh Zowe Explorer, cick the refresh icon inline with the Data Sets, USS or JOBS view. 

   Alternatively, press F1 to open the command palette, type and execute the **Zowe Explorer: Refresh Zowe Explorer** option.

### Update or Delete a Profile
**Follow these steps**:

1. Right-click on your profile.
2. Select the **Update Profile**, or **Delete Profile** options to edit the zowe config file in place.

   **Tip**: Use the Intellisense prompts if you need assistance with filling parameters in the .json file.

3. a. **If the profile you want to modify has been loaded into the CICS view**:

      - Refresh the view by clicking the refresh icon in the Data Sets, USS, or Jobs view.

      - Alternatively, press F1 to open the command palette, type and execute the **Zowe Explorer: Refresh Zowe Explorer** option.
   
   b. **Otherwise**:
   -  Press F1 to open the command palette, then select and execute the `Reload Window` command to reload Visual Studio Code.

### Creating a Team Configuration File

You can create a Team Configuration file either through the Zowe CLI, or via the Zowe Explorer GUI by clicking the `+` icon on the Data Sets, USS, or Jobs view.

### Adding a CICS Entry to the Schema File

To use the extension, you **MUST** have a cics plugin entry in the `zowe.schema.json` file. The entry is automatically added if:
   1. Zowe CLI has been installed and Zowe CLI CICS Plugin has also been installed.
   2. The team config file is created via the Zowe Explorer GUI i.e. by clicking the `+` icon on the Data Sets, USS, or Jobs view.

If you do not satisfy either of these requirements, you must add to the schema file manually.

To add it manually:

1. Navigate to your project or global (loacted in `.zowe` folder) level Team Configuration file.
2. Open the `zowe.schema.json` file.
3. Add the following entry to the `allOf` array:

```
{
   "if": {
      "properties": {
         "type": {
               "const": "cics"
         }
      }
   },
   "then": {
      "properties": {
         "properties": {
               "type": "object",
               "title": "CICS Profile",
               "description": "A cics profile is required to issue commands in the cics command group that interact with CICS regions. The cics profile contains your host, port, user name, and password for the IBM CICS management client interface (CMCI) server of your choice.",
               "properties": {
                  "host": {
                     "type": "string",
                     "description": "The CMCI server host name"
                  },
                  "port": {
                     "type": "number",
                     "description": "The CMCI server port",
                     "default": 1490
                  },
                  "user": {
                     "type": "string",
                     "description": "Your username to connect to CICS"
                  },
                  "password": {
                     "type": "string",
                     "description": "Your password to connect to CICS"
                  },
                  "regionName": {
                     "type": "string",
                     "description": "The name of the CICS region name to interact with"
                  },
                  "cicsPlex": {
                     "type": "string",
                     "description": "The name of the CICSPlex to interact with"
                  },
                  "rejectUnauthorized": {
                     "type": "boolean",
                     "description": "Reject self-signed certificates.",
                     "default": true
                  },
                  "protocol": {
                     "type": "string",
                     "description": "Specifies CMCI protocol (http or https).",
                     "default": "https",
                     "enum": [
                           "http",
                           "https"
                     ]
                  }
               },
               "required": [
                  "host"
               ]
         },
         "secure": {
               "prefixItems": {
                  "enum": [
                     "user",
                     "password"
                  ]
               }
         }
      }
   }
}
```
4. Add the following to the `properties.defaults.properties` object:
```
"cics": {
   "type": "string"
}
```
5. Save and press F1 to open the command palette, then select and execute the `Reload Window` command to reload Visual Studio Code.

**Note:** The need to add this manually will get removed in a future release.

## FAQs
**Q:** Will the CICS extension support my v1 profiles?

**A:** v1 profiles are **not** intended to be fully supported with the **first** techical preview release. You may still be able to load v1 profiles, but commands including delete profile and adding a new connection will not work. This will be addressed in a future release. Please set up a Team configuration file either by using the Zowe CLI or the Zowe Explorer `+` icon.

<br/>

**Q:** Can I use a base profile to store shared profile information?

**A:** Yes

<br/>

**Q:** Why am I being told to check my `zowe.schema.json` file?

**A:** This message appears when a CICS profile is not detected. This is likely to be caused by the absence of a CICS entry in the schema file. Please follow the steps on [Adding a CICS Entry to the Schema File](#adding-a-cics-entry-to-the-schema-file).

<br/>

**Q:** Do I need the Zowe CLI installed?

**A:** No. However, the CICS extension requires the CICS schema entry in `zowe.schema.json` which is automatically added when the Zowe CLI CICS plugin is added to Zowe CLI or when a Team Configuration file is added via the Zowe Explorer's `+` icon. See [Adding a CICS Entry to the Schema File](#adding-a-cics-entry-to-the-schema-file) for more details.

<br/>

**Q:** Can I use any version of Zowe Explorer with the Zowe Explorer for IBM CICS vNext release?

**A:** Please use Zowe Explorer `v2.0.0-next.202202221200` or higher with this extension. Previous versions can result in unexpected behaviour.