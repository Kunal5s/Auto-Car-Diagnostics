
import * as React from 'react';

import {cn} from '@/lib/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({className, ...props}, ref) => {
    
    const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      e.preventDefault();
      const pastedHtml = e.clipboardData.getData('text/html');
      const pastedText = e.clipboardData.getData('text/plain');

      let contentToInsert = '';

      if (pastedHtml) {
        // A simple sanitizer to allow basic formatting tags and remove attributes like style/class
        const simplifiedHtml = pastedHtml
          .replace(/ class="[^"]*"/gi, '') // Remove class attributes
          .replace(/ style="[^"]*"/gi, '') // Remove style attributes
          .replace(/<(\/?)((?!strong|em|u|h1|h2|h3|h4|h5|h6|p|ul|li|a|br|img)\w*)\b[^>]*>/gi, ""); // Keep only safe tags
        contentToInsert = simplifiedHtml;
      } else {
        // If no HTML, just use plain text and escape it to be safe
        contentToInsert = pastedText
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;")
            .replace(/\n/g, '<br />');
      }

      // This is a more robust way to insert HTML content into a textarea/contentEditable
      // For a standard textarea, we can't insert HTML, so we rely on the parent state management.
      // The `onInput` or `onChange` handler should be fired by this.
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = textarea.value.substring(0, start) + pastedText + textarea.value.substring(end);
      
      // We'll update the parent component's state by calling its onChange handler
      // This is a workaround since we can't directly insert HTML into a textarea.
      // The parent component should then handle this new text.
      // The expectation is that the final content is stored as an HTML string.
      // The RichTextToolbar should probably work with a contentEditable div in the future.
      // For now, let's just insert the plain text version.
      document.execCommand('insertText', false, pastedText);
    };

    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className
        )}
        ref={ref}
        onPaste={handlePaste}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export {Textarea};
