import ReactMarkdown from 'react-markdown';
import {Helmet} from 'react-helmet';
import remarkGfm from 'remark-gfm'

import EmItemTag from '../../components/em-item-tag';

const guideContent = `GUIDE_CONTENT_GOES_HERE`;

function GUIDE_FUNCTION_NAME() {
    return [
        <Helmet
            key = {'GUIDE_NAME-helmet'}
        >
            <meta
                charSet='utf-8'
            />
            <title>
                Escape from Tarkov GUIDE_NAME guide
            </title>
            <meta
                name = 'description'
                content = 'Escape from Tarkov GUIDE_NAME guide'
            />
        </Helmet>,
        <div
            className = {'page-wrapper'}
            key = 'GUIDE_NAME-page-wrapper'
        >
            <ReactMarkdown
                components={{
                    // Rewrite `em`s (`*like so*`) to `i` with a red foreground color.
                    em: EmItemTag,
                }}
                remarkPlugins={[
                    remarkGfm,
                ]}
            >
                {guideContent}
            </ReactMarkdown>
        </div>,
    ];
};

export default GUIDE_FUNCTION_NAME;
