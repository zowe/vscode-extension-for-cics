# Zowe Explorer for IBM CICS extension Troubleshooting

Check that the [source of the error](https://github.com/zowe/vscode-extension-for-cics#checking-the-source-of-an-error) is from the Zowe Explorer for IBM CICS before refering to the troubleshooting documentation.

## `Socket is closed` error

If a socket closed error occurs when trying to connect to a profile with an IP address for the hostname, try switching to the DNS name for the CICS CMCI connection instead.