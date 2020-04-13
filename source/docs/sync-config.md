---
title: Synchronous Configuration
prev: /docs/api-and-types.html
next: /docs/async-parsing.html
---
# Synchronous Configuration

The API of sywac can be logically separated into two stages of an app's lifecycle: First is _configuration_, and second is _execution_.

This page covers all the methods designed for the configuration stage. Use these methods to configure an [`Api` instance](/docs/api-and-types.html), which mainly consists of telling it what types to expect (e.g. arguments, options, and commands), defining validation and control flow, and tweaking help text settings.

The following methods are listed in alphabetical order.

[.array(flags, opts)](#array)
[.boolean(flags, opts)](#boolean)
[.check(handler)](#check)
[.command(dsl, opts)](#command)
[.commandDirectory(dir, opts)](#commandDirectory)
[.configure(opts)](#configure)
[.custom(type)](#custom)
[.dir(flags, opts)](#dir)
[.enumeration(flags, opts)](#enumeration)
[.epilogue(epilogue)](#epilogue)
[.example(example, opts)](#example)
[.exampleOrder(orderArray)](#exampleOrder)
[.file(flags, opts)](#file)
[.groupOrder(orderArray)](#groupOrder)
[.help(flags, opts)](#help)
[.number(flags, opts)](#number)
[.numberArray(flags, opts)](#numberArray)
[.option(flags, opts)](#option)
[.outputSettings(settings)](#outputSettings)
[.path(flags, opts)](#path)
[.positional(dsl, opts)](#positional)
[.preface(icon, slogan)](#preface)
[.registerFactory(name, factory)](#registerFactory)
[.showHelpByDefault(boolean)](#showHelpByDefault)
[.strict(boolean)](#strict)
[.string(flags, opts)](#string)
[.stringArray(flags, opts)](#stringArray)
[.style(hooks)](#style)
[.usage(usage)](#usage)
[.version(flags, opts)](#version)

<a name="array"></a>
## `.array(flags, opts)`

<sup>Since 1.0.0</sup>

Add a flagged option that should be parsed as an array.

- &nbsp;`flags`: string, no default

  Defines the flags used in help text and aliases to expect when parsing.

  For example, `'-a, --array <values..>'` would allow `-a` or `--array` to be given when parsing.

- &nbsp;`opts`: object, no default

  In addition to [common type properties](/docs/type-properties.html), the object may also define:

  - &nbsp;`delimiter` or `delim`: string or RegExp, default `','`

    A delimiter used to split a single value into multiple values during parsing.

    For example, parsing `-a one,two` would add values `'one'` and `'two'` to the array instead of `'one,two'`.

  - &nbsp;`cumulative`: boolean, default `true`

    If a flag is given multiple times, should the array value include all values from all flags (default) or only use the value(s) from the last flag given?

    For example, parsing `-a one two -a three four` in cumulative mode would result in an array value of `['one', 'two', 'three', 'four']`. If you turn this off, the result would be only `['three', 'four']`.

Returns the `Api` instance for method chaining.

Example:

```js
sywac.array('-s, --services <a,b,c..>', {
  desc: 'Specify one or more services'
})
```

See [Array](/docs/array-type.html) for further details and examples.

<a name="boolean"></a>
## `.boolean(flags, opts)`

<sup>Since 1.0.0</sup>

Add a flagged option that should be parsed as a boolean.

- &nbsp;`flags`: string, no default

  Defines the flags used in help text and aliases to expect when parsing.

  For example, `'-b, --bool'` would allow `-b` or `--bool` to be given when parsing.

- &nbsp;`opts`: object, no default

  See [common type properties](/docs/type-properties.html).

Returns the `Api` instance for method chaining.

Example:

```js
sywac.boolean('-f, --force', {
  desc: 'Run the program regardless of warnings'
})
```

See [Boolean](/docs/boolean-type.html) for further details and examples.

<a name="check"></a>
## `.check(handler)`

<sup>Since 1.0.0</sup>

Define any custom validation logic to run after all types have been parsed, validated, and coerced. The handler will not be called if help or version are explicitly requested.

- &nbsp;`handler`: function, no default

  An asynchronous function (may return a `Promise`) which may perform custom validation before control is returned to app logic.

  The function should report validation errors using the `context.cliMessage(msg)` method. If the function throws or returns a rejected `Promise`, an unexpected error will be given in resolved parsing results. If no messages are added to the `context` and the handler doesn't throw or return a rejected `Promise`, validation is assumed to be successful. If the function returns a `Promise`, sywac will wait until it resolves or rejects before continuing.

  This function will be passed the following two arguments:

  - &nbsp;`argv`: object

    An object representing parsed, validated, and coerced values. Each object property represents a mapping of alias to parsed value for each expected or encountered type.

  - &nbsp;`context`: [Context](/docs/context.html)

    An instance representing the state of parsing and execution. Validation errors should be reported via the `cliMessage(msg)` method.

Returns the `Api` instance for method chaining.

Example:

```js
require('sywac')
  .file('-f <file>', {
    desc: 'Path to JSON file, optional, implies -k <key>',
    mustExist: true
  })
  .string('-k <key>', {
    desc: 'A key in JSON file, optional, implies -f <file>'
  })
  .check((argv, context) => {
    if (!argv.f && !argv.k) return
    // sync validation, fail-fast
    if (!argv.k) {
      return context.cliMessage('Cannot specify a file without a key')
    }
    if (!argv.f) {
      return context.cliMessage('Cannot specify a key without a file')
    }
    // async validation
    return new Promise((resolve, reject) => {
      require('fs').readFile(argv.f, 'utf8', (err, data) => {
        if (err) return reject(err)
        data = JSON.parse(data)
        if (!data[argv.k]) {
          return resolve(context.cliMessage(`File missing key ${argv.k}`))
        }
        argv.value = data[argv.k]
        resolve()
      })
    })
  })
  .parseAndExit()
  .then(argv => console.log(argv))
```

<a name="command"></a>
## `.command(dsl, opts)`

<sup>Since 1.0.0</sup>

Add a command that should be executed when encountered during parsing.

- &nbsp;`dsl`: string or module/object, no default

  If `dsl` is a string, it defines the canonical alias of the command and any positional arguments the command may accept. The first word in the string represents the canonical alias and any subsequent content will be treated as positional arguments.

  If `dsl` is an object, the dsl string should be specified via the `flags` property (similar to other types).

  If the canonical alias is `*`, the command will be considered a default command and will be hidden from help text unless a non-default alias is defined in `opts`.

  Since the dsl string will be used in help text (by default), it may contain content that should not be treated as explicit positional args, as long as you specify the `ignore` option in `opts`.

- &nbsp;`opts`: object or function, no default

  If `opts` is an object, it defines configuration for the command.

  If `opts` is a function, it specifies the [run handler](/docs/command-run.html) of the command without any detailed configuration.

  The following configuration properties are supported:

  - `flags`, `aliases`, `description`/`desc`, `hints`, `group`, `hidden` from [common type properties](/docs/type-properties.html)
  - `ignore`: string or array of strings, words to ignore in the dsl string
  - `params`: array of objects, used to configure each positional arg in dsl string, see [positional](#positional) method
  - `paramsDescription` or `paramsDesc`: string or array of strings, shortcut to add description for positional args without defining `params`
  - `paramsDsl`: string, this is mostly for internal use
  - `paramsGroup`: string, the help text group header for positional args, default `'Arguments:'`
  - `setup`: function, defines the [setup handler](/docs/command-setup.html)
  - `run`: function, defines the [run handler](/docs/command-run.html)

Returns the `Api` instance for method chaining.

Examples:

```js
// inline simple
sywac.commmand('get <key>', argv => console.log(`looking up key ${argv.key}`))

// inline advanced
sywac.command('remote <subcommand> [args]', {
  desc: 'Work with remotes via subcommand',
  ignore: ['<subcommand>', '[args]'],
  setup: sywac => {
    sywac
      .command('add <name> <url>', {
        desc: 'Add a new remote',
        paramsDesc: ['The name of the remote', 'The url of the remote'],
        run: (argv, context) => {
          if (remoteExists(argv.name)) {
            return context.cliMessage(`Remote ${argv.name} already exists`)
          }
          console.log(`adding remote ${argv.name} with url ${argv.url}`)
        }
      })
      .command('prune [name=origin]', {
        desc: 'Remove stale remote tracking branches',
        paramsDesc: 'Optionally specify the remote to prune',
        run: argv => console.log(`pruning ${argv.name}`)
      })
  }
})

// module
sywac.command(require('./commands/install'))
```

Commands are a big topic. See [Command](/docs/command-type.html) or any of the COMMANDS pages for further details and examples.

<a name="commandDirectory"></a>
## `.commandDirectory(dir, opts)`

<sup>Since 1.2.0</sup>

Load all files in the given directory and add each as a command module.

This is a convenient alternative to calling the [command method](#command) multiple times.

For example, instead of this:

```js
sywac
  .command(require('./commands/one'))
  .command(require('./commands/two'))
  .command(require('./commands/three'))
```

you could do this:

```js
sywac.commandDirectory('commands')
```

In order for a command module to be added, it must export one of the following (at least):

1. An object with a `flags` or `aliases` property (to define command dsl or aliases)
2. A function (used as the `run` handler, command alias will be the filename)

Any modules encountered that do not meet these criteria will be ignored.

Any files (matching the required extensions) that exist in the directory and cannot be loaded via `require()` will cause this method to throw an error.

- &nbsp;`dir`: string, default is equivalent of `'.'`

  The path to the directory to load modules from.

  It can be relative to the file calling this method, or it can be absolute.

  If not given, the directory of the calling file will be used (i.e. sibling files will be loaded).

  If a directory is given that does not exist, this method will throw an error.

  Nested directories in `dir` will be ignored.

- &nbsp;`opts`: object or function, default `{ extensions: ['.js'] }`

  The following configuration properties are supported:

  - `extensions`: array of strings, files in `dir` must have one of these extensions

Returns the `Api` instance for method chaining.

Examples:

```js
// relative 1
sywac.commandDirectory('commands')

// relative 2
sywac.commandDirectory('./commands')

// absolute
sywac.commandDirectory('/home/user/commands')

// equivalent of __dirname
sywac.commandDirectory()

// optionally specify required file extensions
sywac.commandDirectory('src/commands', {
  extensions: ['.js', '.coffee']
})
```

See [Command Modules](/docs/command-modules.html) for further details and examples.

<a name="configure"></a>
## `.configure(opts)`

<sup>Since 1.0.0</sup>

Configure the `Api` instance directly.

- &nbsp;`opts`: object, no default

  The following properties are supported:

  - &nbsp;`name`: string, default is basename of `process.argv[1]`

    Explicitly define the name of the program to use in help text. This value will be used in place of `$0` in [usage](#usage) content or [examples](#example).

  - &nbsp;`factories`: object

    Register factory methods for custom types. Each property should be the name of the factory and the factory function. See [registerFactory](#registerFactory) method.

  - &nbsp;`utils`: object, default is an instance of `require('sywac/lib/utils')`

    Override functions defined in a utility class.

Returns the `Api` instance for method chaining.

Example:

```js
sywac.configure({ name: 'example' })
```

See [Advanced Customizations](/docs/advanced-customizations.html) for further details and examples.

<a name="custom"></a>
## `.custom(type)`

<sup>Since 1.0.0</sup>

Add an instance of any `Type`, representing an expected option, argument, or command.

- &nbsp;`type`: instance of class extending `require('sywac/types/type')`

  The given object is expected to have certain methods, like `parse (context)`, conforming to the contract defined by the `Type` class. The easiest way to define a custom type is to extend one of the classes from `sywac/types`.

Returns the `Api` instance for method chaining.

Example:

```js
const url = require('url')
const TypeString = require('sywac/types/string')
class BaseUrl extends TypeString {
  get datatype () {
    return 'baseurl'
  }
  getValue (context) {
    let v = super.getValue(context)
    if (!v) return v
    const p = v.includes('//') ? url.parse(v) : url.parse('http://' + v)
    let proto = p.protocol || 'http:'
    if (!proto.endsWith('//')) proto += '//'
    v = proto + (p.host || '') + (p.pathname || '')
    return v.endsWith('/') ? v.slice(0, -1) : v
  }
}
sywac.custom(new BaseUrl({
  flags: '-u, --url <baseurl>',
  desc: 'A base url i.e. [protocol://]host[:port][/path]',
  defaultValue: 'localhost:8080'
}))
```

See [Custom Types](/docs/custom-types.html) for further details and examples.

<a name="dir"></a>
## `.dir(flags, opts)`

<sup>Since 1.0.0</sup>

Add a flagged option that should be parsed as a directory path.

This is equivalent to calling `.path(flags, Object.assign({ fileAllowed: false }, opts))`

- &nbsp;`flags`: string, no default

  Defines the flags used in help text and aliases to expect when parsing.

  For example, `'-d, --dir <directory>'` would allow `-d` or `--dir` to be given when parsing.

- &nbsp;`opts`: object, no default

  See [path](#path) method for list of supported properties.

Returns the `Api` instance for method chaining.

Example:

```js
sywac.dir('-d, --dir <directory>', {
  desc: 'A directory that must exist on the local file system',
  mustExist: true
})
```

See [Path / File / Dir](/docs/path-type.html) for further details and examples.

<a name="enumeration"></a>
## `.enumeration(flags, opts)`

<sup>Since 1.0.0</sup>

Add a flagged option that should be parsed as a string, whose value must be one of an enumerated set of choices.

- &nbsp;`flags`: string, no default

  Defines the flags used in help text and aliases to expect when parsing.

  For example, `'-e, --enum <value>'` would allow `-e` or `--enum` to be given when parsing.

- &nbsp;`opts`: object, no default

  In addition to [common type properties](/docs/type-properties.html), the object may also define:

  - &nbsp;`choices`: array of strings, no default

    The predefined set of values allowed, given as an array.

    Note that a `defaultValue` IS NOT required to be one of the valid choices.

  - &nbsp;`caseInsensitive`: boolean, default `true`

    Should case be ignored when matching a parsed value against predefined choices?

    For example, `one`, `One`, or `ONE` would be a valid value for choices `['one', 'two', 'three']`.

    Note that case-insensitive matching DOES NOT mean the value assigned in the resulting `argv` will be modified. The value given on the command line will remain intact.

Returns the `Api` instance for method chaining.

Example:

```js
sywac.enumeration('-e, --env <environment>', {
  desc: 'The deployment environment to work with',
  choices: ['local', 'dev', 'qa', 'stg', 'prd']
})
```

See [Enum](/docs/enum-type.html) for further details and examples.

<a name="epilogue"></a>
## `.epilogue(epilogue)`

<sup>Since 1.0.0</sup>

Define some content to display at the end of generated help text, just before any error messages.

If called more than once, it will overwrite the previous value.

- &nbsp;`epilogue`: string, no default

  The content to display in help text.

  If no value is given, it will remove any epilogue previously defined (e.g. at a higher command level).

Returns the `Api` instance for method chaining.

Example:

```js
sywac.epilogue('Visit http://sywac.io for detailed documentation')
```

See [Help Text](/docs/help-text.html) for further details and examples.

<a name="example"></a>
## `.example(example, opts)`

<sup>Since 1.0.0</sup>

Add an example command to display in generated help text, between the last group of types and the epilogue.

Call this method multiple times to display multiple examples.

In output, each example will be grouped according to the `group` property (default `'Examples:'`), preceded by a `description`/`desc` if given, and prefixed with the `examplePrefix` from [output settings](#outputSettings) (default `'$ '`).

- &nbsp;`example`: string, no default

  The example command to display in help text.

  Any uses of `$0` in this string will be replaced with the program name and any necessary commands, similar to the generated usage string.

- &nbsp;`opts`: object, no default

  The following configuration properties are supported:

  - &nbsp;`description` or `desc`: string, no default

    A description to display above the example command.

  - &nbsp;`group`: string, default `'Examples:'`

    Define the header this example should be grouped with when displayed.

  If no `description`/`desc` is given, the example will be placed directly under the last example given with a description. This allows you to apply one description to multiple examples.

Returns the `Api` instance for method chaining.

Example:

```js
sywac
  .example('$0 add upstream git@github.com:sywac/sywac.git', {
    desc: 'Add a remote named "upstream"',
    group: 'Git-Style Examples:'
  })
  .example('$0 prune upstream', {
    desc: 'Remove any stale tracking branches from "upstream"',
    group: 'Git-Style Examples:'
  })
  .example('$0 list', {
    desc: 'The following will all run the default "list" command'
  })
  .example('$0 ls')
  .example('$0')
```

See [Help Text](/docs/help-text.html) for further details and examples.

<a name="exampleOrder"></a>
## `.exampleOrder(orderArray)`

<sup>Since 1.0.0</sup>

If there are multiple example groups, you can control the order in which they should be displayed using this method.

If this method is not used, [examples](#example) will be displayed by group according to insertion order.

- &nbsp;`orderArray`: array of strings, default `['Examples:']`

  An array that defines the desired order of example groups/headers.

Returns the `Api` instance for method chaining.

Example:

```js
sywac.exampleOrder(['First Examples:', 'Second Examples:', 'Other Examples:'])
```

See [Help Text](/docs/help-text.html) for further details and examples.

<a name="file"></a>
## `.file(flags, opts)`

<sup>Since 1.0.0</sup>

Add a flagged option that should be parsed as a file path.

This is equivalent to calling `.path(flags, Object.assign({ dirAllowed: false }, opts))`

- &nbsp;`flags`: string, no default

  Defines the flags used in help text and aliases to expect when parsing.

  For example, `'-f, --file <file>'` would allow `-f` or `--file` to be given when parsing.

- &nbsp;`opts`: object, no default

  See [path](#path) method for list of supported properties.

Returns the `Api` instance for method chaining.

Example:

```js
sywac.file('-f, --file <file>', {
  desc: 'A file that must exist on the local file system',
  mustExist: true
})
```

See [Path / File / Dir](/docs/path-type.html) for further details and examples.

<a name="groupOrder"></a>
## `.groupOrder(orderArray)`

<sup>Since 1.0.0</sup>

Use this method to control the order in which type groups/headers should be displayed in help text.

This applies to all types: commands, positional arguments, and flagged options.

Any groups not included in the order will be displayed in insertion order after those included.

- &nbsp;`orderArray`: array of strings, default `['Commands:', 'Arguments:', 'Options:']`

  An array that defines the desired order of type groups/headers.

Returns the `Api` instance for method chaining.

Example:

```js
sywac.groupOrder([
  'Commands:',
  'Arguments:',
  'Required Options:',
  'Options:'
])
```

See [Help Text](/docs/help-text.html) for further details and examples.

<a name="help"></a>
## `.help(flags, opts)`

<sup>Since 1.0.0</sup>

Add a flagged option that should be parsed as a boolean and trigger output of help text.

- &nbsp;`flags`: string, default `'--help'`

  Defines the flags used in help text and aliases to expect when parsing.

  For example, `'-h, --help'` would allow `-h` or `--help` to be given when parsing.

- &nbsp;`opts`: object, no default

  In addition to [common type properties](/docs/type-properties.html), the object may also define:

  - &nbsp;`description` or `desc`: string, default `'Show help'`

    The description displayed in help text for this option.

  - &nbsp;`implicitCommand`: boolean, default `true`

    Whether to enable implicit commands for any multi-char flags/aliases defined for this option.

    An implicit command allows help text to be requested via command (e.g. `program help`) as well as by option/flag (e.g. `program whatever --help`).

  - &nbsp;`includePreface`: boolean, default `true`

    Whether the [preface](#preface) portion of help text (icon and slogan) should be displayed when help is explicitly requested.

  - &nbsp;`includeUsage`: boolean, default `true`

    Whether the [usage](#usage) portion of help text should be displayed when help is explicitly requested.

  - &nbsp;`includeGroups`: boolean, default `true`

    Whether the type groups portion of help text should be displayed when help is explicitly requested.

  - &nbsp;`includeExamples`: boolean, default `true`

    Whether the [examples](#example) portion of help text should be displayed when help is explicitly requested.

  - &nbsp;`includeEpilogue`: boolean, default `true`

    Whether the [epilogue](#epilogue) portion of help text should be displayed when help is explicitly requested.

Returns the `Api` instance for method chaining.

Example:

```js
// use all defaults
sywac.help()
// specify just flags
sywac.help('-h, --help')
// specify flags and opts
sywac.help('-h, --help', {
  desc: 'Show this help text',
  group: 'Global Options:',
  implicitCommand: false
})
```

See [Help and Version](/docs/help-version-type.html) for further details and examples.

<a name="number"></a>
## `.number(flags, opts)`

<sup>Since 1.0.0</sup>

Add a flagged option that should be parsed as a number.

- &nbsp;`flags`: string, no default

  Defines the flags used in help text and aliases to expect when parsing.

  For example, `'-n, --num <number>'` would allow `-n` or `--num` to be given when parsing.

- &nbsp;`opts`: object, no default

  See [common type properties](/docs/type-properties.html).

Returns the `Api` instance for method chaining.

Example:

```js
sywac
  .number('-p, --port <port>', {
    desc: 'Which port to the app should listen on',
    defaultValue: 8080
  })
  .number('--price <amount>', {
    desc: 'The price in US currency',
    defaultValue: 0.99,
    coerce: val => Number(val.toFixed(2))
  })
```

See [Number](/docs/number-type.html) for further details and examples.

<a name="numberArray"></a>
## `.numberArray(flags, opts)`

<sup>Since 1.0.0</sup>

Add a flagged option that should be parsed as an array of numbers.

- &nbsp;`flags`: string, no default

  Defines the flags used in help text and aliases to expect when parsing.

  For example, `'-n, --numbers <values..>'` would allow `-n` or `--numbers` to be given when parsing.

- &nbsp;`opts`: object, no default

  See [array](#array) method for list of supported properties.

Returns the `Api` instance for method chaining.

Example:

```js
sywac.numberArray('-s, --sum <x,y,z..>', {
  desc: 'Specify one or more numbers to add together'
})
```

See [Array](/docs/array-type.html) for further details and examples.

<a name="option"></a>
## `.option(flags, opts)`

<sup>Since 1.0.0</sup>

Add a flagged option that specifies its `type` in the `opts` configuration.

- &nbsp;`flags`: string, no default

  Defines the flags used in help text and aliases to expect when parsing.

  For example, `'-o, --opt <value>'` would allow `-o` or `--opt` to be given when parsing.

- &nbsp;`opts`: object, no default

  In addition to [common type properties](/docs/type-properties.html), the object should also define:

  - &nbsp;`type`: string, no default

    Specifies the factory name of the type to be added. This may be one of the following built-in types or any name that has been registered with a factory via the [registerFactory](#registerFactory) method: `'boolean'`, `'string'`, `'number'`, `'path'`, `'file'`, `'dir'`, `'enum'`, `'array'`

    A value prefixed with `'array:'` will add an array of the specified type.

    In 1.0.0, if no `type` is specified, no option will be added.

Returns the `Api` instance for method chaining.

Example using built-in types:

```js
sywac
  .option('-s, --str <string>', {
    type: 'string',
    desc: 'A string option'
  })
  .option('-i, --ingredients <a,b,c..>', {
    type: 'array:enum', // prefix "array:" to make an array of that type
    choices: ['pb', 'jelly', 'banana', 'apple', 'pickle'],
    desc: 'What would you like on your sandwich?'
  })
```

Example using custom type:

```js
const Type = require('sywac/types/type')
class Range extends Type {
  get datatype () {
    return 'range'
  }
  setValue (context, value) {
    if (typeof value !== 'string') {
      return context.assignValue(this.id, {start: NaN, finish: NaN})
    }
    const vals = value.split(/(\.)\1{1,}/)
    const numbers = vals.filter(v => v && v !== '.')
    context.assignValue(this.id, {
      start: Number(numbers[0]),
      finish: Number(numbers[1])
    })
  }
  validateValue (value) {
    return value &&
      typeof value.start === 'number' && !isNaN(value.start) &&
      typeof value.finish === 'number' && !isNaN(value.finish)
  }
  buildInvalidMessage (context, msgAndArgs) {
    super.buildInvalidMessage(context, msgAndArgs)
    const value = msgAndArgs.args[0]
    msgAndArgs.args[0] = `{start: ${value.start}, finish: ${value.finish}}`
    msgAndArgs.msg += ' Please specify two numbers.'
  }
}
sywac
  .registerFactory('range', opts => new Range(opts))
  .option('-r, --range <num..num>', {
    type: 'range',
    desc: 'Two numbers separated by two or more dots',
    defaultValue: '1..10',
    strict: true
  })
```

See [General Type Info](/docs/info-types.html) for more info on types.

<a name="outputSettings"></a>
## `.outputSettings(settings)`

<sup>Since 1.0.0</sup>

Configure output settings for generated help text.

- &nbsp;`settings`: object, no default

  An object representing output configuration, supporting the following properties:

  - &nbsp;`maxWidth`: number, default `Math.min(100, process.stdout.columns)`

    Define the maximum number of character/code-point columns allowed for generated help text.

  - &nbsp;`showHelpOnError`: boolean, default `true`

    Should generated help text be output when a validation error occurs?

    If this is disabled, only the error messages will be output on errors.

  - &nbsp;`examplePrefix`: string, default `'$ '`

    The prefix used before each [example](#example) command in help text.

  - &nbsp;`lineSep`: string, default `'\n'`

    A string used to separate lines in generated help text.

  - &nbsp;`sectionSep`: string, default `lineSep + lineSep`

    A string used to separate sections in generated help text.

  - &nbsp;`pad`: string, default `' '`

    A string that is multiplied to define padding between aligned columns in generated help text.

  - &nbsp;`indent`: string, default `pad + pad`

    A string used to define minimum indentation for each aligned column in generated help text.

  - &nbsp;`split`: RegExp, default `/\s/g`

    Used to define word boundaries when dividing a string (like a description) wider than `maxWidth` into multiple chunks/lines.

Returns the `Api` instance for method chaining.

Example:

```js
sywac.outputSettings({
  maxWidth: 75,          // limit help text to 75 columns
  showHelpOnError: false // do not show help text on validations errors
})
```

See [Help Text](/docs/help-text.html) for further details and examples.

<a name="path"></a>
## `.path(flags, opts)`

<sup>Since 1.0.0</sup>

Add a flagged option that should be parsed as a file or directory path.

- &nbsp;`flags`: string, no default

  Defines the flags used in help text and aliases to expect when parsing.

  For example, `'-p, --path <path>'` would allow `-p` or `--path` to be given when parsing.

- &nbsp;`opts`: object, no default

  In addition to [common type properties](/docs/type-properties.html), the object may also define:

  - &nbsp;`mustExist`: boolean, no default

    Enables validation that requires the specified path to either exist or not exist on the local file system.

    Use a value of `true` to require the path to exist locally.

    Use a value of `false` to require the path to NOT exist locally.

    If `mustExist` is undefined, the path will not be validated, to support cases where the path does not apply to the local file system (i.e. could be a remote path).

  - &nbsp;`dirAllowed`: boolean, default `true`

    Should this path allow directories?

    Note that if `mustExist` is undefined, this property is only suggestive, as commentary in help text.

  - &nbsp;`fileAllowed`: boolean, default `true`

    Should this path allow files?

    Note that if `mustExist` is undefined, this property is only suggestive, as commentary in help text.

  - &nbsp;`normalize`: boolean, default `false`

    Transform the parsed value into a normalized path string using [path.normalize(path)](https://nodejs.org/api/path.html#path_path_normalize_path).

  - &nbsp;`asObject`: boolean, default `false`

    Transform the parsed value into an object using [path.parse(path)](https://nodejs.org/api/path.html#path_path_parse_path).

Returns the `Api` instance for method chaining.

Example:

```js
sywac.path('-p, --path <path>', {
  desc: 'A normalized path',
  normalize: true
})
```

See [Path / File / Dir](/docs/path-type.html) for further details and examples.

<a name="positional"></a>
## `.positional(dsl, opts)`

<sup>Since 1.0.0</sup>

Add one or more positional arguments to your program without using [commands](#command).

- &nbsp;`dsl`: string, no default

  A string defining each positional argument, along with any flags that might be used to specify the argument as well.

  Each argument may consist of the following:

  1. flags, surrounded by `[` and `]` and followed by a space, e.g. `[--key] ` or `[-k|--key] `
  2. opening delimiter, e.g. use `[` if the argument is optional or `<` if the argument is required
  3. aliases and implicit type, separated by `|`, e.g. `name` or `name|email` or `string` or `file`
  4. explicit type, preceded by `:`, e.g. `:number` or `:enum` or `:path`
  5. variadic designation via `..`, which wraps the type in an array and accepts multiple values
  6. default value, preceded by `=`, e.g. `=package.json` or `=8080`
  7. closing delimiter (if opening delimiter was defined), e.g. use `]` or `>`

  The only thing required for each argument is its alias(es).

  If no flags are given, the argument will only be defined by position during parsing.

  If no opening or closing delimiters are given, the argument is assumed to be required.

  If no explicit type is given, the type will be defined implicitly by the first alias (if the alias matches the name of any registered factories) or will default to a string.

  Note that the dsl string will be used in generated usage and help text by default. Therefore you can include content in the dsl string that is purely commentary and should not be interpreted as explicit positional arguments. To do this, just specify the content to ignore via the `ignore` property in `opts`.

- &nbsp;`opts`: object, no default

  The following configuration properties are supported:

  - &nbsp;`ignore`: string or array of strings, no default

    Words to ignore in the dsl string.

    For example, if your dsl string was `'<name> [options] [others..]'` and wanted `[options]` and `[others..]` to be used only for help text, you could specify `ignore: ['[options]', '[others..]']` and then `<name>` would be the only positional arg added.

  - &nbsp;`params`: array of objects, default determined by dsl

    Each object in the array will be treated as `opts` for the respective type in the dsl string.

    If you specify `type` for the object in `params`, it will override the implicit/explicit type determined from the dsl string.

    Refer to [common type properties](/docs/type-properties.html) or the [option](#option) method or the method for the type to see all supported properties.

  - &nbsp;`paramsDescription` or `paramsDesc`: string or array of strings, no default

    Use this to add a description for the positional args in the dsl string without having to define `params`.

    If you provide a string, it will be used for the first positional arg in the dsl string.

    If you provide an array, each string will be used for the respective positional arg in the dsl string.

  - &nbsp;`paramsGroup`: string, default `'Arguments:'`

    Use this to define the help text group header for all positional args in the dsl string, instead of defining the `group` in every object of `params`.

Returns the `Api` instance for method chaining.

Example:

```js
// this defines two positional args:
// 1. service: string, required, positional only, no default
// 2. host or H: string, optional, positional or flag, default 'localhost'
sywac.positional('<service> [-H|--host] [host=localhost]', {
  paramsDesc: [
    'The service to deploy',
    'The target deployment host'
  ]
})
```

See [Positionals](/docs/positional-type.html) for further details and examples.

<a name="preface"></a>
## `.preface(logo, slogan)`

<sup>Since 1.0.0</sup>

Define a logo and/or slogan to display at the beginning of generated help text.

If called more than once, it will overwrite any previous value(s).

- &nbsp;`logo`: string, no default

  A string representing the logo for your CLI/app to display in generated help text.

  Try combining a [figlet](https://github.com/patorjk/figlet.js) ASCII font with [chalk](https://github.com/chalk/chalk) colors for a quick and pretty logo.

- &nbsp;`slogan`: string, no default

  A string representing a slogan or description for your CLI/app to display in generated help text.

Returns the `Api` instance for method chaining.

Example:

```js
const figlet = require('figlet')
sywac.preface(
  figlet.textSync('npm-check', 'Stop'),
  'Check for outdated, incorrect, and unused dependencies.'
)
```

See [Help Text](/docs/help-text.html) for further details and examples.

<a name="registerFactory"></a>
## `.registerFactory(name, factory)`

<sup>Since 1.0.0</sup>

Register a factory method/function that should be used to create type instances for the given name.

Use this to plug in your own types into the framework, or use it to override the factories for built-in types.

Note that this should be called _before_ other methods that use the factory.

- &nbsp;`name`: string, no default

  The name of the type referenced by [option](#option), [positional](#positional), or internally by any type-named method.

  For example, the factory for `'boolean'` is used by the [boolean](#boolean) method.

- &nbsp;`factory`: function, no default

  The function that returns a new type instance for each invocation.

  It should accept one argument representing the `opts` configuration object for the type.

Returns the `Api` instance for method chaining.

Example:

```js
sywac
  // add a new type
  .registerFactory('port', opts => new TypePort(opts))
  // override an existing one
  .registerFactory('boolean', opts => new CustomBoolean(opts))
```

See [Custom Types](/docs/custom-types.html) for further details and examples.

<a name="showHelpByDefault"></a>
## `.showHelpByDefault(boolean)`

<sup>Since 1.0.0</sup>

Enable a mode that outputs help text when no arguments or options are given on the command line.

In a command-driven configuration, this will add a default command (if no default command is explicitly defined) at each subcommand level that outputs the help text. The idea is to show help when no explicit command/subcommand is given on the command line.

- &nbsp;`boolean`: boolean, default `true`

  Whether to enable the mode or not.

  Any value other than `false` (including no value) will enable the mode.

Returns the `Api` instance for method chaining.

Example:

```js
sywac.showHelpByDefault()
```

<a name="strict"></a>
## `.strict(boolean)`

<sup>Since 1.3.0</sup>

In `strict` mode, unrecognized flags and positional arguments will generate an error.

- &nbsp;`boolean`: boolean, default `true`

  Whether to enable the mode or not.

  Any value other than `false` (including no value) will enable the mode.

Returns the `Api` instance for method chaining.

Example:

```js
sywac.strict()
```

> Tip:
>
> Default commands are considered unrecognized arguments, so if your program has a default command make sure to disable strict mode for that command.
>
> Example:
>
> ```js
> sywac
>   .strict()
>   .command('start', { run: () => console.log('start') })
>   .command('stop', { run: () => console.log('stop') })
>   .command('*', {
>     setup: sywac => {
>       sywac.strict(false)
>     },
>     run: () => console.log('default')
>   })
> ```

<a name="string"></a>
## `.string(flags, opts)`

<sup>Since 1.0.0</sup>

Add a flagged option that should be parsed as a string.

- &nbsp;`flags`: string, no default

  Defines the flags used in help text and aliases to expect when parsing.

  For example, `'-s, --str <string>'` would allow `-s` or `--str` to be given when parsing.

- &nbsp;`opts`: object, no default

  See [common type properties](/docs/type-properties.html).

Returns the `Api` instance for method chaining.

Example:

```js
sywac.string('-n, --name <name>', {
  desc: 'Specify a name'
})
```

See [String](/docs/string-type.html) for further details and examples.

<a name="stringArray"></a>
## `.stringArray(flags, opts)`

<sup>Since 1.0.0</sup>

Add a flagged option that should be parsed as an array of strings.

This is a more explicit form of `.array(flags, opts)`.

- &nbsp;`flags`: string, no default

  Defines the flags used in help text and aliases to expect when parsing.

  For example, `'-a, --array <values..>'` would allow `-a` or `--array` to be given when parsing.

- &nbsp;`opts`: object, no default

  See [array](#array) method for list of supported properties.

Returns the `Api` instance for method chaining.

Example:

```js
sywac.stringArray('-n, --names <a,b,c..>', {
  desc: 'Specify one or more names'
})
```

See [Array](/docs/array-type.html) for further details and examples.

<a name="style"></a>
## `.style(hooks)`

<sup>Since 1.0.0</sup>

Define functions to style respective portions of generated help text.

- &nbsp;`hooks`: object, no default

  The following properties are supported:

  - &nbsp;`usagePrefix`: function, no default

    Style the prefix part of generated usage, i.e. `'Usage: program'`

  - &nbsp;`usagePositionals`: function, no default

    Style the positionals part of generated usage, if any, as defined by [positional](#positional).

  - &nbsp;`usageCommandPlaceholder`: function, no default

    Style the command placeholder part of generated usage, if commands are defined, i.e. `'<command>'`

  - &nbsp;`usageArgsPlaceholder`: function, no default

    Style the args placeholder part of generated usage, if a defined command has positional args, i.e. `'<args>'`

  - &nbsp;`usageOptionsPlaceholder`: function, no default

    Style the options placeholder part of generated usage, if options are defined, i.e. `'[options]'`

  - &nbsp;`group`: function, no default

    Style each group header for defined types in generated help text.

  - &nbsp;`flags`: function, no default

    Style the flags for each defined type in generated help text.

  - &nbsp;`desc`: function, no default

    Style the description for each defined type and example in generated help text.

  - &nbsp;`hints`: function, no default

    Style the generated hints for each defined type in generated help text.

  - &nbsp;`groupError`: function, default is `group` style

    Style each group header for types that have validation errors.

  - &nbsp;`flagsError`: function, default is `flags` style

    Style the flags for each type that has a validation error.

  - &nbsp;`descError`: function, default is `desc` style

    Style the description for each type that has a validation error.

  - &nbsp;`hintsError`: function, default is `hints` style

    Style the generated hints for each type that has a validation error.

  - &nbsp;`messages`: function, no default

    Style the validation error messages.

  - &nbsp;`example`: function, default is `flags` style (since 1.1.0)

    Style each example command in generated help text.

  - &nbsp;`all`: function, no default (since 1.1.0)

    A hook to modify the rendered/styled help text as a whole.

Returns the `Api` instance for method chaining.

Example:

```js
const chalk = require('chalk')
sywac.style({
  // style usage components
  usagePrefix: str => {
    return chalk.white(str.slice(0, 6)) + ' ' + chalk.magenta(str.slice(7))
  },
  usageCommandPlaceholder: str => chalk.magenta(str),
  usagePositionals: str => chalk.green(str),
  usageArgsPlaceholder: str => chalk.green(str),
  usageOptionsPlaceholder: str => chalk.green.dim(str),
  // style normal help text
  group: str => chalk.white(str),
  flags: (str, type) => {
    let style = type.datatype === 'command' ? chalk.magenta : chalk.green
    if (str.startsWith('-')) style = style.dim
    return style(str)
  },
  desc: str => chalk.cyan(str),
  hints: str => chalk.dim(str),
  example: str => {
    return chalk.yellow(str.slice(0, 2)) +
      str.slice(2).split(' ').map(word => {
        return word.startsWith('-') ? chalk.green.dim(word) : chalk.gray(word)
      }).join(' ')
  },
  // use different style when a type is invalid
  groupError: str => chalk.red(str),
  flagsError: str => chalk.red(str),
  descError: str => chalk.yellow(str),
  hintsError: str => chalk.red(str),
  // style error messages
  messages: str => chalk.red(str)
})
```

See [Style Hooks](/docs/style-hooks.html) for further details and examples.

<a name="usage"></a>
## `.usage(usage)`

<sup>Since 1.0.0</sup>

Define your own static usage string for help text, or customize each part of the generated usage string.

- &nbsp;`usage`: string or object

  If `usage` is a string, it defines the full usage string portion of generated help text, disabling the auto-generated usage string.

  If `usage` is an object, it may define the following properties:

  - &nbsp;`usage`: string, default is auto-generated

    Defines the full usage string, disabling the auto-generated one.

  - &nbsp;`prefix`: string, default `'Usage: $0'`

    Defines the prefix part of the generated usage string.

    The `$0` will be replaced with the program name and any necessary commands.

  - &nbsp;`commandPlaceholder`: string, default `'<command>'`

    Defines the command placeholder part of the generated usage string.

    Only used if commands are defined.

  - &nbsp;`argsPlaceholder`: string, default `'<args>'`

    Defines the args placeholder part of the generated usage string.

    Only used if a command is defined with positional args.

  - &nbsp;`optionsPlaceholder`: string, default `'[options]'`

    Defines the options placeholder part of the generated usage string.

    Only used if flagged options are defined.

Returns the `Api` instance for method chaining.

Example:

```js
sywac.usage({
  prefix: 'Usage:\n  $0'
})
```

See [Help Text](/docs/help-text.html) for further details and examples.

<a name="version"></a>
## `.version(flags, opts)`

<sup>Since 1.0.0</sup>

Add a flagged option that should be parsed as a boolean and trigger output of the program version number.

- &nbsp;`flags`: string, default `'--version'`

  Defines the flags used in help text and aliases to expect when parsing.

  For example, `'-v, --version'` would allow `-v` or `--version` to be given when parsing.

- &nbsp;`opts`: object, no default

  In addition to [common type properties](/docs/type-properties.html), the object may also define:

  - &nbsp;`description` or `desc`: string, default `'Show version number'`

    The description displayed in help text for this option.

  - &nbsp;`implicitCommand`: boolean, default `true`

    Whether to enable implicit commands for any multi-char flags/aliases defined for this option.

    An implicit command allows the program version to be requested via command (e.g. `program version`) as well as by option/flag (e.g. `program whatever --version`).

  - &nbsp;`version`: string or function, default will be determined from package.json

    Define this property to forgo package.json lookup and use the given version instead.

    If `version` is a string, it will be output as the program version.

    If `version` is a function, it should be synchronous, and its returned value will be output as the program version.

Returns the `Api` instance for method chaining.

Example:

```js
// use all defaults
sywac.version()
// specify just flags
sywac.version('-v, --version')
// specify flags and opts
sywac.version('-v, --version', {
  desc: 'Output the program version number',
  group: 'Global Options:',
  implicitCommand: false,
  version: '1.2.3'
})
```

See [Help and Version](/docs/help-version-type.html) for further details and examples.
