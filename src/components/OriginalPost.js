import React from "react";
import { Box, TextContent } from "@cloudscape-design/components";
import ClipLoader from 'react-spinners/ClipLoader';

function OriginalPost({ isLoading, originalPost, highlightedParagraphIndex, handleHighlight }) {
    const paragraphs = originalPost.split('<p>').filter((paragraph) => paragraph.length > 0);

    return (
        <Box variant="div" className={`left-side ${isLoading ? 'loading' : ''}`}>
            {isLoading ? (
                <ClipLoader color="#000000" loading={isLoading} size={50} />
            ) : (
                <TextContent variant="div" className="left-side-content">
                    {
                        paragraphs.map((paragraph, index) => (
                            <p
                                key={index}
                                onClick={() => handleHighlight(index)}
                                className={highlightedParagraphIndex === index ? 'highlighted' : ''}
                                dangerouslySetInnerHTML={{ __html: paragraph }}
                            />
                        ))
                    }
                </TextContent>
            )}
        </Box>
    );
}

export default OriginalPost;
