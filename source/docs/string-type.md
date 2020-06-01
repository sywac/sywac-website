---
title: String
prev: /docs/number-type.html
next: /docs/path-type.html
---
# String

The `String` type represents any user-entered value.

## Properties

`String` options and arguments support any of the [common type properties](/docs/type-properties.html).

## Examples

Use the [.string](/docs/sync-config.html#string) method to add a flagged option.

```js
sywac
  .string('-n, --name <name>', { desc: 'specify your name' })
  .parseAndExit().then(argv => {
    console.log(`Hello, ${argv.name}!`)
  })
```
```console
$ my-app -n Jan
Hello, Jan!
```
<br>

The default value of a `String` is `undefined`.

```console
$ my-app
Hello, undefined!
```
<br>

Use the [.positional](/docs/sync-config.html#positional) method to add a positional argument.

```js
sywac
  .positional('<name:string>')
  .parseAndExit().then(argv => {
    console.log(`Hello, ${argv.name}!`)
  })
```
```console
$ my-app Jan
Hello, Jan!
```
<br>

> Tip:
>
> You don't need to specify `:string`, because it is the default type for arguments.

```js
sywac.positional('<name>')
```
<br>
