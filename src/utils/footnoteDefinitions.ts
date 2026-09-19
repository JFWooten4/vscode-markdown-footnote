export type FootnoteDefinition = {
  name: string;
  content: string;
  startOffset: number;
  endOffset: number;
  contentStartOffset: number;
  contentEndOffset: number;
};

type TextLine = {
  text: string;
  startOffset: number;
  endOffset: number;
};

function splitLines(text: string): TextLine[] {
  const lines: TextLine[] = [];
  let startOffset = 0;

  while (startOffset <= text.length) {
    const newlineOffset = text.indexOf('\n', startOffset);
    if (newlineOffset === -1) {
      const endOffset = text.length > startOffset && text[text.length - 1] === '\r' ? text.length - 1 : text.length;
      lines.push({
        text: text.slice(startOffset, endOffset),
        startOffset,
        endOffset,
      });
      break;
    }

    const endOffset = newlineOffset > startOffset && text[newlineOffset - 1] === '\r' ? newlineOffset - 1 : newlineOffset;
    lines.push({
      text: text.slice(startOffset, endOffset),
      startOffset,
      endOffset,
    });
    startOffset = newlineOffset + 1;

    if (startOffset === text.length) {
      lines.push({ text: '', startOffset, endOffset: startOffset });
      break;
    }
  }

  return lines;
}

function getContinuationContent(line: string): string | undefined {
  if (line.startsWith('\t')) {
    return line.slice(1);
  }
  if (line.startsWith('    ')) {
    return line.slice(4);
  }
  return undefined;
}

export function parseFootnoteDefinitions(text: string): FootnoteDefinition[] {
  const lines = splitLines(text);
  const definitions: FootnoteDefinition[] = [];

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];
    const match = /^\[\^([^\]\s]+)\]:(?:[ \t]?)(.*)$/.exec(line.text);
    if (!match) {
      continue;
    }

    const name = match[1];
    const firstLineContent = match[2];
    const contentStartInLine = line.text.length - firstLineContent.length;
    const contentLines = [firstLineContent];
    let contentEndOffset = line.endOffset;
    let definitionEndOffset = line.endOffset;
    let nextLineIndex = lineIndex + 1;

    while (nextLineIndex < lines.length) {
      const nextLine = lines[nextLineIndex];
      const continuationContent = getContinuationContent(nextLine.text);
      if (continuationContent !== undefined) {
        contentLines.push(continuationContent);
        contentEndOffset = nextLine.endOffset;
        definitionEndOffset = nextLine.endOffset;
        nextLineIndex += 1;
        continue;
      }

      const followingLine = lines[nextLineIndex + 1];
      if (nextLine.text === '' && followingLine && getContinuationContent(followingLine.text) !== undefined) {
        contentLines.push('');
        definitionEndOffset = nextLine.endOffset;
        nextLineIndex += 1;
        continue;
      }

      break;
    }

    definitions.push({
      name,
      content: contentLines.join('\n'),
      startOffset: line.startOffset,
      endOffset: definitionEndOffset,
      contentStartOffset: line.startOffset + contentStartInLine,
      contentEndOffset,
    });

    lineIndex = nextLineIndex - 1;
  }

  return definitions;
}

export function serializeFootnoteContent(content: string, eol = '\n'): string {
  return content
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line, index) => {
      if (index === 0 || line === '') {
        return line;
      }
      return `    ${line}`;
    })
    .join(eol);
}

export function getFootnoteDefinitionEndOffset(text: string, name: string): number | undefined {
  return parseFootnoteDefinitions(text).find((definition) => definition.name === name)?.endOffset;
}
