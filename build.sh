# 1. clean dist
rm -rf ./dist

# 2. tsc compile 
`npm bin`/tsc

# 3. copy lib to dist
cp -rf ./lib ./dist
