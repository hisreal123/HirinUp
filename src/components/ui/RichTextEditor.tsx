'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';
import { useState, useRef } from 'react';
import { FileText } from 'lucide-react';
import * as mammoth from 'mammoth';

const MAX_CHARS = 2000;

const CIRCLE_SIZE = 28;
const STROKE_WIDTH = 3;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH * 2) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Every character counts — spaces, tabs, newlines included
function countChars(text: string): number {
  return text.length;
}

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  onTextChange?: (text: string) => void;
  placeholder?: string;
  className?: string;
}

async function extractPdfText(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const escape = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  type Span = { text: string; bold: boolean; italic: boolean };

  const parts: string[] = [];
  let bulletItems: string[] = [];

  const flushBullets = () => {
    if (bulletItems.length === 0) {
      return;
    }
    parts.push(
      '<ul>' +
        bulletItems.map((item) => `<li><p>${item}</p></li>`).join('') +
        '</ul>'
    );
    bulletItems = [];
  };

  const addBreak = () => {
    flushBullets();
    if (parts.length > 0 && parts[parts.length - 1] !== '<p></p>') {
      parts.push('<p></p>');
    }
  };

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    const rawItems = (content.items as any[]).filter(
      (item) => 'str' in item && item.str
    );
    if (rawItems.length === 0) {
      continue;
    }

    // Median font size baseline — text larger than 1.2× is treated as bold/heading
    const sizes = rawItems
      .map((item) => Math.abs(item.transform[3]) || 10)
      .sort((a, b) => a - b);
    const medianSize = sizes[Math.floor(sizes.length / 2)];

    // Trigger font loading so page.objs / page.commonObjs are populated
    await page.getOperatorList();

    // Build a map from internal font key → { bold, italic } using the actual
    // PostScript font name stored in the loaded font object
    const fontMetaMap = new Map<string, { bold: boolean; italic: boolean }>();
    for (const item of rawItems) {
      const fn: string = item.fontName ?? '';
      if (fontMetaMap.has(fn)) {
        continue;
      }
      try {
        const fontObj: any = (page.objs as any).has(fn)
          ? (page.objs as any).get(fn)
          : (page.commonObjs as any).get(fn);
        const realName: string =
          fontObj?.name ?? fontObj?.fontName ?? fontObj?.loadedName ?? fn;
        fontMetaMap.set(fn, {
          bold: /bold|heavy|black|semibold/i.test(realName),
          italic: /italic|oblique/i.test(realName) || fontObj?.italic === true,
        });
      } catch {
        fontMetaMap.set(fn, {
          bold: /bold|heavy|black|semibold/i.test(fn),
          italic: /italic|oblique/i.test(fn),
        });
      }
    }

    rawItems.sort((a, b) => {
      const dy = b.transform[5] - a.transform[5];
      if (Math.abs(dy) > 1) {
        return dy > 0 ? 1 : -1;
      }

      return a.transform[4] - b.transform[4];
    });

    const lineGroups: any[][] = [];
    for (const item of rawItems) {
      const y = item.transform[5];
      const h = item.height || Math.abs(item.transform[3]) || 10;
      const last = lineGroups[lineGroups.length - 1];
      if (last && Math.abs(last[0].transform[5] - y) <= h * 0.6) {
        last.push(item);
      } else {
        lineGroups.push([item]);
      }
    }

    for (const group of lineGroups) {
      group.sort((a, b) => a.transform[4] - b.transform[4]);
    }

    for (let li = 0; li < lineGroups.length; li++) {
      const group = lineGroups[li];

      if (li > 0) {
        const prevY = lineGroups[li - 1][0].transform[5];
        const currY = group[0].transform[5];
        const lineH = group[0].height || Math.abs(group[0].transform[3]) || 10;
        if (prevY - currY > lineH * 1.5) {
          addBreak();
        }
      }

      const spans: Span[] = [];
      for (const item of group) {
        const fn: string = item.fontName ?? '';
        const fontSize = Math.abs(item.transform[3]) || 10;
        const meta = fontMetaMap.get(fn);
        const bold = (meta?.bold ?? false) || fontSize > medianSize * 1.2;
        const italic =
          (meta?.italic ?? false) || Math.abs(item.transform[2]) > 0.1;
        const last = spans[spans.length - 1];
        if (last && last.bold === bold && last.italic === italic) {
          last.text += item.str;
        } else {
          spans.push({ text: item.str, bold, italic });
        }
      }

      const lineText = spans
        .map((s) => s.text)
        .join('')
        .trim();
      if (!lineText) {
        continue;
      }

      if (/^[•●◦▪▸►\-*]\s*/.test(lineText)) {
        bulletItems.push(
          escape(lineText.replace(/^[•●◦▪▸►\-*]\s*/, '').trim())
        );
      } else {
        flushBullets();

        // If every span on the line is larger than median, treat as a heading
        const lineFontSize =
          group.reduce(
            (sum, item) => sum + (Math.abs(item.transform[3]) || 10),
            0
          ) / group.length;
        const sizeRatio = lineFontSize / medianSize;
        const headingTag =
          sizeRatio >= 1.5
            ? 'h1'
            : sizeRatio >= 1.3
              ? 'h2'
              : sizeRatio >= 1.1
                ? 'h3'
                : null;
        const isWholeLine = spans.every((s) => s.bold);

        if (headingTag && isWholeLine) {
          parts.push(`<${headingTag}>${escape(lineText)}</${headingTag}>`);
        } else {
          const lineHtml = spans
            .map(({ text, bold, italic }) => {
              let t = escape(text);
              if (bold && italic) {
                return `<em><strong>${t}</strong></em>`;
              }
              if (bold) {
                return `<strong>${t}</strong>`;
              }
              if (italic) {
                return `<em>${t}</em>`;
              }

              return t;
            })
            .join('')
            .trim();
          parts.push(`<p>${lineHtml}</p>`);
        }
      }
    }

    flushBullets();
    if (i < pdf.numPages) {
      addBreak();
    }
  }

  flushBullets();

  return parts.join('');
}

