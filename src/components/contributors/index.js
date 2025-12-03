import { AvatarGroup, Avatar, createTheme, ThemeProvider } from '@mui/material';

import contributorJson from '../../data/contributors.json';

// inputs
// size: number (pixels) of the size of the avatar
// quality: number (pixels) of the quality of the avatar
// stack: boolean (true/false) to stack the avatars
function Contributors(props) {
    if (!props.size) {
        return null;
    }

    var quality;
    if (!props.quality) {
        quality = props.size;
    } else {
        quality = props.quality;
    }

    const contributors = props.data && props.data.length ? props.data : contributorJson;

    if (!contributors.length) {
        return null;
    }

    const avatarTheme = createTheme({
        components: {
            // Name of the component
            MuiAvatar: {
                styleOverrides: {
                    // Name of the slot
                    root: {
                        // Some CSS
                        width: props.size,
                        height: props.size,
                        display: 'inline-block',
                        verticalAlign: 'middle',
                        border: 1,
                        borderStyle: 'solid',
                        marginRight: 2,
                    },
                },
            },
        },
    });

    if (props.stack === true) {
        return (
            <ThemeProvider theme={avatarTheme}>
                <AvatarGroup max={props.max ?? 10}>
                    {contributors.map((contributor) => (
                        <Avatar
                            key={contributor.login}
                            src={`${contributor.avatar_url}&size=${quality}`}
                            alt={contributor.login}
                            loading='lazy'
                        />
                    ))}
                </AvatarGroup>
            </ThemeProvider>
        );
    } else {
        return (
            <ThemeProvider theme={avatarTheme}>
                {contributors.map((contributor) => (
                    <a href={contributor.html_url} target="_blank" rel="noopener noreferrer" key={contributor.login}>
                        <Avatar
                            src={`${contributor.avatar_url}&size=${quality}`}
                            alt={contributor.login}
                            loading='lazy'
                        />
                    </a>
                ))}
            </ThemeProvider>
        );
    }
}

export default Contributors;
