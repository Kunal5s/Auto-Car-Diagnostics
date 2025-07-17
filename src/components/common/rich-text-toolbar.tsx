
"use client";
import React from 'react';
import { Bold, Italic, Underline, Link, List, Heading1, Heading2, Heading3, Pilcrow } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Separator } from '@/components/ui/separator';

interface RichTextToolbarProps {
    textareaRef: React.RefObject<HTMLTextAreaElement>;
}

export function RichTextToolbar({ textareaRef }: RichTextToolbarProps) {
    
    const applyFormat = (format: 'bold' | 'italic' | 'underline' | 'h1' | 'h2' | 'h3' | 'p' | 'ul' | 'link') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        let replacement = selectedText;

        switch (format) {
            case 'bold':
                replacement = `<strong>${selectedText}</strong>`;
                break;
            case 'italic':
                replacement = `<em>${selectedText}</em>`;
                break;
            case 'underline':
                replacement = `<u>${selectedText}</u>`;
                break;
            case 'h1':
                replacement = `<h1>${selectedText}</h1>`;
                break;
            case 'h2':
                replacement = `<h2>${selectedText}</h2>`;
                break;
            case 'h3':
                replacement = `<h3>${selectedText}</h3>`;
                break;
            case 'p':
                 replacement = `<p>${selectedText}</p>`;
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
        }
        
        const currentText = textarea.value;
        const newText = currentText.substring(0, start) + replacement + currentText.substring(end);
        
        textarea.value = newText;
        textarea.focus();
        textarea.selectionStart = start + replacement.length;
        textarea.selectionEnd = start + replacement.length;

        // This is a bit of a hack to trigger the onChange event for the parent form
        const event = new Event('input', { bubbles: true });
        textarea.dispatchEvent(event);
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
        </div>
    );
}
