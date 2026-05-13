import React from 'react';
import { EmojiDisplay } from '../components/emojis/EmojiPicker';

/**
 * 解析评论内容中的表情文字，将 [emojiKey] 格式的文字转换为表情组件
 * @param {string} content - 评论内容
 * @param {number} emojiSize - 表情大小，默认为 16
 * @returns {React.ReactNode} - 解析后的内容
 */
export const parseEmojiContent = (content, emojiSize = 16) => {
  if (!content || typeof content !== 'string') {
    return content;
  }

  // 匹配 [emojiKey] 格式的表情文字
  const emojiRegex = /\[([a-zA-Z_]+)\]/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = emojiRegex.exec(content)) !== null) {
    // 添加表情前的文本
    if (match.index > lastIndex) {
      const textBefore = content.slice(lastIndex, match.index);
      parts.push(textBefore);
    }

    // 添加表情组件
    const emojiKey = match[1];
    const emojiComponent = (
      <EmojiDisplay 
        key={`emoji-${match.index}-${emojiKey}`}
        emojiKey={emojiKey} 
        size={emojiSize} 
      />
    );
    parts.push(emojiComponent);

    lastIndex = match.index + match[0].length;
  }

  // 添加剩余的文本
  if (lastIndex < content.length) {
    const remainingText = content.slice(lastIndex);
    parts.push(remainingText);
  }

  // 如果没有找到表情，返回原始内容
  if (parts.length === 0) {
    return content;
  }

  return parts;
};

export default parseEmojiContent;