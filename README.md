<p align="center" style="margin: 0">
  <a href="https://github.com/JFWooten4/vscode-markdown-footnote"><img src="./assets/markdown-footnote.png" alt="VSCode Markdown Footnote" width="80" /></a>
</p>
<h1 align="center" style="margin-top: 0">VSCode Markdown Footnote</h1>

[![CI](https://github.com/JFWooten4/vscode-markdown-footnote/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/JFWooten4/vscode-markdown-footnote/actions/workflows/ci.yml)

`[^1]` [footnote syntax](https://www.markdownguide.org/extended-syntax/#footnotes) support to VS Code's Markdown editor and preview.


> This repository is a maintained fork of [houkanshan/vscode-markdown-footnote](https://github.com/houkanshan/vscode-markdown-footnote) by Mai Hou. The upstream work was distributed under the MIT License; its original copyright and permission notice are retained in [`LICENSE-base`](./LICENSE-base). This fork and its modifications are distributed under the GNU Affero General Public License version 3 or, at your option, any later version; see [`LICENSE`](./LICENSE).

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

## Contributing

- File bugs and feature requests in [GitHub Issues](https://github.com/JFWooten4/vscode-markdown-footnote/issues).

### Dev

- Fork this repository
- `npm install`
- Create your feature branch: `git checkout -b my-new-feature`
- Make changes and add tests
- `npm test:watch` and check your changes by pressing `F5`
- Commit your changes: `git commit -am 'feat: Add some feature'`
- Push to the branch: `git push origin my-new-feature`
- Submit a pull request

## Thanks

- [Mai Hou's original VSCode Markdown Footnote project](https://github.com/houkanshan/vscode-markdown-footnote)
- [Markdown Footnotes](https://github.com/mjbvz/vscode-markdown-footnotes)
- [Markdown Memo](https://github.com/svsool/vscode-memo)

## License

This fork is licensed under the [GNU Affero General Public License v3.0 or later](./LICENSE).

The upstream code by Mai Hou was originally distributed under the MIT License. Its original copyright and permission notice are preserved in [`LICENSE-base`](./LICENSE-base).

## Changelog

See changelog [here](./CHANGELOG.md).
