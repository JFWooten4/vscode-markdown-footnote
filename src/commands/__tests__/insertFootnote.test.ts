import * as vscode from 'vscode';
import insertFootnote from '../insertFootnote';

jest.mock('vscode');

describe('insertFootnote', () => {
  it('does not edit the document when the footnote prompt is cancelled', async () => {
    const edit = jest.fn();
    const editor = {
      document: {
        getText: jest.fn(() => 'Text without footnotes'),
      },
      edit,
      selection: { start: {} },
    };

    (vscode.window as any).activeTextEditor = editor;
    (vscode.window as any).showInputBox = jest.fn().mockResolvedValue(undefined);

    await insertFootnote();

    expect((vscode.window as any).showInputBox).toHaveBeenCalledTimes(1);
    expect(edit).not.toHaveBeenCalled();
  });
});
