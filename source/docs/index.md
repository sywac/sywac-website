---
title: Quick Start
next: /docs/api-and-types.html
---
# Quick Start Guide

First install sywac from npm:

```bash
$ npm install --save sywac
```

Then create a `cli.js` file with code similar to this:

```javascript
#!/usr/bin/env node

const cli = require('sywac')
  .positional('<string>', { paramsDesc: 'A required string argument' })
  .boolean('-b, --bool', { desc: 'A boolean option' })
  .number('-n, --num <number>', { desc: 'A number option' })
  .help('-h, --help')
  .version('-v, --version')
  .showHelpByDefault()
  .outputSettings({ maxWidth: 75 })

module.exports = cli

async function main () {
  const argv = await cli.parseAndExit()
  console.log(JSON.stringify(argv, null, 2))
}

if (require.main === module) main()
```

Make the `cli.js` file executable:

```bash
$ chmod +x cli.js
```

And set up `cli.js` as the `"bin"` field in `package.json`:

```json
{
  "name": "example",
  "version": "0.1.0",
  "bin": "cli.js"
}
```

> Tip:
>
> You can use `npm init sywac` to easily set up the above and add sywac to your project.

Then test it out. Without any arguments, it will print the help text.

```bash
$ ./cli.js
Usage: cli <string> [options]

Arguments:
  <string>  A required string argument                  [required] [string]

Options:
  -b, --bool          A boolean option                            [boolean]
  -n, --num <number>  A number option                              [number]
  -h, --help          Show help                  [commands: help] [boolean]
  -v, --version       Show version number     [commands: version] [boolean]
```

Let's try passing some arguments:

```bash
$ ./cli.js hello -b -n 42
{
  "_": [],
  "string": "hello",
  "b": true,
  "bool": true,
  "n": 42,
  "num": 42,
  "h": false,
  "help": false,
  "v": false,
  "version": false
}
```

What happens if we pass flags without a string argument?

```bash
$ ./cli.js --bool
Usage: cli <string> [options]

Arguments:
  <string>  A required string argument                  [required] [string]

Options:
  -b, --bool          A boolean option                            [boolean]
  -n, --num <number>  A number option                              [number]
  -h, --help          Show help                  [commands: help] [boolean]
  -v, --version       Show version number     [commands: version] [boolean]

Missing required argument: string
```

Validation failed and sywac printed the help text with an error message. Let's check the exit code of that last run:

```bash
$ echo $?
1
```

This is a good sign that our CLI will play well with others.

Now continue to other pages for more detailed info about the API.
