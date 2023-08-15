import { useRef, useEffect } from 'react';

function CanvasGrid(props) {
    const canvas = useRef(null);
    let boxes = [];

    boxes = boxes
        .concat(
            props.grid?.map((pocket) => {
                const returnData = {
                    startX: pocket.col * 20 + pocket.col * 2,
                    startY: pocket.row * 20 + pocket.row * 2,
                    horizontal: pocket.width,
                    vertical: pocket.height,
                };

                return returnData;
            }),
        )
        .filter(Boolean);

    // initialize the canvas context
    useEffect(() => {
        const canvasEle = canvas.current;

        if (!canvasEle) {
            return;
        }

        canvasEle.width = canvasEle.clientWidth;
        canvasEle.height = canvasEle.clientHeight;

        const ctx = canvasEle.getContext('2d');
        boxes.map((info) => drawPocket(info, ctx));
    });

    if (!props.height || !props.width) {
        return null;
    }

    if (!boxes) {
        return null;
    }

    const drawPocket = (info, ctx) => {
        let { startX, startY, horizontal, vertical } = info;
        const height = 20;
        const width = 20;

        ctx.beginPath();
        ctx.fillStyle = '#000'; // outer border color
        ctx.fillRect(startX, startY, horizontal * 20 + 2, vertical * 20 + 2);

        startX = startX + 1;
        startY = startY + 1;

        for (let i = 0; i < horizontal * vertical; i = i + 1) {
            const x = startX + (i % horizontal) * 20;
            const y = startY + Math.floor(i / horizontal) * 20;

            drawSquare(
                {
                    x: x,
                    y: y,
                    width: width,
                    height: height,
                    fillStyle: '#181818', // inner border color
                },
                ctx,
            );

            drawSquare(
                {
                    x: x + 1,
                    y: y + 1,
                    width: width - 2,
                    height: height - 2,
                    fillStyle: '#121212', // inner background color
                },
                ctx,
            );

            // ctx.fillStyle = '#ffffff';
            // ctx.font = '10px serif';
            // ctx.fillText(i, x + 8, y + 15);
        }
    };

    const drawSquare = (info, ctx) => {
        ctx.beginPath();
        ctx.fillStyle = info.fillStyle;
        ctx.fillRect(info.x, info.y, info.width, info.height);
    };

    return (
        <canvas
            height={props.height * 22}
            width={props.width * 22}
            ref={canvas}
        ></canvas>
    );
}

export default CanvasGrid;
