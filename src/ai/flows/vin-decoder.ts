"use client";
import React, { useRef } from 'react';
import { Bold, Italic, Underline, Link, List, Heading1, Heading2, Heading3, Pilcrow, Type, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Separator } from '@/components/ui/separator';

interface RichTextToolbarProps {
    onExecCommand: (command: string, value?: string) => void;
}

export function RichTextToolbar({ onExecCommand }: RichTextToolbarProps) {
    
    const applyFormat = (command: string, value?: string) => {
        if (command === 'createLink') {
            const url = prompt("Enter the URL:");
            if (url) {
                onExecCommand(command, url);
            }
        } else {
            onExecCommand(command, value);
        }
    };

    return (
        <div className="flex items-center gap-1 p-1 bg-muted border border-b-0 rounded-t-md flex-wrap">
             <ToggleGroup type="multiple">
                <ToggleGroupItem value="bold" aria-label="Toggle bold" onMouseDown={(e) => {e.preventDefault(); applyFormat('bold')}}>
                    <Bold className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="italic" aria-label="Toggle italic" onMouseDown={(e) => {e.preventDefault(); applyFormat('italic')}}>
                    <Italic className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="underline" aria-label="Toggle underline" onMouseDown={(e) => {e.preventDefault(); applyFormat('underline')}}>
                    <Underline className="h-4 w-4" />
                </ToggleGroupItem>
            </ToggleGroup>
            <Separator orientation="vertical" className="h-6 mx-1" />
            <Button variant="ghost" size="icon" className="h-8 w-8" onMouseDown={(e) => {e.preventDefault(); applyFormat('createLink')}}>
                <Link className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6 mx-1" />
            <ToggleGroup type="single" defaultValue="p">
                <ToggleGroupItem value="p" aria-label="Paragraph" onMouseDown={(e) => {e.preventDefault(); applyFormat('formatBlock', 'p')}}>
                     <Pilcrow className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="h1" aria-label="Heading 1" onMouseDown={(e) => {e.preventDefault(); applyFormat('formatBlock', 'h1')}}>
                    <Heading1 className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="h2" aria-label="Heading 2" onMouseDown={(e) => {e.preventDefault(); applyFormat('formatBlock', 'h2')}}>
                    <Heading2 className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="h3" aria-label="Heading 3" onMouseDown={(e) => {e.preventDefault(); applyFormat('formatBlock', 'h3')}}>
                    <Heading3 className="h-4 w-4" />
                </ToggleGroupItem>
            </ToggleGroup>
             <Separator orientation="vertical" className="h-6 mx-1" />
             <Button variant="ghost" size="icon" className="h-8 w-8" onMouseDown={(e) => {e.preventDefault(); applyFormat('insertUnorderedList')}}>
                <List className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6 mx-1" />
            <Button variant="ghost" size="icon" className="h-8 w-8" onMouseDown={(e) => {e.preventDefault(); applyFormat('removeFormat')}} title="Clear Formatting">
                <Type className="h-4 w-4" />
            </Button>
        </div>
    );
}