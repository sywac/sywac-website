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

> Needs docs!

<a name="outputSettings"></a>
## `.outputSettings(settings)`

> Needs docs!

<a name="path"></a>
## `.path(flags, opts)`

> Needs docs!

<a name="positional"></a>
## `.positional(dsl, opts)`

> Needs docs!

<a name="preface"></a>
## `.preface(icon, slogan)`

> Needs docs!

<a name="registerFactory"></a>
## `.registerFactory(name, factory)`

> Needs docs!

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

> Needs docs!

<a name="usage"></a>
## `.usage(usage)`

> Needs docs!

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
