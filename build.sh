# 1. clean dist
rm -rf ./dist

# 2. tsc compile
./node_modules/.bin/tsc

# 3. copy lib to dist
cp -rf ./lib ./dist
