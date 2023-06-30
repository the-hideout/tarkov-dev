#!/bin/bash

# Max height and width
HEIGHT=64
WIDTH=64
CWD="$(pwd)"

cd ../public/images/traders/

# Remove old icons
rm *-icon.jpg

for X in ./*portrait.png
do
    ORIG_HEIGHT=$(sips -g pixelHeight "${X}" | grep -o '[0-9]*$')
    ORIG_WIDTH=$(sips -g pixelWidth "${X}" | grep -o '[0-9]*$')
    
    # New name for the icon
    ORIGINAL=$(basename "$X")
    EXTENSION="${ORIGINAL##*.}"
    FILENAME="${ORIGINAL%.*}"
    FILENAME="${FILENAME//-portrait/}"
    NEW_FILENAME="./${FILENAME}-icon.jpg"
    
    # Resizing to max height
    sips -s format jpeg -s formatOptions 100  --resampleWidth $WIDTH "${X}" --out "${NEW_FILENAME}"
    
done

cd $CWD

cd ../public/images/bosses/

# Remove old icons
rm *-icon.jpg

for X in ./*portrait.png
do
    ORIG_HEIGHT=$(sips -g pixelHeight "${X}" | grep -o '[0-9]*$')
    ORIG_WIDTH=$(sips -g pixelWidth "${X}" | grep -o '[0-9]*$')
    
    # New name for the icon
    ORIGINAL=$(basename "$X")
    EXTENSION="${ORIGINAL##*.}"
    FILENAME="${ORIGINAL%.*}"
    FILENAME="${FILENAME//-portrait/}"
    NEW_FILENAME="./${FILENAME}-icon.jpg"
    
    # Resizing to max height
    sips -s format jpeg -s formatOptions 100  --resampleWidth $WIDTH "${X}" --out "${NEW_FILENAME}"
    
done