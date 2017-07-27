---
title: Comparison Matrix
prev: /about
next: /about/roadmap.html
---
# Comparison Matrix

| __Feature__ | __sywac__@1.0.0 | __yargs__@8.0.2 | __commander__@2.11.0 |
| ------- | ----------- | ----------- | --------------- |
| Parsing | Async       | Sync        | Sync            |
| Custom parsing | ✅ | ❌ | ❌ |
| Validation | Async | Sync | Sync |
| Custom validation | ✅ | ✅ | ❌ |
| Command execution | Async, awaits completion | Sync, fire-and-forget | Sync, fire-and-forget |
| Commands inline | ✅ | ✅ | ✅ |
| Commands via file/module | ✅ | ✅ | ✅ |
| Commands via directory | [On roadmap](/about/roadmap.html) | ✅ | ❌ |
| Arbitrary levels of nested commands | ✅ | ✅ | ❌ |
| Default command | ✅ | ✅ | ✅ |
| Command aliases | ✅ | ✅ | ✅ |
| Commands with positional arguments | ✅ | ✅ | ✅ |
| Positional arguments without a command | ✅ | ❌ | ✅ |
| Positional argument aliases | ✅ | ✅ | ❌ |
| Positional arguments with optional flags | ✅ | ❌ | ❌ |
| Define types for positional arguments | ✅ | ❌ | ❌ |
| Variadic positional arguments | Anywhere | Last positional only | Last positional only |
| Descriptions for positional arguments in help text | ✅ | ❌ | ❌ |
| Auto-generated help text | ✅ | ✅ | ✅ |
| Override auto-generated help text | ✅ | ❌ | ❌ |
| Customize auto-generated help text piece-meal | ✅ | ❌ | ❌ |
| Style help text differently for errors | ✅ | ❌ | ❌ |
| Placeholders for flagged options in help text | ✅ | ❌ | ✅ |
| Built-in support for i18n | ❌ | ✅ | ❌ |
| Built-in support for showing help text by default (i.e. no args) | ✅ | Only via validation | ❌ |
| Custom grouping of options in help text | ✅ | ✅ | ❌ |
| Custom grouping of commands in help text | ✅ | ❌ | ❌ |
| Custom coercion of argument/option values | ✅ | ✅ | ✅ |
| Validate user input before applying coercion | ✅ | ❌ | ❌ |
| Array options | ✅ | ✅ | Only via custom coercion |
| Define subtype for array option | ✅ | ❌ | ❌ |
| Array parsing supports comma (or other delimiter) separated values | ✅ | ❌ | ❌ |
| Number options | ✅ | ✅ | Only via custom coercion |
| Path/file/directory options | ✅ | ❌ | ❌ |
| Count options | Only via [custom type](/docs/custom-types.html) | ✅ | Only via custom coercion |
| Enum/choices options | ✅ | ✅ | Via `RegExp` or custom coercion |
| Config file options | Only via [custom type](/docs/custom-types.html) | ✅ | Only via custom coercion |
| Customize special `--help` option | ✅ | ✅ | ❌ |
| Customize special `--version` option | ✅ | ✅ | ❌ |
| Auto package version lookup | ✅ | ✅ | ❌ |
| Ability to plug in customized components | ✅ | ❌ | ❌ |
| Support for ignorables in positional argument DSL | ✅ | ❌ | ❌ |
| Parsing result provides details of where argument/option value came from | ✅ | ❌ | ❌ |
| Implies/conflicts option validation | Only via [custom check](/docs/sync-config.html#check) | ✅ | ❌ |
| Converts multi-word aliases to camelCase | ❌ | ✅ | ✅ |
| Parses environment variables | [On roadmap](/about/roadmap.html) | ✅ | ❌ |
| Lookup program config in package.json | ❌ | ✅ | ❌ |
| Parsing supports dot-notation for object properties | ❌ | ✅ | ❌ |
| Parsing supports `--no-` prefix for boolean negation | [On roadmap](/about/roadmap.html) | ✅ | ✅ |
| Ability to recommend commands on no command match | ❌ | ✅ | ❌ |
| Support for generating bash completion script | ❌ | ✅ | ❌ |
| Parsing of undeclared options | ✅ | ✅ | ❌ |
| Parses `process.argv` by default | ✅ | ✅ | ❌ |
| Parsing accepts strings | ✅ | ✅ | ❌ |
| Populates parsing result with all aliases | ✅ | ✅ | ❌ |
| Number of packages installed during `npm install` | 1 | 69 | 1 |
| Compatible with Node.js versions | 4+ | 4+ | All |
