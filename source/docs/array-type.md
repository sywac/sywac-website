---
title: Array
prev: /docs/enum-type.html
next: /docs/unknown-type.html
---
# Array

The `Array` type represents a list of values. The values in an array can be of any other type supported by Sywac.

## Properties

In addition to [common type properties](/docs/type-properties.html), arrays also support:

  - &nbsp;`delimiter` or `delim`: string or RegExp, default `','`

    A delimiter used to split a single value into multiple values during parsing.

    For example, parsing `-a one,two` would add values `'one'` and `'two'` to the array instead of `'one,two'`.

  - &nbsp;`cumulative`: boolean, default `true`

    If a flag is given multiple times, should the array value include all values from all flags (default) or only use the value(s) from the last flag given?

    For example, parsing `-a one two -a three four` in cumulative mode would result in an array value of `['one', 'two', 'three', 'four']`. If you turn this off, the result would be only `['three', 'four']`.

## Examples

Use the [.array](/docs/sync-config.html#array) method to add a flagged option for an array of strings.

```js
sywac
  .array('--people', { desc: 'specify a list of people' })
  .parseAndExit().then(argv => {
    console.log(`Welcome ${argv.people.join(', ')}!`)
  })
```
```console
$ my-app --people Anna George Stefan
Welcome Anna, George, Stefan!
```
<br>

The default value for an `Array` is `[]`.

```console
$ my-app
Welcome !
```
<br>

The [.stringArray](/docs/sync-config.html#stringArray) method is a more explicit alias for `.array`.

```js
sywac
  .stringArray('--people', { desc: 'specify a list of people' })
```
<br>

Use the [.numberArray](/docs/sync-config.html#numberArray) method to add a flagged option for an array of numbers.

```js
sywac
  .numberArray('--max <numbers...>', { desc: 'specify a list of numbers' })
  .parseAndExit().then(argv => {
    console.log(Math.max(argv.max))
  })
```
```console
$ my-app 5 19 2
19
```
<br>

To define an array of any other type, use the [.option](/docs/sync-config.html#option) method and specifying the array type. The properties of your array can include properties supported by the array type. (For example, if you specify a type of `array:file`, you can also add properties related to the `File` type.)

```js
sywac
  .option('--f <files...>', { type: 'array:file', mustExist: true })
  .parseAndExit()
```
```console
$ my-app -f file1 file2
Usage: my-app [options]

Options:
  --f <files...>                                                           [array:file] [must exist]

The file does not exist: file1
The file does not exist: file2
```
<br>

Use the [.positional](/docs/sync-config.html#positional) method to define a positional argument array.

```js
sywac
  .positional('<names...>')
  .parseAndExit().then(argv => {
    console.log(`Welcome ${argv.names.join(', ')}!`)
  })
```
```console
$ my-app April Steve Jo
Welcome April, Steve, Jo!
```
<br>

When parsing positional arguments, an array type will do its best to leave enough arguments to satisfy other defined arguments. If the arguments are ambiguous (such as multiple arrays in a row), your users should use a value with delimiters instead of spaces.

```js
sywac
  .positional('<names...> <foods...>')
  .parseAndExit().then(argv => {
    console.log(`Welcome ${argv.names.join(', ')}!`)
    console.log(`I like to eat ${argv.foods.join(', ')}!`)
  })
```
```console
$ my-app April,Steve fruits,veggies
Welcome April, Steve!
I like to eat fruits, veggies!

$ my-app April Steve fruits veggies
Welcome April, Steve, fruits!
I like to eat veggies!
```
