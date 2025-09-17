
"use client";

import { useEditor, EditorContent, Editor as TiptapEditor, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextStyle from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
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
  MessageSquarePlus,
  HelpCircle,
  ChevronDown
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/language-context";
import { useState, useEffect, useCallback } from "react";
import { generateEditorContent } from "@/ai/flows/editor-flow";
import { Input } from "../ui/input";
import { AnimatePresence, motion } from "framer-motion";
import type { EditorContent as EditorContentType } from "@/lib/types";
import { Separator } from "../ui/separator";

const textColors = [
    { name: 'Default', color: '#000000' },
    { name: 'Red', color: '#e03131' },
    { name: 'Green', color: '#2f9e44' },
    { name: 'Blue', color: '#1971c2' },
    { name: 'Orange', color: '#f08c00' },
];

const highlightColors = [
    { name: 'Default', color: 'transparent' }, // Use transparent for "no highlight"
    { name: 'Yellow', color: '#fff3bf' },
    { name: 'Red', color: '#ffc9c9' },
    { name: 'Green', color: '#b2f2bb' },
    { name: 'Blue', color: '#a5d8ff' },
];


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

const ColorPicker = ({ editor }: { editor: TiptapEditor }) => {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-1.5">
                    <Palette />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2" sideOffset={10}>
                <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">Color del texto</p>
                    <div className="flex gap-1">
                        {textColors.map(({ name, color }) => (
                            <button
                                key={name}
                                onClick={() => editor.chain().focus().setColor(color).run()}
                                className={cn("h-6 w-6 rounded-full border-2 transition-transform", editor.isActive('textStyle', { color }) ? 'border-primary scale-110' : 'border-transparent')}
                                style={{ backgroundColor: color }}
                                title={name}
                            />
                        ))}
                    </div>
                </div>
                 <div className="space-y-2 mt-2">
                    <p className="text-xs font-semibold text-muted-foreground">Color de fondo</p>
                    <div className="flex gap-1">
                        {highlightColors.map(({ name, color }) => (
                            <button
                                key={name}
                                onClick={() => editor.chain().focus().toggleHighlight({ color }).run()}
                                className={cn("h-6 w-6 rounded-full border-2 transition-transform", editor.isActive('highlight', { color }) ? 'border-primary scale-110' : 'border-muted-foreground')}
                                style={{ backgroundColor: color }}
                                title={name}
                            />
                        ))}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};

const TextStyleSelector = ({ editor }: { editor: TiptapEditor }) => {
    const items = [
        { name: 'Texto', action: () => editor.chain().focus().setParagraph().run(), isActive: editor.isActive('paragraph') },
        { name: 'Encabezado 1', action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), isActive: editor.isActive('heading', { level: 1 }) },
        { name: 'Encabezado 2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), isActive: editor.isActive('heading', { level: 2 }) },
        { name: 'Lista con viñetas', action: () => editor.chain().focus().toggleBulletList().run(), isActive: editor.isActive('bulletList') },
        { name: 'Lista numerada', action: () => editor.chain().focus().toggleOrderedList().run(), isActive: editor.isActive('orderedList') },
    ];

    const activeItem = items.find(item => item.isActive) || items[0];

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8">
                    {activeItem.name}
                    <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-1" sideOffset={10}>
                <div className="flex flex-col">
                    {items.map(item => (
                         <Button
                            key={item.name}
                            variant={item.isActive ? 'secondary' : 'ghost'}
                            size="sm"
                            className="w-full justify-start"
                            onClick={item.action}
                        >
                            {item.name}
                        </Button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}

const Toolbar = ({ editor }: { editor: TiptapEditor | null }) => {
    const { translations } = useLanguage();
    const t = translations.editor;
    if (!editor) {
        return null;
    }

    return (
        <BubbleMenu
            editor={editor}
            tippyOptions={{ duration: 100 }}
            className="flex flex-wrap items-center gap-1 rounded-lg border bg-background p-1 shadow-lg"
        >
            {/* AI & Collaboration Tools */}
            <Button variant="ghost" size="sm" className="h-8"><HelpCircle className="mr-2 h-4 w-4" />{t.bubbleMenu.explain}</Button>
            <Button variant="ghost" size="sm" className="h-8"><Sparkles className="mr-2 h-4 w-4" />{t.bubbleMenu.askAI}</Button>
            <Button 
                variant={editor.isActive("highlight") ? "secondary" : "ghost"}
                size="sm" 
                className="h-8"
                onClick={() => editor.chain().focus().toggleHighlight({ color: '#fff3bf' }).run()}
            >
                <MessageSquarePlus className="mr-2 h-4 w-4" />
                {t.bubbleMenu.comment}
            </Button>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Text Style & Formatting */}
            <TextStyleSelector editor={editor} />
            <Button
                variant={editor.isActive("bold") ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8 p-1.5"
                onClick={() => editor.chain().focus().toggleBold().run()}
            >
                <Bold />
            </Button>
            <Button
                variant={editor.isActive("italic") ? "secondary" : "ghost"}
                size="icon"
                 className="h-8 w-8 p-1.5"
                onClick={() => editor.chain().focus().toggleItalic().run()}
            >
                <Italic />
            </Button>
            <Button
                variant={editor.isActive("underline") ? "secondary" : "ghost"}
                size="icon"
                 className="h-8 w-8 p-1.5"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
                <UnderlineIcon />
            </Button>
            <Button
                variant={editor.isActive("strike") ? "secondary" : "ghost"}
                size="icon"
                 className="h-8 w-8 p-1.5"
                onClick={() => editor.chain().focus().toggleStrike().run()}
            >
                <Strikethrough />
            </Button>
            
            <Separator orientation="vertical" className="h-6 mx-1" />
            
            {/* Color Picker */}
            <ColorPicker editor={editor} />
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

const isContentEmpty = (content: EditorContentType | null | undefined): boolean => {
    if (!content || !content.content) return true;
    if (content.content.length === 0) return true;
    if (content.content.length === 1 && content.content[0].type === 'paragraph') {
        const paragraph = content.content[0];
        return !paragraph.content || paragraph.content.length === 0;
    }
    return false;
};

export function Editor({
  content,
  onChange,
  editable = true,
  placeholder,
  initialHint,
}: EditorProps) {
  
  const [isEditing, setIsEditing] = useState(() => !isContentEmpty(content));
  const [aiState, setAiState] = useState<'idle' | 'prompting' | 'loading' | 'streaming' | 'done'>('idle');
  const [prompt, setPrompt] = useState('');
  const [aiGeneratedContent, setAiGeneratedContent] = useState('');
  const [currentPlaceholder, setCurrentPlaceholder] = useState('');

  const { translations } = useLanguage();
  const t = translations.editor;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({}),
      Placeholder.configure({
        placeholder: ({ node }) => {
            if (node.isFirstChild && node.isEmpty) {
                return currentPlaceholder;
            }
            return ""; 
        }
      }),
      Image,
      Link.configure({ openOnClick: false }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
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
  });
  
  useEffect(() => {
    if (isEditing) {
      setCurrentPlaceholder(placeholder || t.placeholders.default);
    } else {
      setCurrentPlaceholder('');
    }
  }, [isEditing, placeholder, t.placeholders.default]);

  useEffect(() => {
    if (editor) {
        editor.setOptions({
            editable: editable && isEditing && aiState !== 'loading' && aiState !== 'streaming',
        });
    }
  }, [editor, editable, isEditing, aiState]);

  useEffect(() => {
     if (editor) {
        editor.setOptions({
             editorProps: {
                handleKeyDown: (view, event) => {
                    if (aiState === 'idle' && editor.isEmpty) {
                        handleKeyDownInEditor(event);
                    }
                    return false;
                }
            }
        });
     }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, aiState]);
  
  
  const handleKeyDownInEditor = useCallback((event: KeyboardEvent) => {
    if (!editor || !editable) return;
    
    if (event.key === ' ' && editor.isEmpty) {
      event.preventDefault();
      setAiState('prompting');
    }
  }, [editor, editable]);


  const handleStartEditing = () => {
    setIsEditing(true);
    setTimeout(() => editor?.commands.focus(), 0);
  };

  const handlePromptKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && prompt.trim().length > 0) {
        event.preventDefault();
        handleGenerate();
    }
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setAiState('loading');
    
    editor?.commands.clearContent();
    editor?.commands.insertContent(prompt);

    try {
        const result = await generateEditorContent({ prompt });
        setAiGeneratedContent(result);
        
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
        setAiState('prompting');
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
            </motion.div>
        )}
      </AnimatePresence>

       <AnimatePresence>
        {(aiState === 'prompting' || aiState === 'loading') && isEditing && (
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
                    onKeyDown={handlePromptKeyDown}
                    disabled={aiState === 'loading'}
                    autoFocus
                />
                 {aiState === 'loading' ? (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground"/>
                 ) : (
                    <Button variant="ghost" size="icon" onClick={() => { setAiState('idle'); editor?.commands.clearContent(); } }><X/></Button>
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
