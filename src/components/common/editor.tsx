"use client";

import { useEditor, EditorContent, Editor as TiptapEditor, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextStyle from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Underline as UnderlineIcon,
  Palette,
  Sparkles,
  RefreshCw,
  Check,
  X,
  Loader2,
  Pencil,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/language-context";
import { useState, useEffect } from "react";
import { generateEditorContent } from "@/ai/flows/editor-flow";
import { Input } from "../ui/input";
import { AnimatePresence, motion } from "framer-motion";

const colors = ["#000000", "#e03131", "#2f9e44", "#1971c2", "#f08c00"];

const AIToolbar = ({ state, onAccept, onRegenerate, onModify }: { state: 'idle' | 'loading' | 'streaming' | 'done', onAccept: () => void, onRegenerate: () => void, onModify: () => void }) => {
    const { translations } = useLanguage();
    const t = translations.editor.ai;

    if (state !== 'done') return null;

    return (
        <div className="flex items-center gap-2 rounded-md bg-secondary p-2 mt-2">
            <p className="text-sm font-medium mr-2">{t.satisfied}</p>
            <Button size="sm" variant="ghost" onClick={onAccept}><Check className="mr-2 h-4 w-4"/>{t.accept}</Button>
            <Button size="sm" variant="ghost" onClick={onRegenerate}><RefreshCw className="mr-2 h-4 w-4"/>{t.regenerate}</Button>
            <Button size="sm" variant="ghost" onClick={onModify}><Pencil className="mr-2 h-4 w-4"/>{t.modify}</Button>
        </div>
    )
}

const Toolbar = ({ editor }: { editor: TiptapEditor | null }) => {
  if (!editor) {
    return null;
  }

  return (
     <BubbleMenu 
        editor={editor} 
        tippyOptions={{ duration: 100 }}
        className="flex flex-wrap items-center gap-1 rounded-lg border bg-secondary p-2"
    >
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
    </BubbleMenu>
  );
};

interface EditorProps {
  content: any; // The initial content (JSON)
  onChange: (content: any) => void;
  editable?: boolean;
  placeholder?: string;
  initialHint?: string;
}

export function Editor({
  content,
  onChange,
  editable = true,
  placeholder,
  initialHint,
}: EditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [aiState, setAiState] = useState<'idle' | 'prompting' | 'loading' | 'streaming' | 'done'>('idle');
  const [prompt, setPrompt] = useState('');
  const [aiGeneratedContent, setAiGeneratedContent] = useState('');
  
  const { translations } = useLanguage();
  const t = translations.editor;


  const editor = useEditor({
    extensions: [
      StarterKit.configure({}),
      Placeholder.configure({
        placeholder: ({ node }) => {
            if (node.type.name === 'heading') {
                return t.placeholders.heading;
            }
            return placeholder || t.placeholders.default;
        }
      }),
      Image,
      Link.configure({ openOnClick: false }),
      Underline,
      TextStyle,
      Color,
    ],
    content: content,
    editable: editable && isEditing && aiState !== 'loading' && aiState !== 'streaming',
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert max-w-none focus:outline-none",
      },
    },
     onSelectionUpdate({ editor }) {
        if (editor.state.selection.empty) {
            // When cursor is placed, no text selected
        } else {
            // When text is selected
        }
    },
  });
  
  useEffect(() => {
    // Sync external content changes to the editor if it's not empty
     if (editor && content) {
      const isInitialContent =
        JSON.stringify(content) ===
        JSON.stringify({
          type: "doc",
          content: [{ type: "paragraph" }],
        });

      if (!isInitialContent) {
          const isContentDifferent = JSON.stringify(content) !== JSON.stringify(editor.getJSON());
          if(isContentDifferent) {
            editor.commands.setContent(content, false);
          }
          setIsEditing(true); // Automatically enter editing mode if there's content
      }
    }
  }, [content, editor]);

  const handleStartEditing = () => {
    setIsEditing(true);
    setTimeout(() => editor?.commands.focus(), 100);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === ' ' && prompt.length > 0) {
        event.preventDefault();
        handleGenerate();
    }
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setAiState('loading');
    
    // Clear editor and show prompt
    editor?.commands.clearContent();
    editor?.commands.insertContent(prompt);

    try {
        const result = await generateEditorContent({ prompt });
        setAiGeneratedContent(result);
        
        // Stream-like effect for displaying text
        let currentText = "";
        const words = result.split(' ');
        setAiState('streaming');
        for (let i = 0; i < words.length; i++) {
            currentText += (i > 0 ? " " : "") + words[i];
            editor?.chain().focus().setContent(prompt + "\n\n" + currentText).run();
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        setAiState('done');
    } catch(error) {
        console.error("AI Generation failed:", error);
        setAiState('prompting'); // Go back to prompting on error
    }
  }
  
  const handleAccept = () => {
    editor?.commands.setContent(prompt + "\n\n" + aiGeneratedContent);
    onChange(editor?.getJSON());
    setAiState('idle');
    setPrompt('');
  };
  
  const handleRegenerate = () => {
    handleGenerate();
  };

  const handleModify = () => {
     setAiState('prompting');
     editor?.commands.setContent(prompt);
  };

  if (!editable) {
     return <EditorContent editor={editor} className="prose dark:prose-invert max-w-none"/>
  }

  return (
    <div className="w-full relative rounded-lg border bg-background p-4 min-h-[150px] flex flex-col justify-center items-center">
      <AnimatePresence>
        {!isEditing ? (
            <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center text-muted-foreground cursor-pointer"
                onClick={handleStartEditing}
            >
                <p>{initialHint || t.initialHint}</p>
            </motion.div>
        ) : (
             <motion.div 
                key="editor"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full"
            >
                <Toolbar editor={editor} />
                <EditorContent editor={editor} />
                {aiState === 'idle' && (
                     <Button variant="ghost" size="sm" className="mt-2 text-muted-foreground" onClick={() => setAiState('prompting')}>
                        <Sparkles className="mr-2 h-4 w-4"/> {t.ai.trigger}
                    </Button>
                )}
            </motion.div>
        )}
      </AnimatePresence>

       <AnimatePresence>
        {(aiState === 'prompting' || aiState === 'loading') && (
            <motion.div
                key="ai-prompt"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-4 left-4 right-4 bg-secondary p-2 rounded-lg shadow-lg flex items-center gap-2"
            >
                <Sparkles className="text-primary h-5 w-5"/>
                <Input 
                    placeholder={t.ai.placeholder}
                    className="bg-transparent border-none focus-visible:ring-0"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={aiState === 'loading'}
                />
                 {aiState === 'loading' ? (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground"/>
                 ) : (
                    <Button variant="ghost" size="icon" onClick={() => setAiState('idle')}><X/></Button>
                 )}
            </motion.div>
        )}
       </AnimatePresence>
       
       <AnimatePresence>
         {aiState === 'done' && (
             <motion.div
                key="ai-toolbar"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="w-full"
            >
                 <AIToolbar state={aiState} onAccept={handleAccept} onRegenerate={handleRegenerate} onModify={handleModify}/>
             </motion.div>
         )}
       </AnimatePresence>
    </div>
  );
}
