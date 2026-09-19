import {
  getFootnoteDefinitionEndOffset,
  parseFootnoteDefinitions,
  serializeFootnoteContent,
} from '../footnoteDefinitions';

describe('parseFootnoteDefinitions', () => {
  it('parses single-line footnotes', () => {
    const text = 'Text[^one]\n\n[^one]: First note\n[^two]: Second note';

    expect(
      parseFootnoteDefinitions(text).map(({ name, content }) => ({ name, content })),
    ).toEqual([
      { name: 'one', content: 'First note' },
      { name: 'two', content: 'Second note' },
    ]);
  });

  it('parses indented multiline footnotes without consuming following text', () => {
    const text = [
      'Text[^multi]',
      '',
      '[^multi]: First line',
      '    Second line',
      '',
      '    Third paragraph',
      'Following paragraph',
    ].join('\n');

    const [definition] = parseFootnoteDefinitions(text);

    expect(definition.name).toBe('multi');
    expect(definition.content).toBe('First line\nSecond line\n\nThird paragraph');
    expect(text.slice(definition.contentEndOffset)).toContain('\nFollowing paragraph');
  });
});

describe('serializeFootnoteContent', () => {
  it('indents continuation lines for Markdown footnotes', () => {
    expect(serializeFootnoteContent('First line\nSecond line\n\nThird paragraph')).toBe(
      'First line\n    Second line\n\n    Third paragraph',
    );
  });

  it('uses the document line ending', () => {
    expect(serializeFootnoteContent('First\nSecond', '\r\n')).toBe('First\r\n    Second');
  });
});

describe('getFootnoteDefinitionEndOffset', () => {
  it('anchors insertion after the last line of the selected footnote', () => {
    const text = [
      '[^one]: First note',
      '    continued',
      '[^two]: Second note',
    ].join('\n');

    expect(getFootnoteDefinitionEndOffset(text, 'one')).toBe(text.indexOf('\n[^two]'));
  });

  it('returns undefined when the remembered footnote no longer exists', () => {
    expect(getFootnoteDefinitionEndOffset('[^one]: First note', 'missing')).toBeUndefined();
  });
});
