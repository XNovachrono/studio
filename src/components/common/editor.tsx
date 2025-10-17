

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
import Heading from '@tiptap/extension-heading';
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
  Sigma,
  CaseSensitive,
  ListTree,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/language-context";
import { useState, useEffect, useCallback, useRef } from "react";
import { generateEditorContent } from "@/ai/flows/editor-flow";
import { contextualQA } from "@/ai/flows/contextual-qa-flow";
import { Input } from "../ui/input";
import { AnimatePresence, motion } from "framer-motion";
import type { EditorContent as EditorContentType } from "@/lib/types";
import { Separator } from "../ui/separator";
import { Label } from "../ui/label";
import { Node } from '@tiptap/core';

// Custom Font Size Extension
const FontSize = Node.create({
    name: 'fontSize',
    addOptions() {
        return {
            types: ['textStyle'],
        };
    },
    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    fontSize: {
                        default: null,
                        parseHTML: element => element.style.fontSize.replace(/['"]+/g, ''),
                        renderHTML: attributes => {
                            if (!attributes.fontSize) {
                                return {};
                            }
                            return {
                                style: `font-size: ${attributes.fontSize}`,
                            };
                        },
                    },
                },
            },
        ];
    },
    addCommands() {
        return {
            setFontSize: (fontSize) => ({ chain }) => {
                return chain().setMark('textStyle', { fontSize }).run();
            },
            unsetFontSize: () => ({ chain }) => {
                return chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run();
            },
        };
    },
});

// Custom Font Family Extension
const FontFamily = Node.create({
    name: 'fontFamily',
    addOptions() {
        return {
            types: ['textStyle'],
        };
    },
    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    fontFamily: {
                        default: null,
                        parseHTML: element => element.style.fontFamily.replace(/['"]+/g, ''),
                        renderHTML: attributes => {
                            if (!attributes.fontFamily) {
                                return {};
                            }
                            return {
                                style: `font-family: ${attributes.fontFamily}`,
                            };
                        },
                    },
                },
            },
        ];
    },
    addCommands() {
        return {
            setFontFamily: (fontFamily) => ({ chain }) => {
                return chain().setMark('textStyle', { fontFamily }).run();
            },
        };
    },
});


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
    return ['video', { ...HTMLAttributes, controls: 'true', class: 'w-full rounded-md' }];
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

const symbols = [
  '≠', '→', '←', '≈',
  '±', '≤', '≥', '÷', '×',
  '∞', '°', '•', '√', 'π', 'Δ',
  'α', 'β', 'γ', 'δ', 'ε',
  '©', '®', '™', '€', '£', '¥',
];

const fontSizes = [ '12px', '14px', '16px', '18px', '24px', '30px', '36px'];
const fontFamilies = [
    { name: 'Inter', value: 'Inter, sans-serif' },
    { name: 'Arial', value: 'Arial, sans-serif' },
    { name: 'Lato', value: 'Lato, sans-serif' },
    { name: 'Times New Roman', value: '"Times New Roman", serif' },
    { name: 'Montserrat', value: 'Montserrat, sans-serif' },
    { name: 'Roboto Slab', value: '"Roboto Slab", serif' },
    { name: 'Poppins', value: 'Poppins, sans-serif' },
    { name: 'Merriweather', value: 'Merriweather, serif' },
    { name: 'Oswald', value: 'Oswald, sans-serif' },
];

