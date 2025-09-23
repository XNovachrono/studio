
"use client";

import React, { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import { Editor, Range } from '@tiptap/core';
import {
  Image as ImageIcon,
  Video as VideoIcon,
  FileAudio as AudioIcon,
  Archive as BankIcon,
  Upload,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import tippy, { Instance, Props } from 'tippy.js';
import { SuggestionKeyDownProps, SuggestionProps } from '@tiptap/suggestion';
import { createRoot, Root } from 'react-dom/client';

interface Command {
  title: string;
  icon: React.ReactNode;
  action: (editor: Editor) => void;
  type: 'upload' | 'bank';
}

const commands: Command[] = [
  {
    title: 'Añadir Imagen',
    icon: <ImageIcon className="h-5 w-5" />,
    action: (editor) => { /* Logic to open file picker for image */ },
    type: 'upload'
  },
  {
    title: 'Añadir Video',
    icon: <VideoIcon className="h-5 w-5" />,
    action: (editor) => { /* Logic to open file picker for video */ },
    type: 'upload'
  },
  {
    title: 'Añadir Audio',
    icon: <AudioIcon className="h-5 w-5" />,
    action: (editor) => { /* Logic to open file picker for audio */ },
    type: 'upload'
  },
    {
    title: 'Importar Imagen del Banco',
    icon: <BankIcon className="h-5 w-5" />,
    action: (editor) => { /* Logic to open bank importer */ },
    type: 'bank'
  },
  {
    title: 'Importar Audio del Banco',
    icon: <BankIcon className="h-5 w-5" />,
    action: (editor) => { /* Logic to open bank importer */ },
    type: 'bank'
  },
  {
    title: 'Importar Video del Banco',
    icon: <BankIcon className="h-5 w-5" />,
    action: (editor) => { /* Logic to open bank importer */ },
    type: 'bank'
  },
];

interface CommandListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

const CommandList = forwardRef<CommandListRef, { items: Command[]; command: (item: Command) => void; editor: Editor }>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // This is a critical guard to prevent rendering when the editor is not ready.
  if (!props.editor || !props.editor.isEditable) {
    return null;
  }

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command(item);
    }
  };

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }
      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }
      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }
      return false;
    },
  }));

  if (props.items.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="z-50 w-64 rounded-lg border bg-background p-2 shadow-lg"
    >
      <p className="px-2 py-1 text-xs font-semibold text-muted-foreground">SUBIR</p>
      {props.items.filter(item => item.type === 'upload').map((item, index) => (
        <button
          key={index}
          className={`flex w-full items-center gap-3 rounded-md p-2 text-left text-sm transition-colors ${index === selectedIndex ? 'bg-accent' : ''}`}
          onClick={() => selectItem(index)}
        >
          <div className="rounded-md border bg-secondary p-2">{item.icon}</div>
          <span>{item.title}</span>
        </button>
      ))}
       <p className="mt-2 px-2 py-1 text-xs font-semibold text-muted-foreground">BANCO</p>
        {props.items.filter(item => item.type === 'bank').map((item, index) => (
            <button
                key={index + 3} // offset index for unique key
                className={`flex w-full items-center gap-3 rounded-md p-2 text-left text-sm transition-colors ${index + 3 === selectedIndex ? 'bg-accent' : ''}`}
                onClick={() => selectItem(index + 3)}
            >
                <div className="rounded-md border bg-secondary p-2">{item.icon}</div>
                <span>{item.title}</span>
            </button>
        ))}
    </motion.div>
  );
});

CommandList.displayName = 'CommandList';


export const suggestion = {
  items: ({ query }: { query: string }) => {
    return commands.filter(item => item.title.toLowerCase().startsWith(query.toLowerCase())).slice(0, 10);
  },
  render: () => {
    let component: HTMLDivElement;
    let popup: Instance<Props>[] | undefined;
    let root: Root | undefined;
    let commandListRef: React.RefObject<CommandListRef> | undefined;

    return {
      onStart: (props: SuggestionProps<Command>) => {
        component = document.createElement('div');
        commandListRef = React.createRef<CommandListRef>();

        const CommandListComponent = React.createElement(CommandList, {
          ...props,
          ref: commandListRef,
          command: (item: Command) => props.command(item),
        });

        root = createRoot(component);
        root.render(CommandListComponent);
        
        if (!props.clientRect) {
            return;
        }

        popup = tippy('body', {
          getReferenceClientRect: () => props.clientRect as any,
          appendTo: () => document.body,
          content: component,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
        });
      },
      onUpdate(props: SuggestionProps<Command>) {
        if (commandListRef) {
             const CommandListComponent = React.createElement(CommandList, {
                ...props,
                ref: commandListRef,
                command: (item: Command) => props.command(item),
            });
             root?.render(CommandListComponent);
        }
        
        if (!props.clientRect) {
            return;
        }
        
        popup?.[0].setProps({
          getReferenceClientRect: () => props.clientRect as any,
        });
      },
      onKeyDown(props: SuggestionKeyDownProps) {
        if (props.event.key === 'Escape') {
          popup?.[0].hide();
          return true;
        }
        return commandListRef?.current?.onKeyDown(props) || false;
      },
      onExit() {
        popup?.[0].destroy();
        if (root) {
            setTimeout(() => {
                root?.unmount();
                if (component.parentNode) {
                    component.parentNode.removeChild(component);
                }
            }, 500); // Delay to allow exit animation
        }
      },
    };
  },
  char: '/',
  command: ({ editor, range, props }: { editor: Editor, range: Range, props: Command }) => {
    props.action(editor);
  },
  allow: ({ editor, range }: { editor: Editor, range: Range }) => {
    return editor.can().deleteRange(range);
  },
};
