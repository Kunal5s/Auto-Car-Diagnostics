
"use client";
import React, { useRef } from 'react';
import { Bold, Italic, Underline, Link, List, Heading1, Heading2, Heading3, Pilcrow, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Separator } from '@/components/ui/separator';

interface RichTextToolbarProps {
    content: string;
    onContentChange: (newContent: string) => void;
}

export function RichTextToolbar({ content, onContentChange }: RichTextToolbarProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // This function ensures that the toolbar interacts with the parent's textarea state
    const setTextAreaRefAndContent = (textarea: HTMLTextAreaElement) => {
        (textareaRef.current as any) = textarea;
        if (textareaRef.current) {
            textareaRef.current.value = content;
        }
    };
    
    const applyFormat = (format: 'bold' | 'italic' | 'underline' | 'h1' | 'h2' | 'h3' | 'p' | 'ul' | 'link' | 'clear') => {
        if (!textareaRef.current) return;
        
        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        let replacement = selectedText;

        const wrap = (tag: string) => `<${tag}>${selectedText}</${tag}>`;

        switch (format) {
            case 'bold':
                replacement = wrap('strong');
                break;
            case 'italic':
                replacement = wrap('em');
                break;
            case 'underline':
                replacement = wrap('u');
                break;
            case 'h1':
                replacement = wrap('h1');
                break;
            case 'h2':
                replacement = wrap('h2');
                break;
            case 'h3':
                replacement = wrap('h3');
                break;
            case 'p':
                 replacement = wrap('p');
                break;
            case 'ul':
                const items = selectedText.split('\n').map(item => `  <li>${item}</li>`).join('\n');
                replacement = `<ul>\n${items}\n</ul>`;
                break;
            case 'link':
                 const url = prompt("Enter the URL:");
                 if(url) {
                    replacement = `<a href="${url}" target="_blank">${selectedText}</a>`;
                 }
                break;
            case 'clear':
                // A simple regex to strip HTML tags from the selected text
                replacement = selectedText.replace(/<[^>]*>/g, '');
                break;
        }
        
        const newText = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
        onContentChange(newText);

        // After updating the state, we need to manually update the cursor position
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                textareaRef.current.selectionStart = start + replacement.length;
                textareaRef.current.selectionEnd = start + replacement.length;
            }
        }, 0);
    };

    return (
        <div className="flex items-center gap-1 p-1 bg-muted border border-b-0 rounded-t-md">
            <ToggleGroup type="multiple">
                <ToggleGroupItem value="bold" aria-label="Toggle bold" onClick={() => applyFormat('bold')}>
                    <Bold className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="italic" aria-label="Toggle italic" onClick={() => applyFormat('italic')}>
                    <Italic className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="underline" aria-label="Toggle underline" onClick={() => applyFormat('underline')}>
                    <Underline className="h-4 w-4" />
                </ToggleGroupItem>
            </ToggleGroup>
            <Separator orientation="vertical" className="h-6 mx-1" />
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => applyFormat('link')}>
                <Link className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6 mx-1" />
            <ToggleGroup type="single" defaultValue="p">
                <ToggleGroupItem value="p" aria-label="Paragraph" onClick={() => applyFormat('p')}>
                     <Pilcrow className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="h1" aria-label="Heading 1" onClick={() => applyFormat('h1')}>
                    <Heading1 className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="h2" aria-label="Heading 2" onClick={() => applyFormat('h2')}>
                    <Heading2 className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="h3" aria-label="Heading 3" onClick={() => applyFormat('h3')}>
                    <Heading3 className="h-4 w-4" />
                </ToggleGroupItem>
            </ToggleGroup>
             <Separator orientation="vertical" className="h-6 mx-1" />
             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => applyFormat('ul')}>
                <List className="h-4 w-4" />
            </Button>
             <Separator orientation="vertical" className="h-6 mx-1" />
             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => applyFormat('clear')} title="Clear Formatting">
                <Type className="h-4 w-4" />
            </Button>

            {/* Hidden textarea to proxy interactions */}
            <textarea ref={setTextAreaRefAndContent} className="sr-only" tabIndex={-1} />
        </div>
    );
}
