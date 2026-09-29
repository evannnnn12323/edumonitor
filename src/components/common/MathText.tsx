import React from 'react';
import katex from 'katex';

interface MathTextProps {
  text: string;
  className?: string;
}

export const MathText: React.FC<MathTextProps> = ({ text, className = '' }) => {
  if (!text) return null;

  // Split text by $...$ (inline) and $$...$$ (display)
  const renderFormattedText = (rawText: string) => {
    // Regex matches $$...$$ or $...$
    const parts = rawText.split(/(\$\$.*?\$\$|\$.*?\$)/gs);

    return parts.map((part, index) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        const math = part.slice(2, -2).trim();
        try {
          const html = katex.renderToString(math, { displayMode: true, throwOnError: false });
          return (
            <span
              key={index}
              className="my-2 block overflow-x-auto text-blue-400"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch (e) {
          return <code key={index} className="text-red-400">{part}</code>;
        }
      } else if (part.startsWith('$') && part.endsWith('$')) {
        const math = part.slice(1, -1).trim();
        try {
          const html = katex.renderToString(math, { displayMode: false, throwOnError: false });
          return (
            <span
              key={index}
              className="inline-block px-1 text-blue-400"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch (e) {
          return <code key={index} className="text-red-400">{part}</code>;
        }
      } else {
        return <span key={index}>{part}</span>;
      }
    });
  };

  return <span className={`inline-wrap ${className}`}>{renderFormattedText(text)}</span>;
};
