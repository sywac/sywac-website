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

  - `cumulative`: boolean, default `true`

    If a flag is given multiple times, should the array value include all values from all flags (default) or only use the value(s) from the last flag given?

    For example, parsing `-a one two -a three four` in cumulative mode would result in an array value of `['one', 'two', 'three', 'four']`. If you turn this off, the result would be only `['three', 'four']`.

Returns the `Api` instance for method chaining.

See [Array](/docs/array-type.html) for further details and examples.

<a name="boolean"></a>
## `.boolean(flags, opts)`

<sup>Since 1.0.0</sup>

Add a flagged option that should be parsed as a boolean.

- `flags`: string, no default

  Defines the flags used in help text and aliases to expect when parsing.

  For example, `'-b, --bool'` would allow `-b` or `--bool` to be given when parsing.

- `opts`: object, no default

  See [common type properties](/docs/type-properties.html).

Returns the `Api` instance for method chaining.

See [Boolean](/docs/boolean-type.html) for further details and examples.

<a name="check"></a>
## `.check(handler)`

<sup>Since 1.0.0</sup>

Define any custom validation logic to run after all types have been parsed, validated, and coerced. The handler will not be called if help or version are explicitly requested.

- `handler`: function, no default

  An asynchronous function (may return a `Promise`) which may perform custom validation before control is returned to app logic.

  The function should report validation errors using the `context.cliMessage(msg)` method. If the function throws or returns a rejected `Promise`, an unexpected error will be given in resolved parsing results. If no messages are added to the `context` and the handler doesn't throw or return a rejected `Promise`, validation is assumed to be successful. If the function returns a `Promise`, sywac will wait until it resolves or rejects before continuing.

  This function will be passed the following two arguments:

  - `argv`: object

    An object representing parsed, validated, and coerced values. Each object property represents a mapping of alias to parsed value for each expected or encountered type.

  - `context`: [Context](/docs/context.html)

    An instance representing the state of parsing and execution. Validation errors should be reported via the `cliMessage(msg)` method.

Returns the `Api` instance for method chaining.

<a name="command"></a>
## `.command(dsl, opts)`

<sup>Since 1.0.0</sup>

Add a command that should be executed when encountered during parsing.

- `dsl`: string or module/object, no default

  If `dsl` is a string, it defines the canonical alias of the command and any positional arguments the command may accept. The first word in the string represents the canonical alias and any subsequent content will be treated as positional arguments.

  If `dsl` is an object, the dsl string should be specified via the `flags` property (similar to other types).

  If the canonical alias is `*`, the command will be considered a default command and will be hidden from help text unless a non-default alias is defined in `opts`.

  Since the dsl string will be used in help text (by default), it may contain content that should not be treated as explicit positional args, as long as you specify the `ignore` option in `opts`.

- `opts`: object or function, no default

  If `opts` is an object, it defines configuration for the command.

  If `opts` is a function, it specifies the [run handler](/docs/command-run.html) of the command without any detailed configuration.

  The following configuration properties are supported:

  - `flags`, `aliases`, `description`/`desc`, `hints`, `group`, `hidden` from [common type properties](/docs/type-properties.html)
  - `params`: array of objects
  - `paramsDsl`: string
  - `paramsDescription` or `paramsDesc`: string
  - `paramsGroup`: string
  - `ignore`: string or array of strings
  - `setup`: function, defines the [setup handler](/docs/command-setup.html)
  - `run`: function, defines the [run handler](/docs/command-run.html)

Returns the `Api` instance for method chaining.

Commands are a big topic. See [Command](/docs/command-type.html) or any of the COMMANDS pages for further details and examples.

<a name="configure"></a>
## `.configure(opts)`

> Needs docs!

<a name="custom"></a>
## `.custom(type)`

> Needs docs!

<a name="dir"></a>
## `.dir(flags, opts)`

> Needs docs!

<a name="enumeration"></a>
## `.enumeration(flags, opts)`

> Needs docs!

<a name="epilogue"></a>
## `.epilogue(epilogue)`

> Needs docs!

<a name="example"></a>
## `.example(example, opts)`

> Needs docs!

<a name="exampleOrder"></a>
## `.exampleOrder(orderArray)`

> Needs docs!

<a name="file"></a>
## `.file(flags, opts)`

> Needs docs!

<a name="groupOrder"></a>
## `.groupOrder(orderArray)`

> Needs docs!

<a name="help"></a>
## `.help(flags, opts)`

> Needs docs!

<a name="number"></a>
## `.number(flags, opts)`

> Needs docs!

<a name="numberArray"></a>
## `.numberArray(flags, opts)`

> Needs docs!

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

> Needs docs!

<a name="string"></a>
## `.string(flags, opts)`

> Needs docs!

<a name="stringArray"></a>
## `.stringArray(flags, opts)`

> Needs docs!

<a name="style"></a>
## `.style(hooks)`

> Needs docs!

<a name="usage"></a>
## `.usage(usage)`

> Needs docs!

<a name="version"></a>
## `.version(flags, opts)`

> Needs docs!
