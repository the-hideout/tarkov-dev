import { AvatarStack, Avatar } from '@primer/react';

import contributorJson from '../../data/contributors.json';

// inputs
// size: number (pixels) of the size of the avatar
// quality: number (pixels) of the quality of the avatar
// stack: boolean (true/false) to stack the avatars
function Contributors(props) {
    var quality;
    if (!props.quality) {
        quality = props.size;
    } else {
        quality = props.quality;
    }

    if (props.stack === true) {
        return (
            <AvatarStack>
                {contributorJson.map((contributor) => (
                    <Avatar
                        key={contributor.login}
                        src={`${contributor.avatar_url}&size=${quality}`}
                        alt={contributor.login}
                        size={props.size}
                        loading='lazy'
                    ></Avatar>
                ))}
            </AvatarStack>
        );
    } else {
        return (
            <>
                {contributorJson.map((contributor) => (
                    <a href={contributor.html_url} target="_blank" rel="noopener noreferrer" key={contributor.login}>
                        <Avatar
                            key={contributor.login}
                            size={props.size}
                            src={`${contributor.avatar_url}&size=${quality}`}
                            loading='lazy'
                        />
                    </a>
                ))}
            </>
        );
    }
}

export default Contributors;
