

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
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import {
  Bold,
  Italic,
  Strikethrough,
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
  ChevronDown,
  Table as TableIcon,
  Trash2,
  Columns,
  Rows,
  Split,
  Heading1,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/language-context";
import { useState, useEffect } from "react";
import { generateEditorContent } from "@/ai/flows/editor-flow";
import { Input } from "../ui/input";
import { AnimatePresence, motion } from "framer-motion";
import type { EditorContent as EditorContentType } from "@/lib/types";
import { Separator } from "../ui/separator";
import { Label } from "../ui/label";
import { Node } from '@tiptap/core';

const Video = Node.create({
  name: 'video',
  group: 'block',
  atom: true,
  addAttributes() {
    return {
      src: {
        default: null,
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: 'video',
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ['video', { ...HTMLAttributes, controls: 'true' }];
  },
});

const Audio = Node.create({
  name: 'audio',
  group: 'block',
  atom: true,
  addAttributes() {
    return {
      src: {
        default: null,
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: 'audio',
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ['audio', { ...HTMLAttributes, controls: 'true' }];
  },
});


const textColors = [
    { name: 'Default', color: 'inherit' },
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
                <Button variant="ghost" size="icon" className="h-8 w-8 p-1.5" title="Color">
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
                                onClick={() => editor.chain().focus().setColor(color === 'inherit' ? '' : color).run()}
                                className={cn("h-6 w-6 rounded-full border-2 transition-transform", editor.isActive('textStyle', { color }) ? 'border-primary scale-110' : 'border-transparent')}
                                style={{ backgroundColor: color === 'inherit' ? 'hsl(var(--foreground))' : color }}
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

const TableTools = ({ editor }: { editor: TiptapEditor }) => {
    const RemoveColumnsIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v11"/><path d="m16 16-4 4-4-4"/><path d="M9 3H3v18h6"/><path d="m16 3 5 5-5 5"/></svg>
    )
    const RemoveRowsIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 12H3"/><path d="m6 9-3 3 3 3"/><path d="M3 9v12h18V9"/><path d="m18 3 3 3-3 3"/></svg>
    )

    return (
        <>
            <Button variant="ghost" size="icon" className="h-8 w-8 p-1.5" onClick={() => editor.chain().focus().addColumnAfter().run()} title="Añadir columna"><Columns/></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 p-1.5" onClick={() => editor.chain().focus().deleteColumn().run()} title="Eliminar columna"><RemoveColumnsIcon/></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 p-1.5" onClick={() => editor.chain().focus().addRowAfter().run()} title="Añadir fila"><Rows/></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 p-1.5" onClick={() => editor.chain().focus().deleteRow().run()} title="Eliminar fila"><RemoveRowsIcon/></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 p-1.5" onClick={() => editor.chain().focus().mergeOrSplit().run()} title="Fusionar/Dividir celdas"><Split/></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 p-1.5" onClick={() => editor.chain().focus().toggleHeaderRow().run()} title="Fila de encabezado"><Heading1/></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 p-1.5" onClick={() => editor.chain().focus().deleteTable().run()} title="Eliminar tabla"><Trash2/></Button>
        </>
    )
}

const InsertTablePopover = ({ editor }: { editor: TiptapEditor }) => {
    const [rows, setRows] = useState(3);
    const [cols, setCols] = useState(3);

    const createTable = () => {
        editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-1.5" title="Insertar tabla">
                    <TableIcon />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4 space-y-4" sideOffset={10}>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="rows">Filas</Label>
                        <Input id="rows" type="number" value={rows} onChange={e => setRows(parseInt(e.target.value, 10))} min="1" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cols">Columnas</Label>
                        <Input id="cols" type="number" value={cols} onChange={e => setCols(parseInt(e.target.value, 10))} min="1" />
                    </div>
                </div>
                <Button onClick={createTable} className="w-full">Crear</Button>
            </PopoverContent>
        </Popover>
    )
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
            {editor.isActive('table') ? <TableTools editor={editor} /> : (
                <>
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
                         title="Negrita"
                    >
                        <Bold />
                    </Button>
                    <Button
                        variant={editor.isActive("italic") ? "secondary" : "ghost"}
                        size="icon"
                         className="h-8 w-8 p-1.5"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                         title="Cursiva"
                    >
                        <Italic />
                    </Button>
                    <Button
                        variant={editor.isActive("underline") ? "secondary" : "ghost"}
                        size="icon"
                         className="h-8 w-8 p-1.5"
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                         title="Subrayado"
                    >
                        <UnderlineIcon />
                    </Button>
                    <Button
                        variant={editor.isActive("strike") ? "secondary" : "ghost"}
                        size="icon"
                         className="h-8 w-8 p-1.5"
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                         title="Tachado"
                    >
                        <Strikethrough />
                    </Button>
                    
                    <Separator orientation="vertical" className="h-6 mx-1" />
                    
                    {/* Color Picker & Tables */}
                    <ColorPicker editor={editor} />
                    <InsertTablePopover editor={editor} />
                </>
            )}
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

const EditorInstance = ({ content, onChange, editable, placeholder, aiState, setAiState, prompt, setPrompt, aiGeneratedContent, setAiGeneratedContent }: any) => {
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
                    if (editable && node.isFirstChild && node.isEmpty) {
                        return placeholder || t.placeholders.default;
                    }
                    return "";
                }
            }),
            Image,
            Video,
            Audio,
            Link.configure({ openOnClick: false }),
            Underline,
            TextStyle,
            Color,
            Highlight.configure({ multicolor: true }),
            Table.configure({ resizable: true, handleWidth: 5, cellMinWidth: 25 }),
            TableRow,
            TableHeader,
            TableCell,
        ],
        content: content,
        editable: editable && aiState !== 'loading' && aiState !== 'streaming',
        onUpdate: ({ editor }) => {
            onChange(editor.getJSON());
        },
        editorProps: {
            attributes: {
                class: "prose dark:prose-invert max-w-none focus:outline-none",
            },
            handleKeyDown: (view, event) => {
                if (aiState === 'idle' && view.state.doc.textContent.length === 0 && event.key === ' ') {
                    event.preventDefault();
                    setAiState('prompting');
                    return true;
                }
                return false;
            }
        },
    }, [editable, aiState]); // Dependencies to recreate editor instance

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setAiState('loading');
        
        editor?.commands.clearContent();

        try {
            const result = await generateEditorContent({ prompt });
            setAiGeneratedContent(result);
            editor?.chain().focus().setContent(result, true).run();
            setAiState('done');
        } catch(error) {
            console.error("AI Generation failed:", error);
            editor?.chain().focus().setContent("Sorry, I couldn't generate the content.").run();
            setAiState('prompting');
        }
    }

    const handlePromptKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && prompt.trim().length > 0) {
            event.preventDefault();
            handleGenerate();
        }
    }

    const handleAccept = () => {
        editor?.commands.setContent(aiGeneratedContent, true);
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

    if (!editable && !editor) {
        // For non-editable view, still need to render content
        return <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: content }} />;
    }
    
    if (!editor) return null;


    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full relative"
        >
            <Toolbar editor={editor} />
            <EditorContent editor={editor} />

            <AnimatePresence>
                {(aiState === 'prompting' || aiState === 'loading') && (
                    <motion.div
                        key="ai-prompt"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-0 left-0 right-0 bg-secondary p-2 rounded-lg shadow-lg flex items-center gap-2"
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
                        className="w-full mt-2"
                    >
                        <AIToolbar state={aiState} onAccept={handleAccept} onRegenerate={handleRegenerate} onModify={handleModify}/>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}


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

  const { translations } = useLanguage();
  const t = translations.editor;
  
  const handleStartEditing = () => {
    setIsEditing(true);
    setAiState('idle');
    setPrompt('');
    setAiGeneratedContent('');
  };

  if (!editable) {
     const nonEditableEditor = useEditor({
        extensions: [ StarterKit, Image, Video, Audio, Link, Underline, TextStyle, Color, Highlight, Table.configure({ resizable: true }), TableRow, TableHeader, TableCell ],
        content: content,
        editable: false,
     });
     return <EditorContent editor={nonEditableEditor} className="prose dark:prose-invert max-w-none"/>
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
             <EditorInstance 
                content={content}
                onChange={onChange}
                editable={isEditing}
                placeholder={placeholder}
                aiState={aiState}
                setAiState={setAiState}
                prompt={prompt}
                setPrompt={setPrompt}
                aiGeneratedContent={aiGeneratedContent}
                setAiGeneratedContent={setAiGeneratedContent}
             />
        )}
      </AnimatePresence>
    </div>
  );
}
