#!/bin/bash

COMMIT_RANGE_BRANCH=main
STORE_PATH=libs/store/

store=$(git diff --name-only ${COMMIT_RANGE_BRANCH} | sort -u | uniq | grep ${STORE_PATH})


handle_error() {
    if [ $? -eq 0 ]
    then
        echo Tests passed
    else
        exit 1
    fi
}

# Check for store
if [ -z "$store"  ]
then
    echo There are no changes at store
else
    npm run lint:store
    handle_error
fi

