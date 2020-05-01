---
title: Style Hooks
prev: /docs/help-text.html
next: /docs/error-handling.html
---
# Style Hooks

## Overview

By default, sywac doesn't apply any coloring or styling to the text it generates. Using the `style()` configuration method, you can provide an object containing hooks used to style various parts of the generated text, including help text, parameters, examples, error messages, etc.

## Supported Style Hooks

The hooks currently supported are:

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

## Examples

The most common use case for style hooks is to apply coloring, which you can do using your favorite coloring package (such as `chalk` or `kleur`). Here is a complete example that applies color to different parts of the help text.

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

> Tip:
>
> If you need to apply coloring within a section and style hooks aren't granular enough, you can usually get by with some basic string manipulation. See the `flags` and `example` hooks above for examples of this approach.

In addition to coloring, you can use style hooks to change case or suppress sections altogether.

```js
sywac.style({
  // show group headers as uppercase
  group: str => str.toUpperCase(),
  // don't show any descriptions
  desc: str => ''
})
```

## Style Packages

Sywac styles can be distributed as stand-alone npm packages that are useable by multiple programs.

```js
sywac.style(require('sywac-style-basic'))
```

Here is a list of sywac styles out in the wild.

* [sywac-style-basic](https://github.com/sywac/sywac-style-basic)

> Tip:
>
> Know of a sywac style package, or have created your own? Submit a pull request for this documentation and add it to the list!

## Using output settings in your style

Your style hooks also have access to the user's [.outputSettings](/docs/sync-config.html#outputSettings-settings) configuration. Each property (such as `.indent`, `.lineSep`, etc.) is available as a property on `this`.

Consider this styling of the usage string, which pushes the command line example down to the next line and adds a `$` (bash prompt) to the front:

```js
sywac.style({
  usagePrefix: str => {
    return chalk.white(str.slice(0, 6)) +
      '\n  $ ' + chalk.magenta(str.slice(7))
  }
})

// Usage:
//   $ myapp blah
```

Although it works, it will look out-of-place in the user's help text if they have modified the default settings.

```js
sywac
  .outputSettings({ indent: 4, examplePrefix: '% ', lineSep: '\r\n' })
  .style(require('sywac-style-your-cool-style'))
```

If you are designing a style to be used by other people in their programs, you can ensure it will work for as many people as possible by respecting the configured output settings.

```js
sywac.style({
  usagePrefix: function (str) {
    return chalk.white(str.slice(0, 6)) +
      `${this.lineSep}${this.indent}${this.examplePrefix}` + chalk.magenta(str.slice(7))
  }
})

// Usage:\r
//     % myapp blah
```

> Tip:
>
> Don't forget to use a standard function instead of an arrow function for your style hook if you need to access `this`.
