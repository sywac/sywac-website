---
title: API Instance and Types
prev: /docs
next: /docs/sync-config.html
---
# API Instance and Types

The engine and primary API of sywac is represented by an `Api` instance, which is exposed in one of two ways:

1. Via the main export, as a singleton:

    ```js
    // sywac is a singleton Api instance
    const sywac = require('sywac')
    ```

2. Via the `Api` class:

    ```js
    const Api = require('sywac/api')
    const sywac = Api.get() // or new Api()
    ```

An `Api` instance represents a parsing configuration, which consists primarily of a set of `Type` instances.

Each `Type` instance represents one argument or option, along with its datatype, expected by the app.

An option is always specified by a flag (e.g. `--flag` or `-f` or `--key value` or `--key=value`) while an argument is generally specified by position alone (e.g. `program <argument>`), which is why they're referred to as _positional_ arguments or just _positionals_. For convenience, positional arguments in sywac may also be specified via flag, as long as you define them that way (e.g. `program [--arg] <argument>`).

The following table lists the types built into sywac along with the `Api` method(s) used to define/add them. Note that you can also [add your own types](/docs/custom-types.html) to sywac.

| __Type__                                                                    | __`Api` methods__           | __Factory name__ |
| --------------------------------------------------------------------------- | --------------------------- | ---------------- |
| [Boolean](/docs/boolean-type.html) option                                   | `.boolean(flags, opts)`     | `'boolean'`      |
| [String](/docs/string-type.html) option                                     | `.string(flags, opts)`      | `'string'`       |
| [Number](/docs/number-type.html) option                                     | `.number(flags, opts)`      | `'number'`       |
| [Path](/docs/path-type.html) option                                         | `.path(flags, opts)`        | `'path'`         |
| File option (see [Path](/docs/path-type.html))                              | `.file(flags, otps)`        | `'file'`         |
| Directory option (see [Path](/docs/path-type.html))                         | `.dir(flags, opts)`         | `'dir'`          |
| [Enum](/docs/enum-type.html) option                                         | `.enumeration(flags, opts)` | `'enum'`         |
| [Array](/docs/array-type.html) of strings option                            | `.array(flags, opts)`<br/>`.stringArray(flags, opts)` | `'array'` |
| [Array](/docs/array-type.html) of numbers option                            | `.numberArray(flags, opts)` | `'array'`        |
| [Help](/docs/help-version-type.html) option                                 | `.help(flags, opts)`        | `'helpType'`     |
| [Version](/docs/help-version-type.html) option                              | `.version(flags, opts)`     | `'versionType'`  |
| [Positional](/docs/positional-type.html) arguments<br/>(without command)    | `.positional(dsl, opts)`    | `'positional'`   |
| [Command](/docs/command-positionals.html) (with or without<br/>positionals) | `.command(dsl, opts)`       | `'commandType'`  |

Any unexpected/undeclared arguments or options encountered during parsing will automatically be handled by a special ["Unknown" type](/docs/unknown-type.html).

For further details on the `flags` and `opts` method parameters, see [General Type Info](/docs/info-types.html).

Internally, the `Api` instance maps type names to factory methods, which allows for the following:

1. Any option type that does not have an explicit `Api` method (e.g. array of enums) may be added via the `.option(flags, opts)` method, specifying the `type` in `opts`:

    ```js
    sywac.option('-l, --lang <languages..>', {
      type: 'array:enum',
      desc: 'Choose one or more programming languages',
      choices: ['js', 'java', 'go', 'ruby', 'rust']
    })
    ```

2. Positional arguments can specify their types via DSL string:

    ```js
    sywac.positional('<arg:file>', {
      paramsDesc: 'A file that must exist on the local file system',
      mustExist: true
    })
    ```

3. You can register your own types or override the default ones:

    ```js
    const TypeString = require('sywac/types/string')
    class CustomString extends TypeString {
      get datatype () {
        return 'custom'
      }
    }
    // registering a factory for 'string' means that .string(flags, opts)
    // will now use CustomString instead of the built-in TypeString
    sywac.registerFactory('string', opts => new CustomString(opts))
    ```

All configuration methods on an `Api` instance return the instance and so can be chained together. See [Synchronous Configuration](/docs/sync-config.html) for the full API of configuration methods.

Once an `Api` is fully configured, you can parse program arguments or any string/message (e.g. for a chatbot) via the asynchronous `.parse(args)` or `.parseAndExit(args)` methods. If no args are given, `process.argv` will be parsed by default. Each method returns a `Promise` that resolves once parsing, validation, and command execution (if any) completes. See [Asynchronous Parsing, Validation, Execution](/docs/async-parsing.html) for further details.
