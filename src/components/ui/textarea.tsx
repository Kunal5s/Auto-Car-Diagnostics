
import * as React from 'react';

import {cn} from '@/lib/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({className, ...props}, ref) => {
    
    const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      e.preventDefault();
      const text = e.clipboardData.getData('text/html') || e.clipboardData.getData('text/plain');
      
      // Basic sanitization: allow only a few safe tags.
      // This is not a full XSS-proof sanitizer but prevents most unwanted tags.
      const simplifiedHtml = text
        .replace(/<(\/?)((?!strong|em|u|h1|h2|h3|p|ul|li|a|br|img)\w*)\b[^>]*>/gi, "") // Remove most tags but keep safe ones
        .replace(/\s*style="[^"]*"/gi, ""); // Remove style attributes

      document.execCommand('insertHTML', false, simplifiedHtml);
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
