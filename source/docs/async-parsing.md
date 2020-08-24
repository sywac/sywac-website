---
title: Asynchronous Parsing, Validation, Execution
prev: /docs/sync-config.html
next: /docs/help-text.html
---
# Asynchronous Parsing, Validation, Execution

The API of sywac can be logically separated into two stages of an app’s lifecycle: First is _configuration_, and second is _execution_.

This page covers the two `Api` methods designed for the execution stage.

<a name="parse"></a>
## `.parse(args, state)`

<sup>Since 1.0.0</sup>

Parse given `args` (or `process.argv`), validate them according to [configuration](/docs/sync-config.html), execute any commands found, and return the detailed results of execution on resolution.

This method is suitable for any application use. It treats each call as a stateless operation, accepting the input it needs and returning (as a `Promise`) the output result. It makes no assumptions about the application and therefore does not call any methods like `console.log()` or `process.exit()`. Rather, any potential output content (like help text) or error status (like an exit code) is reported in the result.

Note that this method is safe to use concurrently, meaning it is suitable for server-side apps that may handle many concurrent requests (e.g. a REST/HTTP service) or process many concurrent messages (e.g. a chatbot).

- &nbsp;`args`: string or array of strings, default `process.argv.slice(2)`

  The arguments or message to parse, validate, and execute.

- &nbsp;`state`: optional user-defined state object

  Rarely used, helpful for passing per-request data to concurrent parse requests. Any state you pass here will be attached to the [context](/docs/context.html).

Returns a `Promise` that resolves to a result object, containing the following properties:

- &nbsp;`code`: number/integer

  Represents the exit code or error status of parsing, as the number of errors encountered.

  A value of `0` represents success, while a non-zero value means at least one validation or unexpected error occurred.

  Validation error messages will be included in `output` (typically along with help text) but will not be included in `errors`.

  Unexpected errors will be included in `errors` and formatted in `output`.

- &nbsp;`output`: string

  Buffered content containing any messages (delimited by `'\n'`) resulting from parsing.

  It is intended that `output` is suitable as a formatted response to the user. In a CLI application, you can use `console.log(output)` or similar, which the [parseAndExit](#parseAndExit) method will do for you.

  It is also intended that `output` will be an empty string unless errors occurred. While the framework sticks to this contract, any commands defined by the application are free to add their own messages to `output` via the `context.cliMessage(msg)` method, which may or may not represent error messages.

- &nbsp;`errors`: array of any thrown (`Error`) objects

  Represents any unexpected errors that occurred during parsing, validation, or execution.

  Note that the framework does not explicitly throw or reject internally, so any errors encountered are either the result of incorrect `Api` usage, your application code (custom handlers), or bugs in the framework.

- &nbsp;`argv`: object

  Represents the parsed arguments and options as key-value pairs, where each key is a configured alias of an argument/option and each value is the parsed/coerced value for that argument/option.

  For example, an option defined with flags `-s, --string <value>` would result in `argv.s` and `argv.string` having the same value.

  By default, `argv` will also contain a key of `_`, representing any unknown or unparsed flagless arguments as an array of strings, and keys for any unknown flagged options encountered, where each key represents the flag given and the value is either a boolean or a string.

  This means that sywac can be used without configuring the `Api` instance, but parsed values will be crude at best. We encourage you to leverage sywac's rich type system by configuring the `Api` with all expected arguments/options before parsing.

- &nbsp;`details`: object

  Represents parsing details, as an object containing the following properties:

  - &nbsp;`args`: array of strings

    The args used for parsing, which is the same as input to this method, translated to an array.

  - &nbsp;`types`: array of objects

    Each object represents detailed parsing results for all expected/configured `Type` instances.

    Each object contains the following properties:

    - &nbsp;`parent`: string, represents the command level the `Type` applies to
    - &nbsp;`aliases`: array of strings, all configured aliases for the `Type` instance
    - &nbsp;`datatype`: string, the underlying datatype represented by the `Type` instance
    - &nbsp;`value`: any, the parsed/coerced value of the `Type` instance
    - &nbsp;`source`: string, represents how the input value was defined (e.g. `'default'`, `'flag'`, `'positional'`, `'env'`)
    - &nbsp;`position`: array of numbers, represents the indexes (if any) in `args` used as input values for this `Type` instance
    - &nbsp;`raw`: array of strings, represents the unparsed input values for this `Type` instance

Example passing an explicit message to parse:

```js
const msg = 'hello --name world'
sywac.parse(msg).then(result => {
  console.log(JSON.stringify(result, null, 2))
  if (result.output) return respond(result.output)
  if (result.code !== 0) return respond('Error!', result.errors)
  return respond('Success')
})
```

<a name="parseAndExit"></a>
## `.parseAndExit(args, state)`

<sup>Since 1.0.0</sup>

This method is a wrapper around the [parse method](#parse) that is suitable for CLI apps.

If the result of parsing/validation/execution includes output (i.e. help text or validation messages) or indicates an error (i.e. `result.code !== 0`), then this method will automatically print the output to stdout (via `console.log()`) and exit the process (via `process.exit(result.code)`).

If the result does not include output and has a zero exit code, then a `Promise` is returned that resolves to `result.argv`. If your app logic needs access to the detailed results (beyond just the parsed `argv`), use the [parse method](#parse) instead.

Note that in a command-driven app, it may be perfectly reasonable to call this method and do nothing with the returned `Promise`, because command execution will have already completed.

- &nbsp;`args`: string or array of strings, default `process.argv.slice(2)`

  The arguments or message to parse, validate, and execute.

- &nbsp;`state`: optional user-defined state object

  Rarely used, included for feature parity with `parse`. Any state you pass here will be attached to the [context](/docs/context.html).

Returns a `Promise` that resolves to the `argv` object (subproperty of detailed results) representing the parsed arguments and options as key-value pairs, where each key is a configured alias of an argument/option and each value is the parsed/coerced value for that argument/option. See further description in the [parse method](#parse).

Example:

```js
sywac.parseAndExit().then(argv => {
  console.log(argv)
})
```
