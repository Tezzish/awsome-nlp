import React from "react";
import { Box, TextContent } from "@cloudscape-design/components";
import ClipLoader from 'react-spinners/ClipLoader';
import RatingStars from "./RatingStars";

function TranslatedPost({ isLoading, translatedPost, backendFinished, rating, changeRating, highlightedElementIndex, handleHighlight }) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(translatedPost, 'text/html');

    const paragraphs = Array.from(doc.querySelectorAll('[id]')).filter(element => element.id.startsWith('element-'));

    return (
        <Box variant="div" className={`right-side ${isLoading ? 'loading' : ''}`}>
            {isLoading ? (
                <ClipLoader color="#000000" loading={isLoading} size={50} />
            ) : (
                <TextContent variant="div" className="right-content">
                    {backendFinished && <RatingStars rating={rating} changeRating={changeRating} />}
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

export default TranslatedPost;