const SymbolPicker = ({ editor }: { editor: TiptapEditor }) => {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-1.5" title="Símbolos">
                    <Sigma />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2" sideOffset={10}>
                 <div className="grid grid-cols-6 gap-1">
                    {symbols.map(symbol => (
                        <Button
                            key={symbol}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => editor.chain().focus().insertContent(symbol).run()}
                        >
                            {symbol}
                        </Button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    )
}

const GenerateToc = ({ editor }: { editor: TiptapEditor }) => {
    const handleGenerateToc = () => {
        const headings: { level: number; text: string; id: string }[] = [];
        const transaction = editor.state.tr;
        
        editor.state.doc.forEach((node, pos) => {
            if (node.type.name === 'heading') {
                const id = `heading-${pos}`;
                 if (node.attrs.id !== id) {
                    transaction.setNodeMarkup(pos, undefined, { ...node.attrs, id });
                }
                headings.push({
                    level: node.attrs.level,
                    text: node.textContent,
                    id: id,
                });
            }
        });

        transaction.setMeta('addToHistory', false);
        transaction.setMeta('preventUpdate', true);
        editor.view.dispatch(transaction);
        
        const tocContent = headings.map(heading => ({
            type: 'paragraph',
            content: [{
                type: 'text',
                marks: [{
                    type: 'link',
                    attrs: { href: `#${heading.id}` }
                }],
                text: `${'  '.repeat(heading.level - 1)}${heading.text}`
            }]
        }));

        if (tocContent.length > 0) {
            editor.chain().focus().insertContentAt(0, [{ type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Índice' }] }, ...tocContent, {type: 'paragraph'}]).run();
        }
    };

    return (
        <Button variant="ghost" size="icon" className="h-8 w-8 p-1.5" onClick={handleGenerateToc} title="Insertar Índice">
            <ListTree />
        </Button>
    );
};

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

const FontSizeSelector = ({ editor }: { editor: TiptapEditor }) => {
    const activeSize = fontSizes.find(size => editor.isActive('textStyle', { fontSize: size })) || '16px';
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-20">
                    {activeSize}
                    <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-1" sideOffset={10}>
                <div className="flex flex-col">
                    {fontSizes.map(size => (
                        <Button
                            key={size}
                            variant={editor.isActive('textStyle', { fontSize: size }) ? 'secondary' : 'ghost'}
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => editor.chain().focus().setFontSize(size).run()}
                        >
                            {size}
                        </Button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    )
}

const FontFamilySelector = ({ editor }: { editor: TiptapEditor }) => {
    const activeFamily = fontFamilies.find(family => editor.isActive('textStyle', { fontFamily: family.value })) || fontFamilies[0];
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8">
                    <CaseSensitive className="h-4 w-4 mr-2" />
                    {activeFamily.name}
                    <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-1" sideOffset={10}>
                <div className="flex flex-col">
                    {fontFamilies.map(family => (
                        <Button
                            key={family.name}
                            variant={editor.isActive('textStyle', { fontFamily: family.value }) ? 'secondary' : 'ghost'}
                            size="sm"
                            className="w-full justify-start"
                            style={{ fontFamily: family.value }}
                            onClick={() => editor.chain().focus().setFontFamily(family.value).run()}
                        >
                            {family.name}
                        </Button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    )
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

const Toolbar = ({ editor, onAskAI, onExplain }: { editor: TiptapEditor | null, onAskAI: (query: string) => void, onExplain: () => void }) => {
    const { translations } = useLanguage();
    const t = translations.editor;
    const [aiQuery, setAiQuery] = useState("");

    if (!editor) {
        return null;
    }

    const handleAskAI = () => {
        if(aiQuery) {
            onAskAI(aiQuery);
            setAiQuery("");
        }
    }

    return (
        <BubbleMenu
            editor={editor}
            tippyOptions={{ duration: 100, onHidden: () => setAiQuery("") }}
            className="flex flex-wrap items-center gap-1 rounded-lg border bg-background p-1 shadow-lg"
        >
            {editor.isActive('table') ? <TableTools editor={editor} /> : (
                <>
                    {/* AI & Collaboration Tools */}
                    <Button variant="ghost" size="sm" className="h-8" onClick={onExplain}><HelpCircle className="mr-2 h-4 w-4" />{t.bubbleMenu.explain}</Button>
                    
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8"><Sparkles className="mr-2 h-4 w-4" />{t.bubbleMenu.askAI}</Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-2">
                           <div className="flex gap-2">
                             <Input 
                                placeholder={t.ai.placeholder}
                                value={aiQuery}
                                onChange={(e) => setAiQuery(e.target.value)}
                                onKeyDown={(e) => { if(e.key === 'Enter') handleAskAI(); }}
                             />
                             <Button onClick={handleAskAI} size="icon" disabled={!aiQuery}><Sparkles className="h-4 w-4"/></Button>
                           </div>
                        </PopoverContent>
                    </Popover>

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
                    <FontFamilySelector editor={editor} />
                    <FontSizeSelector editor={editor} />
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
                    <SymbolPicker editor={editor} />
                    <InsertTablePopover editor={editor} />
                    <GenerateToc editor={editor} />
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
  withAiTools?: boolean;
  allowSideNotes?: boolean;
}

const FloatingNote = ({ id, initialContent, onUpdate, onClose, zIndex, onFocus }: any) => {
    const [localContent, setLocalContent] = useState(initialContent);

    // This effect ensures that if the initial content from the parent changes (e.g., AI result comes in),
    // the local state of this note is updated.
    useEffect(() => {
        setLocalContent(initialContent);
    }, [initialContent]);

    const handleContentChange = (newContent: any) => {
        // Update both local state for immediate feedback and call parent's onUpdate
        setLocalContent(newContent);
        onUpdate(newContent);
    };

    return (
        <motion.div
            drag
            dragMomentum={false}
            dragListener={false} // We'll handle drag manually on the header
            onMouseDown={onFocus}
            className="fixed top-1/4 left-1/4 bg-card border rounded-lg shadow-2xl flex flex-col overflow-hidden"
            style={{ zIndex, width: 350, height: 400 }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
        >
            <motion.div 
                className="flex items-center justify-between p-2 border-b cursor-grab bg-secondary/50"
                onPointerDown={(e) => {
                    // This allows dragging only from the header
                    const target = e.target as HTMLElement;
                    if(target.closest('button')) return; // Don't drag if clicking the close button
                    const dragControls = (e.currentTarget.parentElement as any).dragControls;
                    dragControls?.start(e);
                }}
            >
                <span className="text-sm font-medium">Apunte</span>
                <Button onClick={onClose} variant="ghost" size="icon" className="h-6 w-6 cursor-pointer">
                    <X className="h-4 w-4" />
                </Button>
            </motion.div>
            
            <div className="flex-grow p-2 overflow-auto" onMouseDown={(e) => e.stopPropagation()}>
                {localContent.type === 'loading' ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                ) : (
                   <Editor
                        content={localContent}
                        onChange={handleContentChange}
                        editable={true}
                        placeholder="Nuevo apunte..."
                        withAiTools={true} // AI tools can be available in notes too
                        allowSideNotes={false} // Prevent notes within notes
                    />
                )}
            </div>
        </motion.div>
    );
};

export function Editor({
  content,
  onChange,
  editable = true,
  placeholder,
  withAiTools = false,
  allowSideNotes = true,
}: EditorProps) {
  
  const [aiState, setAiState] = useState<'idle' | 'prompting' | 'loading' | 'streaming' | 'done'>('idle');
  const [prompt, setPrompt] = useState('');
  const [sideNotePanels, setSideNotePanels] = useState<any[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<number | null>(null);

  const { language, translations } = useLanguage();
  const t = translations.editor;

    const editor = useEditor({
        extensions: [
            StarterKit.configure({ heading: false }),
            Heading.configure({ levels: [1, 2, 3, 4] }).extend({
                addAttributes() {
                    return { ...this.parent?.(), id: { default: null } };
                },
            }),
            Placeholder.configure({
                placeholder: ({ node }) => {
                    if (node.type.name === 'heading') {
                        return t.placeholders.heading;
                    }
                    return placeholder || t.placeholders.default;
                },
            }),
            Image, Video, Audio, Link.configure({ openOnClick: false }), Underline,
            TextStyle, FontFamily, FontSize, Color, Highlight.configure({ multicolor: true }),
            Table.configure({ resizable: true }), TableRow, TableHeader, TableCell,
        ],
        content: content,
        editable: editable,
        onUpdate: ({ editor }) => {
            onChange(editor.getJSON());
        },
        editorProps: {
            attributes: {
                class: cn("prose prose-sm dark:prose-invert max-w-none focus:outline-none h-full"),
            },
            handleKeyDown: (view, event) => {
                 if (withAiTools && aiState === 'idle' && event.key === ' ' && view.state.selection.$from.parent.content.size === 0) {
                    event.preventDefault();
                    setAiState('prompting');
                    return true;
                }
                return false;
            }
        },
    });

  useEffect(() => {
    if (editor) {
      editor.setEditable(editable);
    }
  }, [editor, editable]);
  
  useEffect(() => {
    if (editor && content) {
      const isSame = JSON.stringify(editor.getJSON()) === JSON.stringify(content);
      if (!isSame) {
        editor.commands.setContent(content, false);
      }
    }
  }, [content, editor]);

  const handleAddSideNote = useCallback((initialContent?: any) => {
    const newNote = { id: Date.now(), content: initialContent || "" };
    setSideNotePanels(prev => [...prev, newNote]);
    setActiveNoteId(newNote.id);
  }, []);

  const handleCloseSideNote = (id: number) => {
    setSideNotePanels(prev => prev.filter(panel => panel.id !== id));
  };

  const handleUpdateNoteContent = (id: number, newContent: any) => {
    setSideNotePanels(prev => prev.map(note => note.id === id ? { ...note, content: newContent } : note));
  };
  
  const handleAIGeneration = async (selectedText: string, userQuery?: string) => {
     handleAddSideNote({type: 'loading'});
     const result = await contextualQA({ language, selectedText, userQuery });
     setSideNotePanels(prev => prev.map(p => (p.content?.type === 'loading') ? { ...p, content: result } : p));
  };
  
  const getSelectedText = () => {
    if (!editor) return "";
    const { from, to, empty } = editor.state.selection;
    if (empty) return "";
    return editor.state.doc.textBetween(from, to, " ");
  }

  const localOnAskAI = (query: string) => {
    const selectedText = getSelectedText();
    if (!selectedText) return;
    handleAIGeneration(selectedText, query);
  };
  
  const localOnExplain = () => {
    const selectedText = getSelectedText();
    if (!selectedText) return;
    handleAIGeneration(selectedText);
  };

  const handleGenerateFromPrompt = async () => {
    if (!prompt.trim() || !editor) return;
    setAiState('loading');
    try {
        const result = await generateEditorContent({ prompt });
        editor.chain().focus().insertContent(result).run();
        setAiState('idle');
    } catch(error) {
        console.error("AI Generation failed:", error);
        editor.chain().focus().insertContent("<p>Sorry, I couldn't generate the content.</p>").run();
        setAiState('idle');
    } finally {
        setPrompt('');
    }
  }

  const handlePromptKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && prompt.trim().length > 0) {
        event.preventDefault();
        handleGenerateFromPrompt();
    }
     if (event.key === 'Escape') {
        event.preventDefault();
        handleCancelAI();
    }
  }

  const handleCancelAI = () => {
    setAiState('idle');
    setPrompt('');
    // No longer clearing content, just focusing the editor
    editor?.chain().focus().run();
  };
    
  return (
    <div className={cn("w-full relative min-h-[150px] rounded-lg border bg-background p-4 flex flex-col")}>
        {withAiTools && allowSideNotes && (
             <Button onClick={() => handleAddSideNote({ type: "doc", content: [{ type: "paragraph" }]})} size="sm" variant="ghost" className="absolute top-2 right-2 z-10 text-muted-foreground hover:text-foreground h-7 px-2">
                <Pencil className="mr-2 h-4 w-4" />
                Añadir Apunte
            </Button>
        )}
         <div className="w-full h-full relative flex flex-col flex-grow">
            {withAiTools && <Toolbar editor={editor} onAskAI={localOnAskAI} onExplain={localOnExplain} />}
            <div className={cn("flex-grow relative h-full")}>
                 <EditorContent editor={editor} className={"h-full"}/>
            </div>
            
            <AnimatePresence>
                {(aiState === 'prompting' || aiState === 'loading') && (
                    <motion.div
                        key="ai-prompt" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                        className={cn("absolute bottom-0 left-0 right-0 bg-secondary p-2 rounded-lg shadow-lg flex items-center gap-2")}>
                        <Sparkles className="text-primary h-5 w-5"/>
                        <Input placeholder={t.ai.placeholder} className="bg-transparent border-none focus-visible:ring-0"
                            value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={handlePromptKeyDown}
                            disabled={aiState === 'loading'} autoFocus />
                         {aiState === 'loading' ? (
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground"/>
                         ) : (
                            <Button variant="ghost" size="icon" onClick={handleCancelAI}><X/></Button>
                         )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
        
        <AnimatePresence>
            {sideNotePanels.map((panel, index) => (
                <FloatingNote
                    key={panel.id} id={panel.id} initialContent={panel.content}
                    onUpdate={(newContent: any) => handleUpdateNoteContent(panel.id, newContent)}
                    onClose={() => handleCloseSideNote(panel.id)}
                    zIndex={activeNoteId === panel.id ? 1000 : 100 + index}
                    onFocus={() => setActiveNoteId(panel.id)}
                />
            ))}
        </AnimatePresence>
    </div>
  );
}

    