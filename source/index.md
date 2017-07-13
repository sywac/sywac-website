---
next: /docs
---
# So you want a CLI... ☺

__Sywac__ is a small framework for building fast and beautiful command line apps in Node.js.

The central tenets of sywac are:

1. Asynchronous _parsing_ and _validation_ of arguments
2. Asynchronous _execution_ of app logic
3. A _pluggable_, _type-based_ engine
4. A _simple_, _coherent_ API

## But aren't there other libraries that do this already?

While there are a handful of good argument parsers out there, like [yargs](http://yargs.js.org/) and [commander](http://tj.github.io/commander.js/), none of them support __asynchronous__ parsing and execution, and none of them have the level of flexibility and customization that sywac has.

The [author](https://github.com/nexdrew) of sywac is actually a maintainer of yargs, and, after realizing [some](https://github.com/yargs/yargs/issues/541#issuecomment-256682437) [of](https://github.com/yargs/yargs/issues/756) [the](https://github.com/yargs/yargs/issues/564) [major](https://github.com/yargs/yargs/issues/510) [limitations](https://github.com/yargs/yargs/issues/859) inherent in the yargs architecture, he opted for a full rewrite, attempting to fix API problems and solve a lot of known issues along the way. Painful? Yes. But also well worth it.

For a detailed comparison of features, see the [Comparison Matrix](/about/comparison-matrix.html).

## Why is asynchronous parsing so important?

There are several reasons, but the main ones are:

- Support for asynchronous input

    Input for your CLI can come from several places, and some input sources are asynchronous by nature, like reading from stdin, prompting a user for inputs, or reading configuration files from the file system.

    While `sywac@1.0.0` does not yet support all of these input sources, its asynchronous framework has the ability to do so.

- Support for asynchronous validation

    Sometimes validation of inputs relies on external resources, like the file system, a database, or an HTTP endpoint, which just works better if it can be done asynchronously.

    With sywac, you can do this without muddying up your app logic _after_ parsing and validation has occurred.

- Better app control flow

    If your CLI app relies on execution of commands, how do you know if a command was run once the CLI library returns the parsed results? Do you have to keep track of custom variables or context between modules? How do you know if the command completed successfully, particularly if it's asynchronous? What if you need to wait for it to complete before handling the results?

    With sywac, you don't have to worry about this. It does the right thing and waits for your command to resolve before reporting back the results of execution.

- Support for `async`/`await`

    [As of Node.js 7.10.0](http://node.green/#ES2017-features-async-functions-await), `async`/`await` is natively available to your app logic.

    Does your CLI library support it?

- This is Node.js

    Node.js is really, really good at asynchronous tasks and managing concurrency, and apps written to leverage this capability are highly performant.

    Why should our CLIs be any different?

The wonderful thing about using an asynchronous framework is that the "cost" of writing non-blocking code has been paid for you. Even if your app logic doesn't need to be asynchronous, it still fits with sywac since the framework wraps any `return` in a `Promise`, and you don't sacrifice anything.

## What do you mean by flexibility and customization?

Have you ever encountered a small problem with your CLI library, one that you could easily fix if it only allowed you to plug in your own bit of code? Sywac allows you to do this.

Maybe you like your CLI library but there are parts of it you just can't customize or override. In sywac, almost every component built into the framework can be swapped out.

How about styling or customizing the help text without having to write the whole thing yourself? Sywac gives you the hooks to do this too.

## What do you mean by a type-based engine?

When it comes to parsing CLI arguments (or a command string for a chatbot), the ability to correctly interpret each argument is highly dependent on the _type_ of value the argument represents. Here's an example:

```bash
$ program push -f artifact.tgz
```

Is `push` a command or a positional argument? Is `artifact.tgz` supposed to be the value of `-f`? If it does, is the value supposed to represent a file that does or does not exist? What if `-f` represents a boolean and `artifact.tgz` is a positional argument?

The only way to correctly interpret the arguments is based on the expected _types_ defined in `program`.

Now most command line parsers support type definitions, typically by configuring a parser and letting the synchronous parser do the work.

But in sywac, each expected argument is represented by an instance of a special Type class, and parsing is delegated to these type instances in an asynchronous, highly concurrent fashion. Now, instead of a single parser having all the power, each type instance is allowed to parse its own arguments, making a system where its easy to plug in your own types and change how arguments are parsed and interpreted.

## Enough chit-chat, show me the code!

Agreed. Let's move on to the docs, starting with a quick start guide. Click the Next button below.
