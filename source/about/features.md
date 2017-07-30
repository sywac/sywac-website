---
title: Features
prev: /about
next: /about/comparison-matrix.html
---
# Features

## Single package install

Let's keep things lightweight. No need to install a bunch of dependencies, many of which you probably don't need or want, just to build a CLI.

```bash
$ npm i --save sywac
+ sywac@1.0.0
added 1 package in 1.048s
```

A major goal of sywac has always been to deliver a robust CLI framework as a single standalone dependency.

Does this go against the Unix philosophy of ["do one thing and do it well"](https://en.wikipedia.org/wiki/Unix_philosophy#Do_One_Thing_and_Do_It_Well)? Possibly. All I really know is that, as a CLI author myself, I started avoiding the use of certain packages because I didn't want users of my CLI (and the systems on which they were installed) to have to download dozens of packages just to use my one simple program. You may disagree, and that's fine. Everyone can choose based on what's important to them.

## Asynchronous parsing, validation, and command execution

Most CLI libraries use synchronous parsing - which makes sense when parsing logic is centralized and doesn't need to account for asynchronous sources of input - but this is exactly what makes sywac different. It uses an engine based on native `Promise` support to provide a highly performant, parsing-via-delegation system that supports asynchronous inputs, validation of those inputs, and well-defined control flow of application logic.

For details on this part of the API, see [Asynchronous Parsing, Validation, Execution](/docs/async-parsing.html).

## Type-based argument parsing

Instead of telling a centralized parser about what types to expect, sywac delegates parsing to separate instances of each defined type so there is no centralized parser. This allows for a pluggable framework where it's easy to customize the parsing logic in a modular way, if you need to. It also means configuration of each type is encapsulated per instance for a clear separation of concerns.

To read more aboue how this works, see [API Instance and Types](/docs/api-and-types.html).

## Plug in your own types or override/extend the built-in ones

Sywac comes with a set of basic argument/option types, exposed via individual classes. If there's a special type that sywac doesn't have built-in support for, you can plug your own in (or perhaps plug in a custom type that someone else wrote). You can even override the built-in types if they don't do exactly what you want them to do.

For examples of custom types and how to plug them in, see [Custom Types](/docs/custom-types.html).

## Support for simple CLIs or complex nested command trees

Sywac supports the simplest of CLIs, perhaps accepting only one or two arguments, but it also has the power to support advanced command-driven CLIs where each command can have its own tree of arbitrary nested commands and arguments.

For simpler use-cases, see the [Quick Start Guide](/docs/).

For details on command support, see [Commands](/docs/command-type.html).

## First-class support for positional arguments, with or without commands

Positional arguments make for great CLIs, since you can give a program its main arguments without requiring any fancy flags or argument prefixes. Sadly, other popular CLI libraries only support positional arguments in certain use-cases or don't document them in generated help content or don't support parsing them as specific datatypes. In sywac, positional arguments are first-class citizens, allowing you to build intuitive CLIs with or without commands.

For more info on positional argument support, see [Positionals](/docs/positional-type.html).

## Flexible auto-generated help content

Sywac always attempts to Do The Right Thing™, and makes doing the right thing easy. So when it comes to help text for your CLI, you provide the "flags" and descriptions of your commands/arguments/options and sywac does the rest - building a clean, informative, and consistent help text body by default.

However, there are times when the default generated content just doesn't cut it. For those times, sywac allows you to customize each part of the generated content or even override the whole thing with your own help buffer object or class.

For details on the auto-generated help text and how to customize it, see [Help Text](/docs/help-text.html).

## Support for ANSI styles/colors

Speaking of help text, have you ever wanted to make your CLI stand out and look professional using colors and styles in your help content? Other CLI libraries either don't allow you to use ANSI styles for certain parts of the help text (e.g. in option flags) or require you to statically write the whole help text yourself to support colors.

Sywac was built with styling in mind and strives to support ANSI escape codes in every part of the generated help text. And the best part is you can keep your styling logic separate from your type definitions using _style hooks_ for a clear separation of concerns.

For more info on style hooks, see [Style Hooks](/docs/style-hooks.html) or keep reading below.

## Define styles/colors inline or decorate content with style hooks

When it comes to supporting ANSI styles and colors, sywac allows you to define your command/argument/option "flags" and descriptions with ANSI escape codes inline:

```js
const chalk = require('chalk')
require('sywac')
  .string(chalk`{green -s}, {green --str} {yellow <string>}`, {
    desc: chalk.white('A string option'),
    hints: chalk.dim('[string]')
  })
  .help().showHelpByDefault()
  .parseAndExit().then(argv => console.log(`Your string is: ${argv.str}`))
```

Or, for more control and a clearer separation of concerns, add styles and colors using _style hooks_:

```js
const chalk = require('chalk')
require('sywac')
  .string('-s, --str <string>', { desc: 'A string option' })
  .help().showHelpByDefault()
  .style({
    flags: s => chalk.green(s),
    desc: s => chalk.white(s),
    hints: s => chalk.dim(s)
  })
  .parseAndExit().then(argv => console.log(`Your string is: ${argv.str}`))
```

Sywac even allows you to dynamically change the help text style/color for arguments/options that are invalid when validation fails. This is standard practice in web apps with HTML forms, why not apply this practice to our CLIs too?

For more details on this feature, see [Style Hooks](/docs/style-hooks.html).

## Coherent API

In the sywac API, the way you define/configure one argument/option works the same for all arguments/options, regardless of the type or method, and property names are reused so they are common across multiple API methods. This applies to basic option types like [boolean](/docs/boolean-type.html)/[string](/docs/string-type.html), specialty option types likes [help/version](/docs/help-version-type.html), and advanced types like [command](/docs/command-type.html). And you only need to specify each thing once - no more repeating keys or aliases across multiple methods to configure one type.

For details on common type properties, see [Common Type Properties](/docs/type-properties.html).

## Parse strings as easily as `process.argv`

From inception, sywac was designed to support parsing strings (like chatbot messages) as well as arrays (like `process.argv`), and its API doesn't co-mingle configuration state with parsing/execution/result state. Each message or set of arguments that need to be parsed are treated as a separate, individual request, much like an HTTP framework. This also makes testing with sywac a breeze.

See [Asynchronous Parsing, Validation, Execution](/docs/async-parsing.html) for details on parsing and [Context](/docs/context.html) for details on state. Or keep reading to learn why sywac works just as well for server-side apps as for CLI apps.

## Supports concurrent parsing, safe for chatbots or other server-side apps

Although sywac was primarily built for making robust CLIs (even the name "sywac" is an acronym for "so you want a CLI"), a lot of effort in sywac's implementation went towards support for parsing different messages/arguments _at the same time_, using the same configuration.

This is why [synchronous configuration](/docs/sync-config.html) state is encapsulated within "long-lived" type instances but [asynchronous parsing](/docs/async-parsing.html) state is encapsulated within a "short-lived" [context](/docs/context.html) instance, much like an HTTP request. Also, for command-driven parsing, the [asynchronous run handler](/docs/command-run.html) of a command is meant to be functional, such that any execution state it needs is passed as a function argument, much like a controller in an MVC framework.

These details, combined with its asynchronous parsing engine, make sywac a great solution for server-side apps that need message parsing, like a chatbot, supporting concurrent parsing/message-handling in a highly performant system.
