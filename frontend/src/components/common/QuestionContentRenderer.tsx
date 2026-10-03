import React from 'react';
import { Box, Typography } from '@mui/material';

interface QuestionContentRendererProps {
  content?: string | null;
  variant?: 'body1' | 'body2';
  color?: string;
  sx?: Record<string, unknown>;
}

interface Segment {
  type: 'text' | 'image';
  text?: string;
  imageUrl?: string;
  altText?: string;
}

export const QuestionContentRenderer: React.FC<QuestionContentRendererProps> = ({
  content,
  variant = 'body1',
  color = '#14264B',
  sx = {},
}) => {
  if (!content) return null;

  // Parser for markdown images, html img tags, and direct image links
  const segments: Segment[] = [];
  // Matches ![alt](url) or <img ... src="url" ...> or direct http(s) image links on standalone line or space
  const regex = /!\[([^\]]*)\]\(([^)]+)\)|<img[^>]*src=["']([^"']+)["'][^>]*>|(https?:\/\/\S+\.(?:png|jpe?g|gif|webp|svg)(?:\?\S*)?)/gi;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        text: content.substring(lastIndex, match.index),
      });
    }

    if (match[1] !== undefined && match[2] !== undefined) {
      // Markdown: ![alt](url)
      segments.push({
        type: 'image',
        altText: match[1] || 'Question Graphic',
        imageUrl: match[2].trim(),
      });
    } else if (match[3] !== undefined) {
      // HTML img: <img src="url" />
      segments.push({
        type: 'image',
        altText: 'Question Graphic',
        imageUrl: match[3].trim(),
      });
    } else if (match[4] !== undefined) {
      // Direct image URL
      segments.push({
        type: 'image',
        altText: 'Question Graphic',
        imageUrl: match[4].trim(),
      });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < content.length) {
    segments.push({
      type: 'text',
      text: content.substring(lastIndex),
    });
  }

  return (
    <Box sx={{ ...sx }}>
      {segments.map((seg, idx) => {
        if (seg.type === 'image' && seg.imageUrl) {
          return (
            <Box
              key={idx}
              sx={{
                my: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                component="img"
                src={seg.imageUrl}
                alt={seg.altText || 'Question graphic'}
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  e.currentTarget.style.display = 'none';
                }}
                sx={{
                  maxWidth: '100%',
                  maxHeight: 380,
                  borderRadius: 2,
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
                  border: '1px solid #DCE6F5',
                  objectFit: 'contain',
                  bgcolor: '#ffffff',
                  p: 0.5,
                }}
              />
              {seg.altText && seg.altText !== 'Question Graphic' && (
                <Typography variant="caption" sx={{ color: '#7182A0', mt: 0.5, fontStyle: 'italic' }}>
                  {seg.altText}
                </Typography>
              )}
            </Box>
          );
        }

        return (
          <Typography
            key={idx}
            variant={variant}
            component="span"
            sx={{
              whiteSpace: 'pre-wrap',
              lineHeight: 1.6,
              color,
              display: 'inline',
            }}
          >
            {seg.text}
          </Typography>
        );
      })}
    </Box>
  );
};
