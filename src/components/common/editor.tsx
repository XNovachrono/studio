"use client";

import { useEditor, EditorContent, Editor as TiptapEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextStyle from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Underline as UnderlineIcon,
  Palette,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const colors = ["#000000", "#e03131", "#2f9e44", "#1971c2", "#f08c00"];

const Toolbar = ({ editor }: { editor: TiptapEditor | null }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-t-lg border border-b-0 bg-secondary p-2">
      <Button
        variant={editor.isActive("bold") ? "secondary" : "ghost"}
        size="icon"
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant={editor.isActive("italic") ? "secondary" : "ghost"}
        size="icon"
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant={editor.isActive("underline") ? "secondary" : "ghost"}
        size="icon"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <UnderlineIcon className="h-4 w-4" />
      </Button>
      <Button
        variant={editor.isActive("strike") ? "secondary" : "ghost"}
        size="icon"
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="h-4 w-4" />
      </Button>
      <Button
        variant={editor.isActive("heading", { level: 1 }) ? "secondary" : "ghost"}
        size="icon"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button
        variant={editor.isActive("heading", { level: 2 }) ? "secondary" : "ghost"}
        size="icon"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="h-4 w-4" />
      </Button>
       <Button
        variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
        size="icon"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant={editor.isActive("orderedList") ? "secondary" : "ghost"}
        size="icon"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon"><Palette className="h-4 w-4"/></Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2">
            <div className="flex gap-1">
                {colors.map(color => (
                     <button
                        key={color}
                        onClick={() => editor.chain().focus().setColor(color).run()}
                        className={cn("h-6 w-6 rounded-full border-2 transition-transform", editor.isActive('textStyle', { color }) ? 'border-primary scale-110' : 'border-transparent')}
                        style={{ backgroundColor: color }}
                    />
                ))}
            </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

interface EditorProps {
  content: any; // The initial content (JSON)
  onChange: (content: any) => void;
  editable?: boolean;
  placeholder?: string;
}

export function Editor({
  content,
  onChange,
  editable = true,
  placeholder,
}: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable extensions as needed
      }),
      Placeholder.configure({
        placeholder,
      }),
      Image,
      Link.configure({
        openOnClick: false,
      }),
      Underline,
      TextStyle,
      Color,
    ],
    content: content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
  });

  return (
    <div className="w-full">
      {editable && <Toolbar editor={editor} />}
      <EditorContent
        editor={editor}
        className="prose dark:prose-invert max-w-none rounded-b-lg border bg-background p-4 focus:outline-none"
      />
    </div>
  );
}
