---
title: Context
prev: /docs/concurrency.html
next: /docs/advanced-customizations.html
---
# Context

The context is a short-lived object that tracks state during asynchronous parsing, validation, and execution. It is created when the user initiates a [parse](/docs/async-parsing.html#parse) or [parseAndExit](/docs/async-parsing.html#parseAndExit) request, and is discarded when the request finishes.

The user usually interacts with the context by defining callbacks:

- The [check](/docs/sync-config.html#check) handler receives the context as a parameter.
- A [command](/docs/sync-config.html#command)'s run handler receives the context as a parameter.

<a name="cliMessage"></a>
## `.cliMessage(msg)`

<sup>Since 1.0.0</sup

Add a message to the parsing context. Once parsing finishes, these messages will be added to the help output as error messages (along with any other error messages automatically generated during parsing).

Example:

```js
sywac.check((argv, context) => {
  context.cliMessage('Oops, you forgot to enter your name.')
})
```

<a name="state"></a>
## `.state`

<sup>Since FUTURE</sup>

A user-defined state object. This object exists only if passed as a second argument to [parse](/docs/async-parsing.html#parse).

Example:

```js
sywac.command('login', {
  run: (argv, context) => {
    console.log(`Thank you for logging in, ${context.state.user.name}!`)
  }
})

sywac.parse('login', { user: { name: 'jan.jansen' } })
```
