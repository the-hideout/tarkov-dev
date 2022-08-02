#!/bin/bash

# Max height from css ".map-wrapper img"
HEIGHT=200

cd ../public/maps/

# Remove old thumbs
rm *_thumb.jpg

for X in ./*.jpg
do
    # New name for the thumb
    NEW_FILENAME=$(echo $X | sed 's/.jpg/_thumb.jpg/g')
    
    #resizing to max height of 300
    sips -s format jpeg -s formatOptions 70 --resampleHeight $HEIGHT "${X}" --out "${NEW_FILENAME}"
done