# This script is used to remove the key value pairs that are equal so that the file can be imported in POEditor

import json
import os

# Translations dir
#translations_dir = '../public/translations'
translations_dir = './'

# List of languages
languages = ['de', 'es', 'fr', 'it', 'ja', 'pl', 'pt', 'ru', 'zh']

# Output directory
output_dir = 'poeditor'

# Check if output directory exists and create it if not
if not os.path.exists(output_dir):
    os.makedirs(output_dir)


for en_file_name in os.listdir(os.path.join(translations_dir, 'en')):
    en_file_path = os.path.join(translations_dir, 'en', en_file_name)
    
    # Read JSON data from file
    with open(en_file_path, encoding='utf-8') as json_en_file:
        data_en = json.load(json_en_file)
    
    for lang in languages:
        lang_file_path = os.path.join(translations_dir, lang, en_file_name)

        # If the file doesn't exist in the language folder, copy it from 'en' folder
        if not os.path.exists(lang_file_path):
            #copyfile(en_file_path, lang_file_path)
            #print(f"File '{en_file_name}' copied to '{lang}' folder.")
            print(f"File '{en_file_name}' is not present in '{lang}' folder.")
        else:
            # Read JSON data from file
            with open(lang_file_path, encoding='utf-8') as json_lang_file:
                data = json.load(json_lang_file)

            new_data = {}
            # remove key where key == value
            for key in list(data.keys()):
                # but first check the en version
                if key in data_en:
                    if data_en[key] == data[key]:
                        # del data[key]
                        continue
                    else:
                        new_data[key] = data[key]
                elif key == data[key]:
                    # del data[key]
                    continue
                else:
                    new_data[key] = data[key]

            # Write the modified data to the output folder with language appended to the file name
            new_file = lang + '_' + en_file_name
            with open(os.path.join(output_dir, new_file), 'w', encoding='utf-8') as json_file:
                json.dump(new_data, json_file, ensure_ascii=False, indent=4)
                print(f"File '{en_file_name}' cleaned from English values and saved as '{new_file}'.")

            # Read the destination JSON file or create an empty dictionary
            all_file_name = 'all_' + lang + '.json'
            all_file_path = os.path.join(output_dir, all_file_name)
            if os.path.exists(all_file_path):
                with open(all_file_path, 'r', encoding='utf-8') as all_json_file:
                    all_data = json.load(all_json_file)
            else:
                all_data = {}

            # Add all entries from the source to the destination
            all_data.update(new_data)

            # Write back the updated destination file
            with open(all_file_path, 'w', encoding='utf-8') as all_json_file:
                json.dump(all_data, all_json_file, ensure_ascii=False, indent=4)
                print(f"File '{all_file_name}' updated with '{new_file}'.")

