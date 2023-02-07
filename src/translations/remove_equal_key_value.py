# This script is used to remove the key value pairs that are equal so that the file can be imported in POEditor

import json
import os

# Translations dir
#translations_dir = '../public/translations'
translations_dir = './'

# List of languages
languages = ['de', 'es', 'fr', 'it', 'ja', 'pl', 'pt', 'ru']

# Output directory
output_dir = 'poeditor'

# Check if output directory exists and create it if not
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# Read JSON data from file
with open(os.path.join(translations_dir, 'en', 'translation.json'), encoding='utf-8') as json_file:
    data_en = json.load(json_file)

for lang in languages:
    for file in os.listdir(os.path.join(translations_dir, lang)):
        if file.endswith('translation.json'):
            # Read JSON data from file
            with open(os.path.join(translations_dir, lang, file), encoding='utf-8') as json_file:
                data = json.load(json_file)

            # remove key where key == value
            for key in list(data.keys()):
                # but first check the en version
                if key in data_en:
                    if data_en[key] == data[key]:
                        # del data[key]
                        data[key] = ''
                elif key == data[key]:
                    # del data[key]
                    data[key] = ''

            # Write the modified data to the output folder with language appended to the file name
            new_file = file.replace('.json', f'_{lang}.json')
            with open(os.path.join(output_dir, new_file), 'w', encoding='utf-8') as json_file:
                json.dump(data, json_file, ensure_ascii=False, indent=4)
