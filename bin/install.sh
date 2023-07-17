#!/usr/bin/env bash
echo "Receiving token: "
echo $TOKEN
npm install --save git+https://$TOKEN:x-oauth-basic@github.com/nicok93/shipstation-system-api.git#main
npm install --save git+https://$TOKEN:x-oauth-basic@github.com/nicok93/easypost-system-api.git#main
npm install --save git+https://$TOKEN:x-oauth-basic@github.com/nicok93/sql-system-api.git#main