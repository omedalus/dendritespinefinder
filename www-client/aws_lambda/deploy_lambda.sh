#!/bin/bash

FUNCTION_NAME="DendriteSpineFinder_${1}"

FILENAME="${FUNCTION_NAME}.zip"
cd $1
zip -r -9 "../${FILENAME}" * 

cd ..
S3BUCKET="dendritespinefinder"
S3KEY="lambdas/${FILENAME}"
S3DEST="s3://${S3BUCKET}/${S3KEY}"
aws s3 cp "${FILENAME}" "${S3DEST}"

aws lambda update-function-code --function-name "${FUNCTION_NAME}" --s3-bucket "${S3BUCKET}" --s3-key "${S3KEY}" --publish

TESTSFILE="$1/testurls.txt"
if [ -f "${TESTSFILE}" ]; then
  for URL in `cat ${TESTSFILE}`; do
    # Trim trailing newline
    URL=${URL%%[[:space:]]}

    curl $URL
    echo
  done
fi