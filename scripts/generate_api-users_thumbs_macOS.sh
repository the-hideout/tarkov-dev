#!/bin/bash

# Max height from css ".api-users-page-wrapper img"
HEIGHT=150

cd ../public/images/api-users/

# Remove old thumbs
rm *_thumb.jpg
rm *_thumb.png

for IMAGE in ./*.jpg ./*.png; do
    ORIG_HEIGHT=$(sips -g pixelHeight "$IMAGE" | grep -o '[0-9]*$')
    
    # New name for the thumb
    ORIGINAL=$(basename "$IMAGE")
    EXTENSION="${ORIGINAL##*.}"
    FILENAME="${ORIGINAL%.*}"
    NEW_FILENAME="./${FILENAME}_thumb.${EXTENSION}"
    
    if [[ $ORIG_HEIGHT -le $HEIGHT ]]
    then 
        #copy the original
        cp "$IMAGE" "$NEW_FILENAME"
    else
        #resizing to max height
        sips --resampleHeight $HEIGHT "$IMAGE" --out "$NEW_FILENAME"
    fi
    
done