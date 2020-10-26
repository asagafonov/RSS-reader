install:
	npm install

build:
	npm run build

publish:
	npm publish --dry-run

lint:
	npx eslint .

jest:
	npx --node-arg --experimental-vm-modules jest

test-coverage:
	npm test -- --coverage --coverageProvider=v8
