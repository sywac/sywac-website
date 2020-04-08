---
title: Roadmap
prev: /about/comparison-matrix.html
---
# Roadmap

## 1.2.0

- <input type="checkbox" disabled="disabled" checked/> Add `.commandDirectory(dir)` method to `Api` to automatically add all modules in the directory as commands

## 1.3.0

- <input type="checkbox" disabled="disabled" checked/> Add `.strict()` mode to fail-fast on unrecognized flags or arguments, useful for detecting typos in command line input and alerting users

## 2.0.0

- <input type="checkbox" disabled="disabled" checked/> Refactor codebase to async/await, which requires Node 8+

- <input type="checkbox" disabled="disabled"/> Change `.parseAndExit()` to output to stderr unless help or version is explicitly requested

- <input type="checkbox" disabled="disabled"/> Fix contextual help content shown when a command uses `context.cliMessage()`

- <input type="checkbox" disabled="disabled"/> Support additional arbitrary data as 2nd argument to `.parse()`, to provide commands with runtime info beyond what is parsed from a given message/request, useful for chatbots and server-side apps

## 2.1.0

- <input type="checkbox" disabled="disabled"/> Add ability to read arguments from stdin, triggered via custom flag or lack of arguments

## 2.2.0

- <input type="checkbox" disabled="disabled"/> Add ability to parse environment variables as arguments/options, either via program prefix or customized per type
- <input type="checkbox" disabled="disabled"/> Add `--no-` negation support to `TypeBoolean`

## 3.0.0

- <input type="checkbox" disabled="disabled"/> Add an interactive mode, with the ability to prompt user for arguments/options
