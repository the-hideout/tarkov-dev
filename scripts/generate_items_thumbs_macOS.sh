#!/bin/bash

# Max height and width
HEIGHT=144
WIDTH=256

cd ../public/images/items/

# Remove old thumbs
rm *_thumb.jpg
rm *_thumb.png

for IMAGE in ./*.png
do
    ORIG_HEIGHT=$(sips -g pixelHeight "$IMAGE" | grep -o '[0-9]*$')
    ORIG_WIDTH=$(sips -g pixelWidth "$IMAGE" | grep -o '[0-9]*$')
    
    # New name for the thumb
    ORIGINAL=$(basename "$IMAGE")
    EXTENSION="${ORIGINAL##*.}"
    FILENAME="${ORIGINAL%.*}"
    NEW_FILENAME="./${FILENAME}_thumb.jpg"
    
    # Resizing to max height
    sips -s format jpeg -s formatOptions 70  --resampleWidth $WIDTH "$IMAGE" --out "$NEW_FILENAME"
    
    # Leave here as a reminder:
    # Without cropOffset it crops at center, but with 0 0 it also crops at center.
    # But if you try to offset from center with something like this:
    #RESIZED_HEIGHT=$(sips -g pixelHeight "$NEW_FILENAME" | grep -o '[0-9]*$')
    #CROP_OFFSET_Y=$(($HEIGHT - $RESIZED_HEIGHT))
    # it now crops from top-left...
    # So a true crop from top-left is impossible, you always need to lose at least one pixel...
    
    sips --cropOffset 1 0 --cropToHeightWidth $HEIGHT $WIDTH "$NEW_FILENAME" --out "$NEW_FILENAME"
    
done