module.exports = {
  branches: [
    {
      name: "main",
      level: "minor",
    },
    {
      name: "v1-lts",
      level: "patch",
    },
    {
        name: "next",
        prerelease: true,
    }
  ],
  plugins: [
    [
      "@octorelease/vsce",
      {
        ovsxPublish: true,
        vscePublish: true,
        vsixDir: "dist",
      },
    ],
    [
      "@octorelease/github",
      {
        assets: ["dist/*.vsix"],
        draftRelease: true,
      },
    ],
    "@octorelease/git",
  ],
};