import React from "react";
import { Box, TextContent } from "@cloudscape-design/components";
import ClipLoader from 'react-spinners/ClipLoader';
import RatingStars from "./RatingStars";

function TranslatedPost({ isLoading, translatedPost, backendFinished, rating, changeRating, highlightedParagraphIndex, handleHighlight }) {
    const paragraphs = translatedPost.split('<p>').filter((paragraph) => paragraph.length > 0);

    return (
        <Box variant="div" className={`right-side ${isLoading ? 'loading' : ''}`}>
            {isLoading ? (
                <ClipLoader color="#000000" loading={isLoading} size={50} />
            ) : (
                <TextContent variant="div" className="right-content">
                    {backendFinished && <RatingStars rating={rating} changeRating={changeRating} />}
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

export default TranslatedPost;
