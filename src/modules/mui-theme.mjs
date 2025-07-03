import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#048802',
            light: '#06a003',
            dark: '#036f02',
        },
        text: {
            primary: 'rgb( from var(--color-gold-one) r g b / 0.8)',
            secondary: 'rgb( from var(--color-gold-one) r g b / 0.6)',
        }
    },
    typography: {
        fontFamily: "bender, -apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    },
    components: {
        MuiBadge: {
            styleOverrides: {
                badge: {
                    fontWeight: '550',
                    fontSize: '0.75rem',
                },
            },
        },
        MuiSlider: {
            styleOverrides: {
                root: {
                    marginBottom: '0px',
                },
                mark: {
                    color: 'rgb(233, 233, 233)',
                    borderRadius: 'border-radius: 50%',
                    variants: [
                        {
                            props: (props) => {
                                return props.className?.includes('MuiSlider-markActive');
                            },
                            style: {
                                color: '#048802',
                                backgroundColor: '#048802',
                            },
                        },
                        {
                            props: (props) => props.size === 'small',
                            style: {
                                width: '7px',
                                height: '7px',
                            },
                        },
                        {
                            props: (props) => props.size === 'medium',
                            style: {
                                //width: '8px',
                                height: '8px',
                            },
                        },
                    ],
                },
                markLabel: {
                    fontSize: '12px',
                    lineHeight: '1',
                },
                rail: {
                    color: 'rgb(233, 233, 233)',
                    opacity: '1',
                    variants: [
                        {
                            props: (props) => props.track === 'inverted',
                            style: {
                                color: '#048802',
                            },
                        }
                    ],
                },
                thumb: {
                    width: '15px',
                    height: '15px',
                },
                track: {
                    variants: [
                        {
                            props: (props) => props.track === 'inverted',
                            style: {
                                color:'rgb(233, 233, 233)',
                                backgroundColor:'rgb(233, 233, 233)',
                                borderColor:'rgb(233, 233, 233)',
                            },
                        },
                    ],
                },
            },
        },
        MuiSwitch: {
            styleOverrides: {
                track: {
                    borderRadius: '3px',
                    "&::before": {
                        content: '""',
                        position: 'absolute',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '16px',
                        height: '16px',
                        left: '12px',
                        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="%23FFF" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/></svg>')`,
                    },
                    "&::after": {
                        content: '""',
                        position: 'absolute',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '16px',
                        height: '16px',
                        right: '12px',
                        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="%23FFF" d="M19,13H5V11H19V13Z" /></svg>')`,
                    }
                },
                thumb: {
                    borderRadius: '3px',
                }
            },
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    backgroundColor: 'var(--color-gunmetal-dark)',
                    borderColor: 'var(--color-gray)',
                    borderRadius: '4px',
                    borderStyle: 'solid',
                    borderWidth: '3px',
                    fontSize: '14px',
                    color: 'rgb( from var(--color-gold-one) r g b / 0.8)',
                },
            },
        },
    },
});

export default theme;
