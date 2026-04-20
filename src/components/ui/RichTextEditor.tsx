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

const MAX_CHARS = 2000;

const CIRCLE_SIZE = 28;
const STROKE_WIDTH = 3;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH * 2) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

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

export function RichTextEditor({
  value,
  onChange,
  onTextChange,
  placeholder,
  className,
}: RichTextEditorProps) {
  const [charCount, setCharCount] = useState(0);
  const charCountRef = useRef(0);
  const editorRef = useRef<ReturnType<typeof useEditor> | null>(null);

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
          'min-h-[6rem] px-3 py-2 text-sm focus:outline-none text-left break-words overflow-x-auto [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mt-3 [&_h1]:mb-1 [&_h2]:text-base [&_h2]:font-bold [&_h2]:mt-3 [&_h2]:mb-1 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-0.5 [&_p]:mt-0 [&_p]:mb-0.5 [&_ul]:my-0.5 [&_ol]:my-0.5 [&_li]:my-0',
          '[&_h1]:text-xl [&_h1]:font-bold [&_h1]:mt-3 [&_h1]:mb-1',
          '[&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-2 [&_h2]:mb-1',
          '[&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-0.5',
          '[&_p]:mt-0 [&_p]:mb-0.5 [&_ul]:my-0.5 [&_ol]:my-0.5 [&_li]:my-0',
        ].join(' '),
      },
      handleKeyDown(_view, event) {
        if (event.ctrlKey || event.metaKey || event.altKey) {
          return false;
        }

        const isPrintable = event.key.length === 1 || event.key === 'Enter';
        if (!isPrintable) {
          return false;
        }

        if (charCountRef.current >= MAX_CHARS) {
          return true;
        }

        return false;
      },
      handlePaste(view, event) {
        event.preventDefault();

        // HTML paste (Word, Google Docs, rich web content) — preserves formatting.
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

  editorRef.current = editor;

  if (!editor) {
    return null;
  }

  const remaining = MAX_CHARS - charCount;
  const isAtLimit = remaining <= 0;
  const isWarning = remaining <= 20 && !isAtLimit;
  const strokeColor = isAtLimit
    ? 'hsl(var(--destructive))'
    : isWarning
      ? 'hsl(var(--warning))'
      : 'hsl(var(--primary))';

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
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        }`}
        onMouseDown={onMouseDown}
      >
        {children}
      </button>
    );
  }

  function Divider() {
    return <div className="w-px h-4 bg-border mx-1" />;
  }

  return (
    <div
      className={`border-2 ${isAtLimit ? 'border-destructive' : isWarning ? 'border-warning' : 'border-input'} rounded-md mt-2 w-full ${className ?? ''}`}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1 border-b border-border">
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
      </div>

      {/* Scrollable editor area */}
      <div className="max-h-[160px] overflow-y-auto">
        <EditorContent editor={editor} />
      </div>

      {/* Char count circle */}
      <div className="flex justify-end px-3 py-1 border-t border-border">
        <svg
          width={CIRCLE_SIZE}
          height={CIRCLE_SIZE}
          viewBox={`0 0 ${CIRCLE_SIZE} ${CIRCLE_SIZE}`}
        >
          <circle
            cx={CIRCLE_SIZE / 2}
            cy={CIRCLE_SIZE / 2}
            r={RADIUS}
            fill="transparent"
            stroke="hsl(var(--border))"
            strokeWidth={STROKE_WIDTH}
          />
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
