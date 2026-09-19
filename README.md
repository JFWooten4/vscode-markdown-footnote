<p align="center" style="margin: 0">
  <a href="https://marketplace.visualstudio.com/items?itemName=houkanshan.vscode-markdown-footnote" ><img src="./assets/markdown-footnote.png" alt="VSCode Markdown Footnote" width="80" /></a>
</p>
<h1 align="center" style="margin-top: 0">VSCode Markdown Footnote</h1>

[![](https://vsmarketplacebadge.apphb.com/version-short/houkanshan.vscode-markdown-footnote.svg)](https://marketplace.visualstudio.com/items?itemName=houkanshan.vscode-markdown-footnote)
[![](https://vsmarketplacebadge.apphb.com/installs/houkanshan.vscode-markdown-footnote.svg)](https://marketplace.visualstudio.com/items?itemName=houkanshan.vscode-markdown-footnote)
[![](https://vsmarketplacebadge.apphb.com/rating-short/houkanshan.vscode-markdown-footnote.svg)](https://marketplace.visualstudio.com/items?itemName=houkanshan.vscode-markdown-footnote&ssr=false#review-details)
[![](https://github.com/houkanshan/vscode-markdown-footnote/workflows/CI/badge.svg?branch=master)](https://github.com/houkanshan/vscode-markdown-footnote/actions?query=workflow%3ACI+branch%3Amaster)

`[^1]` [footnote syntax](https://www.markdownguide.org/extended-syntax/#footnotes) support to VS Code's Markdown editor and preview.

## Features


- Hover to preview and jump between footnote reference and content by <kbd>cmd</kbd> / <kbd>ctrl</kbd> + <kbd>click</kbd>.

  ![Hover preview](assets/hover.png)

- Peek editor for quick editing and preview.

  ![Peek footnote content](assets/peek-content.png)

  ![Peek footnote references](assets/peek-references.png)

- Command for inserting new footnote

  ![Click to create a new footnote](assets/click-to-create.png)

  ![Use command to insert a footnote](assets/command-to-insert.png)

- Render footnotes in the built-in markdown preview.

  ![Preview](assets/preview.png)

### TODO

- Support multiline footnote content.
- Support `pandoc-citeproc` format [citations](https://crsh.github.io/papaja_man/writing.html#citations)

## Build and use this fork locally

This fork does not need to be published to the VS Code Marketplace. You can run it directly from the source checkout while developing, or package it as a local `.vsix` and install it into your normal VS Code profile.

### Prerequisites

Install:

- [Visual Studio Code](https://code.visualstudio.com/)
- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) with npm

### 1. Clone and install dependencies

```sh
git clone https://github.com/JFWooten4/vscode-markdown-footnote.git
cd vscode-markdown-footnote
npm install
```

### 2. Compile the extension

```sh
npx tsc -p .
```

The compiled JavaScript is written to the `out/` directory.

### 3. Run it directly for development

Open the repository in VS Code:

```sh
code .
```

Then press <kbd>F5</kbd>, or open **Run and Debug** and choose **Run Extension**.

VS Code will compile the extension and open a separate **Extension Development Host** window with this checkout loaded. You can test the extension there without installing or publishing anything.

After changing the source, stop the development host and press <kbd>F5</kbd> again to rebuild and relaunch it.

### 4. Install this fork into your normal VS Code

Package the current checkout as a local VS Code extension:

```sh
npx vsce package --out markdown-footnote-local.vsix
```

Install that file:

```sh
code --install-extension markdown-footnote-local.vsix --force
```

If the `code` command is not available in your shell, open VS Code, go to the **Extensions** view, open the **...** menu, choose **Install from VSIX...**, and select `markdown-footnote-local.vsix`.

Reload VS Code after installation if prompted.

### Rebuild after making changes

To replace the locally installed copy with a new build:

```sh
npx tsc -p .
npx vsce package --out markdown-footnote-local.vsix
code --install-extension markdown-footnote-local.vsix --force
```

No Marketplace publishing step is required.

## Contributing

- File bugs, feature requests in [GitHub Issues](https://github.com/houkanshan/vscode-markdown-footnote/issues).
- Leave a review on [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=houkanshan.vscode-markdown-footnote&ssr=false#review-details).

### Dev

- Fork this repository
- `npm install`
- Create your feature branch: `git checkout -b my-new-feature`
- Make changes and add tests
- `npm run test:watch` and check your changes by pressing `F5`
- Commit your changes: `git commit -am 'feat: Add some feature'`
- Push to the branch: `git push origin my-new-feature`
- Submit a pull request

## Thanks

- [Markdown Footnotes](https://github.com/mjbvz/vscode-markdown-footnotes)
- [Markdown Memo](https://github.com/svsool/vscode-memo)

## Changelog

See changelog [here](./CHANGELOG.md).
