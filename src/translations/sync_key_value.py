# This script is used to syncronize key/values of namespaces other that translation from en to all other langs

import json
import os
from shutil import copyfile

# Translations dir
#translations_dir = '../public/translations'
translations_dir = './'

# List of languages
languages = ['de', 'es', 'fr', 'it', 'ja', 'pl', 'pt', 'ru']

for en_file_name in os.listdir(os.path.join(translations_dir, 'en')):
    en_file_path = os.path.join(translations_dir, 'en', en_file_name)

    if en_file_name.endswith('translation.json'):
        continue

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
            # scan all en keys
            for key in list(data_en.keys()):
                # if the key is already translated copy it
                if key in data:
                    new_data[key] = data[key]
                # otherwise use new key from en
                else:
                    new_data[key] = data_en[key]

            # Write the modified data
            with open(lang_file_path, 'w', encoding='utf-8') as json_new_lang_file:
                json.dump(new_data, json_new_lang_file, ensure_ascii=False, indent=4)
                print(f"File '{en_file_name}' synchronized with '{lang}' folder.")
