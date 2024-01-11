export default function makeID(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const charactersLength = characters.length;

    for (let i = 0; i < length; i = i + 1) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength),
        );
    }

    return result;
};
