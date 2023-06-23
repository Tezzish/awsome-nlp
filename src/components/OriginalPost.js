import React from "react";
import { Box, TextContent } from "@cloudscape-design/components";
import ClipLoader from 'react-spinners/ClipLoader';

function OriginalPost({ isLoading, originalPost, highlightedElementIndex, handleHighlight }) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(originalPost, 'text/html');
    const elements = doc.querySelectorAll('*');

    const paragraphs = Array.from(elements).filter((element) => element.id);

    return (
        <Box variant="div" className={`left-side ${isLoading ? 'loading' : ''}`}>
            {isLoading ? (
                <ClipLoader color="#000000" loading={isLoading} size={50} />
            ) : (
                <TextContent variant="div" className="left-side-content">
                    {paragraphs.map((paragraph) => (
                        React.createElement(
                            paragraph.tagName.toLowerCase(),
                            {
                                key: paragraph.id,
                                onClick: () => handleHighlight(paragraph.id),
                                className: highlightedElementIndex === paragraph.id ? 'highlighted' : '',
                                dangerouslySetInnerHTML: { __html: paragraph.innerHTML }
                            }
                        )
                    ))}
                </TextContent>
            )}
        </Box>
    );
}

export default OriginalPost;
