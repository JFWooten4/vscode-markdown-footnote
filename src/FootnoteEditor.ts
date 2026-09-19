import * as vscode from 'vscode';
import { parseFootnoteDefinitions, serializeFootnoteContent } from './utils/footnoteDefinitions';

type UpdateFootnoteMessage = {
  type: 'updateFootnote';
  name: string;
  content: string;
};

type ReadyMessage = {
  type: 'ready';
};

type WebviewMessage = UpdateFootnoteMessage | ReadyMessage;

export default class FootnoteEditor implements vscode.Disposable {
  private panel: vscode.WebviewPanel | undefined;
  private sourceUri: vscode.Uri | undefined;
  private webviewReady = false;
  private pendingFocusName: string | undefined;
  private applyingWebviewEdit = false;
  private webviewEditQueue: Promise<void> = Promise.resolve();
  private readonly disposables: vscode.Disposable[] = [];

  constructor() {
    this.disposables.push(
      vscode.workspace.onDidChangeTextDocument((event) => {
        if (
          this.applyingWebviewEdit ||
          !this.panel ||
          !this.sourceUri ||
          event.document.uri.toString() !== this.sourceUri.toString()
        ) {
          return;
        }
        void this.sync(event.document);
      }),
      vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (!this.panel || !editor || editor.document.languageId !== 'markdown') {
          return;
        }
        this.sourceUri = editor.document.uri;
        void this.sync(editor.document);
      }),
    );
  }

  async open(document: vscode.TextDocument, focusName?: string) {
    if (document.languageId !== 'markdown') {
      return;
    }

    this.sourceUri = document.uri;
    this.pendingFocusName = focusName;
    this.ensurePanel();
    this.panel!.reveal(vscode.ViewColumn.Beside, false);

    if (this.webviewReady) {
      await this.sync(document);
    }
  }

  dispose() {
    this.panel?.dispose();
    for (const disposable of this.disposables) {
      disposable.dispose();
    }
  }

  private ensurePanel() {
    if (this.panel) {
      return;
    }

    this.panel = vscode.window.createWebviewPanel(
      'vscodeMarkdownFootnote.editor',
      'Footnotes',
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      },
    );
    this.webviewReady = false;
    this.panel.webview.html = this.getHtml(this.panel.webview);
    this.panel.webview.onDidReceiveMessage(
      (message: WebviewMessage) => void this.handleMessage(message),
      undefined,
      this.disposables,
    );
    this.panel.onDidDispose(
      () => {
        this.panel = undefined;
        this.sourceUri = undefined;
        this.webviewReady = false;
        this.pendingFocusName = undefined;
      },
      undefined,
      this.disposables,
    );
  }

  private async handleMessage(message: WebviewMessage) {
    if (message.type === 'ready') {
      this.webviewReady = true;
      if (this.sourceUri) {
        const document = await vscode.workspace.openTextDocument(this.sourceUri);
        await this.sync(document);
      }
      return;
    }

    if (message.type !== 'updateFootnote' || !this.sourceUri) {
      return;
    }

    this.webviewEditQueue = this.webviewEditQueue.then(
      () => this.applyFootnoteUpdate(message),
      () => this.applyFootnoteUpdate(message),
    );
    await this.webviewEditQueue;
  }

  private async applyFootnoteUpdate(message: UpdateFootnoteMessage) {
    if (!this.sourceUri) {
      return;
    }

    const document = await vscode.workspace.openTextDocument(this.sourceUri);
    const definition = parseFootnoteDefinitions(document.getText()).find(({ name }) => name === message.name);
    if (!definition) {
      await this.sync(document);
      return;
    }

    const eol = document.eol === vscode.EndOfLine.CRLF ? '\r\n' : '\n';
    const edit = new vscode.WorkspaceEdit();
    edit.replace(
      document.uri,
      new vscode.Range(
        document.positionAt(definition.contentStartOffset),
        document.positionAt(definition.contentEndOffset),
      ),
      serializeFootnoteContent(message.content, eol),
    );

    this.applyingWebviewEdit = true;
    try {
      const applied = await vscode.workspace.applyEdit(edit);
      if (!applied) {
        await this.sync(document);
      }
    } finally {
      this.applyingWebviewEdit = false;
    }
  }

  private async sync(document: vscode.TextDocument) {
    if (!this.panel || !this.webviewReady || !this.sourceUri) {
      return;
    }

    if (document.uri.toString() !== this.sourceUri.toString()) {
      return;
    }

    const focusName = this.pendingFocusName;
    this.pendingFocusName = undefined;
    await this.panel.webview.postMessage({
      type: 'setFootnotes',
      fileName: document.fileName.split(/[\\/]/).pop() || document.fileName,
      footnotes: parseFootnoteDefinitions(document.getText()).map(({ name, content }) => ({ name, content })),
      focusName,
    });
  }

  private getHtml(webview: vscode.Webview) {
    const nonce = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const cspSource = webview.cspSource;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Footnotes</title>
  <style>
    body {
      margin: 0;
      padding: 0 14px 24px;
      color: var(--vscode-editor-foreground);
      background: var(--vscode-editor-background);
      font-family: var(--vscode-font-family);
    }
    header {
      position: sticky;
      top: 0;
      z-index: 1;
      padding: 12px 0 10px;
      background: var(--vscode-editor-background);
      border-bottom: 1px solid var(--vscode-panel-border);
    }
    #fileName {
      display: block;
      margin-top: 3px;
      color: var(--vscode-descriptionForeground);
      font-size: 0.9em;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    #empty {
      margin-top: 18px;
      color: var(--vscode-descriptionForeground);
    }
    .footnote {
      margin-top: 16px;
    }
    .footnote label {
      display: block;
      margin-bottom: 6px;
      font-family: var(--vscode-editor-font-family);
      font-weight: 600;
    }
    textarea {
      box-sizing: border-box;
      width: 100%;
      min-height: 110px;
      resize: vertical;
      padding: 9px 10px;
      color: var(--vscode-input-foreground);
      background: var(--vscode-input-background);
      border: 1px solid var(--vscode-input-border, transparent);
      font: inherit;
      line-height: 1.45;
      outline: none;
    }
    textarea:focus {
      border-color: var(--vscode-focusBorder);
    }
  </style>
