#!/usr/bin/env bash
echo "Receiving token: "
echo $1
npm install --save git+https://$1:x-oauth-basic@github.com/nicok93/shipstation-system-api.git#main
npm install --save git+https://$1:x-oauth-basic@github.com/nicok93/easypost-system-api.git#main
npm install --save git+https://$1:x-oauth-basic@github.com/nicok93/sql-system-api.git#main