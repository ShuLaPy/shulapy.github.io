---
author: Shubham Lad
pubDatetime: 2023-08-01T01:10:53Z
modDatetime: 2023-08-01T01:10:53Z
title: Transpilers and Polifills
slug: transpilers-and-polifills
featured: false
draft: false
description: A beginner-friendly explanation of transpilers and polyfills in JavaScript, covering why they exist, how they work, and how they help developers use modern features while maintaining compatibility across browsers.
---


![transpiler](https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExcnI0cmN6ZnY5YjVlaHU5bXlvZzJybXJtOG0zZWlmMzh6ZzI0cHJjeSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Uu02NeT9btwL0yhgxa/giphy.gif)

While developing web applications you might have come across these words in your JavaScript code.

As JavaScript evolves, new ideas and features are proposed for the language. These proposals are reviewed and if considered good, they are added to the official list of changes [https://tc39.github.io/ecma262/](https://tc39.github.io/ecma262/). Then, they become part of the JavaScript [specification](https://www.ecma-international.org/publications-and-standards/standards/ecma-262/).

Different JavaScript engines (like V8, Spider Monkey, etc.) that power web browsers have their own preferences on what to implement first. Sometimes, they might choose to implement features that are still in the proposal stage and postpone those that are already part of the official specification.

Due to this, not all browsers have the latest JavaScript features available. So, if you want to use the newest features in your code, you might have to wait until they are implemented in the browsers you want to support.

But no worry, there are two methods to work around this problem:
- **Polyfilling**
- **Transpiling**

Let's talk about Transpilers first

# Transpiler
A transpiler is a special kind of translator that takes the source code of a program written in one programming language and converts it into an equivalent source code in either the same language or a different one. It's also known as a "source-to-source compiler."

Suppose you've written a program in Python but wish to convert this to Java, then you would invoke what's called a **transpiler**.

Now don't confuse between transpiler and compiler they are both different.

While compilers translate code from a high-level programming language to a lower-level one (like Go to binary or Java to bytecode), transpilers convert between programming languages that operate at a similar level of abstraction. For example, a transpiler can convert Python code to JavaScript code or JavaScript ES6 to ES5.

One useful application of transpilers is updating legacy code to a newer version of the underlying programming language or an API that may have breaking changes. For instance, converting programs from Python 2 to Python 3.

It's important to note that transpilers can retain the structure of the original code to ease development and debugging or modify it significantly, making the translated code look different from the source code. There are also debugging utilities that map the transcompiled source code back to the original code; for example, the JavaScript Source Map standard allows mapping of the JavaScript code executed by a web browser back to the original source when the JavaScript code was, for example, minified or produced by a transcompiled-to-JavaScript language.

We saw what transpiler actually is now lets see how it works?

## How does a transpiler work?

![image](https://res.cloudinary.com/dju7jxioz/image/upload/v1717996138/transpiler-working-min_pcf9rt.webp)

The transpiler parses the code and identifies tokens, which are the fundamental building blocks of the language. Tokens include language keywords, variables, literals, and operators. This step involves both lexical analysis and syntax analysis, and the transpiler understands the syntax rules of the input language. Based on the tokens and syntax rules, the transpiler constructs an Abstract Syntax Tree (AST). The AST organizes the code in a hierarchical tree with all its metadata.

Let's understand it with Babel

Babel follows these steps in three distinct phases:

- **Parse**: It takes the code and generates an AST.
- **Transform**: The AST is traversed, and nodes are added, updated, or removed as needed.
- **Generate**: The modified AST is converted back into a syntax string, and a source map is created to aid in debugging.

Using this process, Babel can transpile JavaScript code from ES6 to ES5, making modern code compatible with older browsers.

The Abstract Syntax Tree allows for this to take place because it breaks down code and organizes it with all of its metadata in a hierarchical tree.

For example, these two lines of code:

```javascript
var a = 3
a + 5
```

Result in the following Abstract Syntax Tree:

![AST tree](https://res.cloudinary.com/dju7jxioz/image/upload/v1717995041/ast_tree_mhyh1g.png)

There are various transpilers available for different languages, like for JavaScript Babel, TypeScript, and CoffeeScript, VOC for Python to Java, and JSweet for Java to TypeScript or JavaScript. Transpilers are versatile tools that help developers write modern code while ensuring compatibility with different environments.

Now we understood about tranpilers now let's see Polyfills

# Polyfills

In web development, a polyfill is a piece of code, often written in JavaScript, that enables modern functionality to work on older browsers that do not support it naturally.

For example, consider the utility `Math.trunc(n)`. In very outdated JavaScript engines, this function might not exist, leading to errors if the code tries to use it.

To address this, we can create a polyfill for `Math.trunc`. The polyfill checks if the function already exists in the browser (which is often the case in modern browsers) and only adds it if it's missing. Here's an example of how the polyfill works:

```javascript
if (!Math.trunc) { // if no such function
  // implement it
  Math.trunc = function(number) {
    // Math.ceil and Math.floor exist even in ancient JavaScript engines
    // they are covered later in the tutorial
    return number < 0 ? Math.ceil(number) : Math.floor(number);
  };
}
```

By doing this, the code can safely use `Math.trunc` even in older browsers that don't have native support for it.

Polyfills were more common in the past when browsers had significant differences in their implementation of JavaScript APIs. Early versions of libraries like jQuery served as polyfills, providing a consistent API across different browsers. However, nowadays, modern browsers tend to implement a broad set of APIs according to standard semantics, reducing the need for many polyfills.

Despite their usefulness, polyfills have limitations. Some features cannot be easily polyfilled, and they may not perform as efficiently as native implementations of APIs. However, they remain valuable tools for ensuring cross-browser compatibility and allowing developers to use modern functionality without worrying about older browser support.

# References
- [Source to source compiler - wikipedia](https://en.wikipedia.org/wiki/Source-to-source_compiler)
- [Transpiler - Devopedia](https://devopedia.org/transpiler)
- [Polyfill - wikipedia](https://en.wikipedia.org/wiki/Polyfill_(programming))
- [Polyfill - MDN](https://developer.mozilla.org/en-US/docs/Glossary/Polyfill)