#!/bin/bash

# Max height from css ".api-users-page-wrapper img"
HEIGHT=150

cd ../public/images/api-users/

# Remove old thumbs
rm *_thumb.jpg
rm *_thumb.png

for X in ./*.jpg ./*.png
do
	ORIG_HEIGHT=$(sips -g pixelHeight "${X}" | grep -o '[0-9]*$')
	
    # New name for the thumb
    ORIGINAL=$(basename "$X")
    EXTENSION="${ORIGINAL##*.}"
    FILENAME="${ORIGINAL%.*}"
    NEW_FILENAME="./${FILENAME}_thumb.${EXTENSION}"
	
	if [[ $ORIG_HEIGHT -le $HEIGHT ]]
	then 
		#copy the original
		cp $X $NEW_FILENAME
	else
    	#resizing to max height
    	sips --resampleHeight $HEIGHT "${X}" --out "${NEW_FILENAME}"
	fi
    
done