// Heuristic: short plain <p> lines with no trailing sentence punctuation are
// likely section headings that mammoth couldn't map (custom Word styles).
function promoteMammothHeadings(html: string): string {
  return html.replace(/<p>([\s\S]*?)<\/p>/g, (match, inner) => {
    const text = inner.replace(/<[^>]+>/g, '').trim();
    const isHeading =
      text.length > 2 &&
      text.length <= 60 &&
      !/[.?!,;]$/.test(text) &&
      !/:\s/.test(text) &&
      !/<(strong|em|a)/.test(inner);

    return isHeading ? `<h2>${inner}</h2>` : match;
  });
}

async function extractDocxHtml(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });

  return promoteMammothHeadings(result.value ?? '');
}

async function extractFileHtml(file: File): Promise<string> {
  if (file.type === 'application/pdf') {
    return extractPdfText(file);
  }
  if (
    file.type ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.name.endsWith('.docx')
  ) {
    return extractDocxHtml(file);
  }

  return '';
}

export function RichTextEditor({
  value,
  onChange,
  onTextChange,
  placeholder,
  className,
}: RichTextEditorProps) {
  const [charCount, setCharCount] = useState(0);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const charCountRef = useRef(0);
  const editorRef = useRef<ReturnType<typeof useEditor> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: placeholder || '' }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    immediatelyRender: false,
    content: value,
    onUpdate({ editor }) {
      const text = editor.getText({ blockSeparator: '\n' });
      const chars = Math.min(countChars(text), MAX_CHARS);

      charCountRef.current = chars;
      setCharCount(chars);
      onChange(editor.getHTML());
      if (onTextChange) {
        onTextChange(text);
      }
    },
    editorProps: {
      attributes: {
        class: [
          'min-h-[6rem] px-3 py-2 text-sm focus:outline-none text-left break-words overflow-x-auto [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mt-3 [&_h1]:mb-1 [&_h2]:text-base [&_h2]:font-bold [&_h2]:mt-3 [&_h2]:mb-1 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-0.5 [&_p]:my-1',
          // heading styles for imported docx / rich paste
          '[&_h1]:text-xl [&_h1]:font-bold [&_h1]:mt-3 [&_h1]:mb-1',
          '[&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-2 [&_h2]:mb-1',
          '[&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-0.5',
          // paragraph & list spacing
          '[&_p]:my-0.5 [&_ul]:my-0.5 [&_ol]:my-0.5 [&_li]:my-0',
        ].join(' '),
      },
      handleKeyDown(_view, event) {
        // Allow modifier combos (Ctrl+A, Cmd+Z, etc.) and non-printable keys
        if (event.ctrlKey || event.metaKey || event.altKey) {
          return false;
        }

        const isPrintable = event.key.length === 1 || event.key === 'Enter';
        if (!isPrintable) {
          return false;
        }

        if (charCountRef.current >= MAX_CHARS) {
          return true; // swallow the keystroke
        }

        return false;
      },
      handlePaste(view, event) {
        // PDF or docx file pasted?
        const files = event.clipboardData?.files;
        if (files && files.length > 0) {
          const pdfFile = Array.from(files).find(
            (f) =>
              f.type === 'application/pdf' ||
              f.type ===
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
              f.name.endsWith('.docx')
          );
          if (pdfFile) {
            event.preventDefault();
            setIsPdfLoading(true);
            extractFileHtml(pdfFile)
              .then((html) => {
                if (html) {
                  editorRef.current
                    ?.chain()
                    .focus()
                    .insertContent(html, {
                      parseOptions: { preserveWhitespace: 'full' },
                    })
                    .run();
                }
              })
              .catch(console.error)
              .finally(() => setIsPdfLoading(false));

            return true;
          }
        }

        event.preventDefault();

        // HTML paste (Word, Google Docs, rich web content) — preserves formatting.
        // Extract only the StartFragment region; skip if there are no real formatting tags
        // (PDF viewers wrap plain text in <html><body> with no markup).
        const rawHtml = event.clipboardData?.getData('text/html') ?? '';
        if (rawHtml) {
          const match = rawHtml.match(
            /<!--StartFragment-->([\s\S]*?)<!--EndFragment-->/
          );
          const fragment = match ? match[1].trim() : rawHtml;
          const hasFormatting =
            /<(strong|em|b|i|u|ul|ol|li|h[1-6]|blockquote)/i.test(fragment);
          if (hasFormatting) {
            editorRef.current?.chain().focus().insertContent(fragment).run();

            return true;
          }
        }

        // Plain text fallback with char limit
        const text = event.clipboardData?.getData('text/plain') ?? '';
        const available = MAX_CHARS - charCountRef.current;

        if (available <= 0 || !text) {
          return true;
        }

        view.dispatch(view.state.tr.insertText(text.slice(0, available)));

        return true;
      },
    },
  });

  // Keep ref in sync so handlePaste (a ProseMirror closure) can reach the editor
  editorRef.current = editor;

  if (!editor) {
    return null;
  }

  async function insertFile(file: File) {
    if (!editor) {
      return;
    }
    setIsPdfLoading(true);
    try {
      const html = await extractFileHtml(file);
      if (html) {
        editor.chain().focus().insertContent(html).run();
      }
    } catch (e) {
      console.error('File extraction failed', e);
    } finally {
      setIsPdfLoading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const supported = Array.from(e.dataTransfer.files).find(
      (f) =>
        f.type === 'application/pdf' ||
        f.type ===
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        f.name.endsWith('.docx')
    );
    if (supported) {
      insertFile(supported);
    }
  }

  const remaining = MAX_CHARS - charCount;
  const isAtLimit = remaining <= 0;
  const isWarning = remaining <= 20 && !isAtLimit;
  const strokeColor = isAtLimit ? '#ef4444' : isWarning ? '#f97316' : '#4f46e5';

  // Use onMouseDown + preventDefault to keep editor selection alive when clicking toolbar
  function Btn({
    active,
    onMouseDown,
    title,
    children,
  }: {
    active: boolean;
    onMouseDown: (e: React.MouseEvent) => void;
    title?: string;
    children: React.ReactNode;
  }) {
    return (
      <button
        type="button"
        title={title}
        className={`p-1 rounded transition-colors ${
          active
            ? 'bg-indigo-100 text-indigo-700'
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
        }`}
        onMouseDown={onMouseDown}
      >
        {children}
      </button>
    );
  }

  function Divider() {
    return <div className="w-px h-4 bg-gray-200 mx-1" />;
  }

  return (
    <div
      className={`border-2 ${isAtLimit ? 'border-red-400' : isWarning ? 'border-orange-400' : isDragOver ? 'border-indigo-400 bg-indigo-50' : 'border-gray-500'} rounded-md mt-2 w-full ${className ?? ''}`}
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1 border-b border-gray-200">
        {/* Text style */}
        <Btn
          active={editor.isActive('bold')}
          title="Bold"
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleBold().run();
          }}
        >
          <Bold size={13} />
        </Btn>
        <Btn
          active={editor.isActive('italic')}
          title="Italic"
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleItalic().run();
          }}
        >
          <Italic size={13} />
        </Btn>
        <Btn
          active={editor.isActive('underline')}
          title="Underline"
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleUnderline().run();
          }}
        >
          <UnderlineIcon size={13} />
        </Btn>
        <Btn
          active={editor.isActive('strike')}
          title="Strikethrough"
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleStrike().run();
          }}
        >
          <Strikethrough size={13} />
        </Btn>

        <Divider />

        {/* Alignment */}
        <Btn
          active={editor.isActive({ textAlign: 'left' })}
          title="Align left"
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().setTextAlign('left').run();
          }}
        >
          <AlignLeft size={13} />
        </Btn>
        <Btn
          active={editor.isActive({ textAlign: 'center' })}
          title="Align center"
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().setTextAlign('center').run();
          }}
        >
          <AlignCenter size={13} />
        </Btn>
        <Btn
          active={editor.isActive({ textAlign: 'right' })}
          title="Align right"
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().setTextAlign('right').run();
          }}
        >
          <AlignRight size={13} />
        </Btn>

        <Divider />

        {/* Lists */}
        <Btn
          active={editor.isActive('bulletList')}
          title="Bullet list"
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleBulletList().run();
          }}
        >
          <List size={13} />
        </Btn>
        <Btn
          active={editor.isActive('orderedList')}
          title="Ordered list"
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleOrderedList().run();
          }}
        >
          <ListOrdered size={13} />
        </Btn>

        <Divider />

        {/* PDF upload */}
        <Btn
          active={false}
          title="Upload PDF or Word document"
          onMouseDown={(e) => {
            e.preventDefault();
            fileInputRef.current?.click();
          }}
        >
          {isPdfLoading ? (
            <svg
              className="animate-spin"
              width={13}
              height={13}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          ) : (
            <FileText size={13} />
          )}
        </Btn>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              insertFile(file);
            }
            e.target.value = '';
          }}
        />
      </div>

      {/* Scrollable editor area */}
      <div className="max-h-[160px] overflow-y-auto">
        <EditorContent editor={editor} />
      </div>

      {/* Word count circle */}
      <div className="flex justify-end px-3 py-1 border-t border-gray-100">
        <svg
          width={CIRCLE_SIZE}
          height={CIRCLE_SIZE}
          viewBox={`0 0 ${CIRCLE_SIZE} ${CIRCLE_SIZE}`}
        >
          {/* Track */}
          <circle
            cx={CIRCLE_SIZE / 2}
            cy={CIRCLE_SIZE / 2}
            r={RADIUS}
            fill="transparent"
            stroke="#e5e7eb"
            strokeWidth={STROKE_WIDTH}
          />
          {/* Progress */}
          <circle
            cx={CIRCLE_SIZE / 2}
            cy={CIRCLE_SIZE / 2}
            r={RADIUS}
            fill="transparent"
            stroke={strokeColor}
            strokeWidth={STROKE_WIDTH}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={
              CIRCUMFERENCE * (1 - Math.min(charCount / MAX_CHARS, 1))
            }
            strokeLinecap="round"
            transform={`rotate(-90 ${CIRCLE_SIZE / 2} ${CIRCLE_SIZE / 2})`}
            style={{
              transition: 'stroke-dashoffset 0.15s ease, stroke 0.15s ease',
            }}
          />
          {/* Remaining count — shown only when ≤ 20 left */}
          {(isWarning || isAtLimit) && (
            <text
              x={CIRCLE_SIZE / 2}
              y={CIRCLE_SIZE / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="8"
              fontWeight="600"
              fill={strokeColor}
            >
              {remaining}
            </text>
          )}
        </svg>
      </div>
    </div>
  );
}
