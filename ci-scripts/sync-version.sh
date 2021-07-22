#!/usr/bin/env bash

set -u -e

#
# Update Package version in the library package.json from root package.json
#

NEW_VERSION=$(node -p "require('./package.json').version")
echo "Updating packages.json under dist/libs with version ${NEW_VERSION}"

ANGULAR_VERSION=$(node -p "require('./package.json').dependencies['@angular/core']")
RXJS_VERSION=$(node -p "require('./package.json').dependencies['rxjs']")
NGRX_DATA=$(node -p "require('./package.json').dependencies['@ngrx/data']")
NGRX_EFFECTS=$(node -p "require('./package.json').dependencies['@ngrx/effects']")
NGRX_ENTITY=$(node -p "require('./package.json').dependencies['@ngrx/entity']")
NGRX_STORE=$(node -p "require('./package.json').dependencies['@ngrx/store']")
NGRX_DEV_TOOLS=$(node -p "require('./package.json').dependencies['@ngrx/store-devtools']")

cd ./dist

grep -rl 'VERSION_PLACEHOLDER' . | xargs perl -X -p -i -e "s/VERSION_PLACEHOLDER/${NEW_VERSION}/g"
grep -rl 'ANGULAR_VER_PLACEHOLDER' . | xargs perl -X -p -i -e "s/ANGULAR_VER_PLACEHOLDER/${ANGULAR_VERSION}/g"
grep -rl 'RXJS_VER_PLACEHOLDER' . | xargs perl -X -p -i -e "s/RXJS_VER_PLACEHOLDER/${RXJS_VERSION}/g"

grep -rl 'NGRX_DATA_VER_PLACEHOLDER' . | xargs perl -X -p -i -e "s/NGRX_DATA_VER_PLACEHOLDER/${NGRX_DATA}/g"
grep -rl 'NGRX_EFFECTS_VER_PLACEHOLDER' . | xargs perl -X -p -i -e "s/NGRX_EFFECTS_VER_PLACEHOLDER/${NGRX_EFFECTS}/g"
grep -rl 'NGRX_ENTITY_VER_PLACEHOLDER' . | xargs perl -X -p -i -e "s/NGRX_ENTITY_VER_PLACEHOLDER/${NGRX_ENTITY}/g"
grep -rl 'NGRX_STORE_VER_PLACEHOLDER' . | xargs perl -X -p -i -e "s/NGRX_STORE_VER_PLACEHOLDER/${NGRX_STORE}/g"
grep -rl 'NGRX_DEV_TOOLS_VER_PLACEHOLDER' . | xargs perl -X -p -i -e "s/NGRX_DEV_TOOLS_VER_PLACEHOLDER/${NGRX_DEV_TOOLS}/g"

cd ../

