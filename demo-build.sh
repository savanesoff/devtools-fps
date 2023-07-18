# replaces tsconfig.json with custom tsconfig.json specified by the user
# to build demo app with custom tsconfig.json using vite
#  Usage: demo-build.sh --path <path-to-custom-ts-config>
#  Example: demo-build.sh --path ./tsconfig.demo.json
#  Note: tsconfig.json is renamed to tsconfig.json.bak
#  Note: tsconfig.json.bak is renamed to tsconfig.json after the build
# Don't forget to ensure "build.outDir" is set to "dist-demo" in vite.config.ts
# "build": {
#     "outDir": "dist-demo",
#  }
# Also, ensure it matches custom ts config "outDir" value

if [ $# -eq 0 ]
  then
    echo "No arguments supplied"
    exit 1
fi

if [ $1 != "--path" ]
  then
    echo "--path argument is required"
    echo "Usage: demo-build.sh --path <path-to-custom-ts-config>"
    echo $1
    exit 1
fi

if [ -z $2 ]
  then
    echo "--path value is required"
    echo "Usage: demo-build.sh --path <path-to-custom-ts-config>"
    exit 1
fi
# extract the path to the custom ts config
CUSTOM_TS_CONFIG=$2
echo "path to custom ts config: $CUSTOM_TS_CONFIG"

# rename the tsconfig.json to tsconfig.json.bak
mv ./tsconfig.json ./tsconfig.json.bak

# copy the custom ts config to tsconfig.json
cp $CUSTOM_TS_CONFIG ./tsconfig.json

# searchString="/dist/"
# replaceString="/dist-demo/"
# filename="package.json"
# sed -i s:$searchString:$replaceString:gi $filename
#  "types": "./dist/types/index.d.ts",
#   "main": "./dist/index.js",
# build the library
echo "building library"
pnpm  tsc &&  pnpm vite build --base=./
 

# rename the tsconfig.json.bak to tsconfig.json
mv ./tsconfig.json.bak ./tsconfig.json