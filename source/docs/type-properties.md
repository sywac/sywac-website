---
title: Common Type Properties
prev: /docs/type-lifecycle.html
next: /docs/boolean-type.html
---
# Common Type Properties

<a name="desc">
## desc / description

The `desc` (or `description`) property controls the text displayed immediately the right
of the option or argument in the generated help text.

If not specified, the description will be blank.

```js
sywac.boolean('--confirm', {
  desc: 'skip confirmation prompt'
});
```
```bash
Options:
  --confirm  skip confirmation prompt                                  [boolean]
```

See also the [hints](#hints) property.

<a name="group">
## group

The `group` option allows you to organize options into multiple sections in the generated
help text. By default, all options are in the section titled `Options:`.

> Tip:
>
> The text you specify will be used verbatim, so be sure to include the ending colon (`:`)
> within your label if you want the colon in your section header.

```js
sywac.number('-p, --port <port>', {
  desc: 'port to listen on',
  group: 'Server Options:'
});
```
```bash
Server Options:
  -p, --port <port>  port to listen on                                  [number]
```

<a name="hidden">
## hidden

The `hidden` option allows you to specify that an option or argument should not be included
in the generated help text.

You can use this to hide a rarely-used or deprecated option, while still taking advantage
of sywac's parsing.

```js
sywac.boolean('--fancy', {
  hidden: true
});
```

You can also use it to slurp up extra positional arguments, without being displayed in the
arguments section.

```js
sywac.positional('[users...]', {
  hidden: true
});
```

<a name="hints">
## hints

The `hints` property controls the type information displayed to the far right of the
option or argument in the generated help text.

By default, a hint will be generated based on the type of the option and whether it is
marked as required - `[boolean]` or `<string>`, for example.

You can use this to display an optional option as if it was required, or to make the
hint more specific.

```js
sywac.string('--name <name>', {
  hints: '[required] [string]'
});
sywac.array('--users', {
  hints: '[list of users]'
});
```
```bash
Options:
  --name <name>                                              [required] [string]
  --users                                                        [list of users]
```

You can also use this property to suppress an unwanted auto-generated hint.

```js
sywac.command({
  aliases: 'update <student-id>',
  desc: 'update a student record',
  hints: ''                       // suppress usual aliases hint
});
```
```bash
Commands:
  update <student-id>   update a student record
```

See also the [desc](#desc) property.
