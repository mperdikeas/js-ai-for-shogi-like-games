all:
	npm install
	npm run build
	npm run start
	npm run flow
	npm run test
clean:
	rm -fr node_modules/
	rm -f es5/*.js
	rm -f es5/*.map
