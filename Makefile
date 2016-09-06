all:
	npm install
	npm run build
	npm run start
	npm run flow-check
	npm run test
raze:
	rm -fr node_modules/
	rm -fr lib/
