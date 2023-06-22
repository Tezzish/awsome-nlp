import { Box, TextContent } from "@cloudscape-design/components";
import ClipLoader from 'react-spinners/ClipLoader';

function OriginalPost({ isLoading, originalPost }) {
    return (
        <Box variant="div" className={`left-side ${isLoading ? 'loading' : ''}`}>
            {isLoading ? (
                <ClipLoader color="#000000" loading={isLoading} size={50} />
            ) : (
                <TextContent variant="div" className="left-side-content">
                    <div dangerouslySetInnerHTML={{ __html: originalPost }} />
                </TextContent>
            )}
        </Box>
    );
}

export default OriginalPost;
