#!/bin/sh

# Publishing the spells.
echo Destination: ${1:-~/public_html/arm5react}
if test -w ${1:-~/public_html/arm5react}; then 
    cp ../styles.css ../guidelines.{txt,json} ../.htaccess ../spells.{html,js} ../modules.spellguidelines.js ../Spells.jsx ../SpellView.jsx ../config.spells.js ../favicon.svg ${1:-~/public_html/arm5react}/
fi
