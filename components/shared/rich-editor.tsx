"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import PlaceholderExtension from "@tiptap/extension-placeholder";
import UnderlineExtension from "@tiptap/extension-underline";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Quote,
  Undo,
  Redo,
  Link,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface RichEditorProps {
  content?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  className?: string;
}

function ToolbarButton({
  onClick,
  active,
  children,
  label,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors",
        active
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
      )}
    >
      {children}
    </button>
  );
}

function EditorToolbar({ editor }: { editor: Editor }) {
  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border px-3 py-2">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        label="Bold"
      >
        <Bold className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        label="Italic"
      >
        <Italic className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive("underline")}
        label="Underline"
      >
        <Underline className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive("strike")}
        label="Strikethrough"
      >
        <Strikethrough className="size-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive("heading", { level: 1 })}
        label="Heading 1"
      >
        <Heading1 className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
        label="Heading 2"
      >
        <Heading2 className="size-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        label="Bullet List"
      >
        <List className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        label="Ordered List"
      >
        <ListOrdered className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
        label="Quote"
      >
        <Quote className="size-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <ToolbarButton
        onClick={() => {
          const url = editor.getAttributes("link").href;
          const href = window.prompt("Enter URL", url || "");
          if (href === null) return;
          if (href === "") {
            editor.chain().focus().unsetLink().run();
          } else {
            editor.chain().focus().setLink({ href }).run();
          }
        }}
        active={editor.isActive("link")}
        label="Link"
      >
        <Link className="size-4" />
      </ToolbarButton>

      <div className="ml-auto flex items-center gap-0.5">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          label="Undo"
        >
          <Undo className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          label="Redo"
        >
          <Redo className="size-4" />
        </ToolbarButton>
      </div>
    </div>
  );
}

export function RichEditor({
  content = "",
  onChange,
  placeholder = "Start writing...",
  className,
}: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      UnderlineExtension,
      LinkExtension.configure({
        openOnClick: false,
      }),
      PlaceholderExtension.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[200px] px-3 py-2",
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div
      className={cn(
        "divide-border overflow-hidden rounded-md border border-border",
        className,
      )}
    >
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
