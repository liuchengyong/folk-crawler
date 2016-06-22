#!/bin/bash
cd ~/Projects/folk-crawler/news
MYDATE=`date +%Y%m%d`
mkdir ./data/$MYDATE
node index.js
node upload.js
