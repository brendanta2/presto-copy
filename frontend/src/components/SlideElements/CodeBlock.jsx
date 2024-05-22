import React, { useEffect, useRef } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/monokai.css';
import styled from 'styled-components';

const CodeBlockWrapper = styled.pre`
  height: 100%;
  width: 100%;
  user-select: ${(props) => (props?.isPreview ? 'none' : 'text')};
`;

const StyledCodeBlock = styled.code`
  font-size: ${(props) => `${props?.fontSize}em`};
  background-color: #272822;
  height: 100%;
  width: 100%;
`;

/**
 * A Code Block element parameterised by:
 *  - Font size in em
 *  - Code in either JavaScript, Python or C syntax
 */
const CodeBlock = (
  { elementObj: { fontSize, displayText: code } },
  isPreview
) => {
  const codeBlockRef = useRef(null);

  /**
   * Highlight code block using highlight.js
   */
  useEffect(() => {
    hljs.highlightElement(codeBlockRef.current);

    // cleanup function to remove the highlighting of previous code
    return () => {
      codeBlockRef.current?.classList?.remove('hljs');
      delete codeBlockRef.current?.dataset?.highlighted;
    };
  }, [code, fontSize]);

  return (
    <CodeBlockWrapper isPreview={isPreview}>
      <StyledCodeBlock ref={codeBlockRef} fontSize={fontSize}>
        {code}
      </StyledCodeBlock>
    </CodeBlockWrapper>
  );
};

export default CodeBlock;
