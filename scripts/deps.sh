#!/bin/bash

mkdir -p app/libs/{css,js}
wget -O app/libs/css/mui.min.css 'https://cdn.muicss.com/mui-0.9.35/css/mui.min.css'
wget -O app/libs/js/mui.min.js 'https://cdn.muicss.com/mui-0.9.35/js/mui.min.js'
wget -O app/libs/js/upup.min.js 'https://github.com/TalAter/UpUp/raw/master/dist/upup.min.js'
wget -O app/upup.sw.min.js 'https://github.com/TalAter/UpUp/raw/master/dist/upup.sw.min.js'