</head>
<body>
  <header>
    <strong>Footnotes</strong>
    <span id="fileName"></span>
  </header>
  <div id="empty">No footnotes in this Markdown file.</div>
  <div id="list"></div>
  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    const list = document.getElementById('list');
    const empty = document.getElementById('empty');
    const fileName = document.getElementById('fileName');

    function render(message) {
      const hadFocus = document.hasFocus();
      const active = document.activeElement;
      const activeName = active && active.dataset ? active.dataset.name : undefined;
      const selectionStart = active && typeof active.selectionStart === 'number' ? active.selectionStart : undefined;
      const selectionEnd = active && typeof active.selectionEnd === 'number' ? active.selectionEnd : undefined;

      fileName.textContent = message.fileName || '';
      list.textContent = '';
      empty.hidden = message.footnotes.length > 0;

      for (const footnote of message.footnotes) {
        const section = document.createElement('section');
        section.className = 'footnote';

        const label = document.createElement('label');
        label.textContent = '[^' + footnote.name + ']';

        const textarea = document.createElement('textarea');
        textarea.value = footnote.content;
        textarea.dataset.name = footnote.name;
        textarea.setAttribute('aria-label', 'Footnote ' + footnote.name);
        textarea.addEventListener('input', () => {
          vscode.postMessage({
            type: 'updateFootnote',
            name: footnote.name,
            content: textarea.value,
          });
        });

        label.appendChild(textarea);
        section.appendChild(label);
        list.appendChild(section);
      }

      const targetName = message.focusName || (hadFocus ? activeName : undefined);
      if (!targetName) {
        return;
      }

      const target = Array.from(list.querySelectorAll('textarea')).find(
        (textarea) => textarea.dataset.name === targetName,
      );
      if (!target) {
        return;
      }

      requestAnimationFrame(() => {
        target.focus();
        if (message.focusName) {
          const end = target.value.length;
          target.setSelectionRange(end, end);
        } else if (selectionStart !== undefined && selectionEnd !== undefined) {
          target.setSelectionRange(selectionStart, selectionEnd);
        }
      });
    }

    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'setFootnotes') {
        render(event.data);
      }
    });

    vscode.postMessage({ type: 'ready' });
  </script>
</body>
</html>`;
  }
}
