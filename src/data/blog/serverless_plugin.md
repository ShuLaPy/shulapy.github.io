---
author: Shubham Lad
pubDatetime: 2024-06-10T09:40:55Z
modDatetime: 2024-06-10T09:40:55Z
title: Build a Serverless Plugin
slug: build-a-serverless-plugin
featured: false
draft: false
description: A concise introduction to extending the Serverless Framework with custom plugins, focusing on the core concepts behind hooks, commands, and lifecycle events.
---


![plugin](https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExaHpzdDRranNzdXRxOGw1dWJtb3ZxbXVrcndiaXc5Nzk3NjBweDh2MyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/QvGCMeHuP1vLYl2hLb/giphy-downsized.gif)

Working on a project in my company brought forward the need to customize this open-source serverless plugin, `serverless-appsync-plugin` further, to match our requirements. The deeper I went through the plugin, the more interested I became to discover more intricacies associated with it. In the process, I learned a few things that go into writing a serverless plugin. In this article, I will share some basic ideas to help you get started with developing your plugin.

## Introduction

The Serverless Framework is a pretty solid tool because it helps the user build and deploy serverless applications. While the framework is packed with numerous powerful features, the real power is unleashed when using plugins. Plugins allow developers to extend and customize the functionality of the Serverless Framework to meet their specific requirements. This blog will lead you through the process of creating your first plugin for the Serverless Framework.

## Understanding Serverless Framework

The Serverless Framework is an open-source application framework that simplifies the deployment of serverless applications across various cloud providers. It abstracts away the pains of managing serverless architecture. Therefore developers can fully focus on writing code rather than managing infrastructure

The Serverless Framework significantly reduces the operational overhead and speeds up the process of serverless application development.

## What Are Plugins in Serverless Framework?

Serverless Framework plugins are just tools to extend the capability of the framework. They can bring changes to the behavior of the framework, add new commands, or integrate with other tools and services Some of the most used plugins are monitoring security, and deployment automation. Developers can create custom plugins to make the framework best suited to their project requirements.

## Let's create a plugin

#### Step 1: Setting up the Project

First, initialize a new Node.js project:

```bash
mkdir my-serverless-plugin
cd my-serverless-plugin
npm init -y
```

Next, set up the project structure:

```bash
my-serverless-plugin/
├── src/
│   └── index.js
├── test/
│   └── index.test.js
├── package.json // make sure you mention the `main` file
└── README.md
```

Note: we are not covering the test part

#### Step 2: Creating the Plugin Class

Every serverless plugin is a class that is instantiated with two arguments: the serverless object and a set of options.

In src/index.js, define the plugin class:

```javascript
class MyServerlessPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;
    this.hooks = {
      "before:deploy:deploy": this.beforeDeploy.bind(this),
    };
  }

  beforeDeploy() {
    this.serverless.cli.log("Executing before deploy hook!");
  }
}

module.exports = MyServerlessPlugin;
```

Don't worry about the `hooks` and `commands` here yet; we'll get to them after we've done the most important part of setting up the plugin system.

#### Step 3: Adding Functionality to the Plugin

Extend your plugin by hooking in lifecycle events of Serverless Framework, adding your custom commands:

```javascript
class MyServerlessPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;
    this.commands = {
      mycommand: {
        usage: "Describe your custom command here",
        lifecycleEvents: ["run"],
      },
    };
    this.hooks = {
      "before:deploy:deploy": this.beforeDeploy.bind(this),
      "mycommand:run": this.runMyCommand.bind(this),
    };
  }

  beforeDeploy() {
    this.serverless.cli.log("Executing before deploy hook!");
  }

  runMyCommand() {
    this.serverless.cli.log("Running my custom command!");
  }
}

module.exports = MyServerlessPlugin;
```

You can see these commands when you run `serverless --help`.

#### Step 4: Testing the Plugin

Now create a test serverless project in another directory, also install and configure your plugin:

```bash
$ serverless
$ cd my-serverless-project
```

```bash
npm install /path/to/my-serverless-plugin
```

In your serverless.yml:

```yaml
plugins:
  - my-serverless-plugin
```

Now, test if the plugin is configured correctly. To test, run the command given below, and you should see `mycommand` in the list.


```bash
serverless --help
```

Run your custom command to test:

```bash
serverless mycommand
```

## Commands

Serverless Framework plugins can define commands, adding custom functionality later to be executed via the Serverless CLI. By defining commands, you can extend the Serverless Framework with new capabilities tailored to your specific use case.

#### Defining Commands

To define a command in your plugin, you need to specify it in the commands object within your plugin class. Each command consists of a name, usage description, and a list of lifecycle events that the command will trigger.

```javascript
class MyServerlessPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;

    // Define custom commands
    this.commands = {
      mycommand: {
        usage: "Describe what your custom command does",
        lifecycleEvents: ["run"],
      },
    };

    this.hooks = {
      "mycommand:run": this.runMyCommand.bind(this),
    };
  }

  runMyCommand() {
    this.serverless.cli.log("Running my custom command!");
  }
}

module.exports = MyServerlessPlugin;
```

#### Command Options and Lifecycle events

Commands can also accept options. Options allow you to pass parameters at the time of executing a particular command. Options are defined within the command object.

```javascript
this.commands = {
  mycommand: {
    usage: "Describe what your custom command does",
    lifecycleEvents: ["run"],
    options: {
      name: {
        // this is the option you can pass from command line
        usage: "Specify the name option (e.g., --name John)",
        required: true,
        shortcut: "n",
      },
    },
  },
};
```

When running the command, users can pass options as follows:

```bash
serverless mycommand --name John
```

You can access these options in your command method:

```javascript
runMyCommand() {
  const name = this.options.name;
  this.serverless.cli.log(`Running my custom command with name: ${name}`);
}
```

#### Command Lifecycle Events

Commands can have multiple lifecycle events, each representing a different stage in the command execution process. For instance, a command might have start, process, and end events.

```javascript
this.commands = {
  mycommand: {
    usage: "Describe what your custom command does",
    lifecycleEvents: ["start", "process", "end"],
  },
};

this.hooks = {
  "mycommand:start": this.startCommand.bind(this),
  "mycommand:process": this.processCommand.bind(this),
  "mycommand:end": this.endCommand.bind(this),
};
```

#### Provider-specific plugins

Plugins can be provider specific, that means they run only with a particular provider.

Note: Binding a provider to a plugin is optional. Serverless will always consider your plugin if you don't specify a provider.

To bind with a specified provider, retrieve it, and set the this.provider property in the constructor of the plug-in:

```javascript
class MyServerlessPlugin {
  constructor(serverless, options) {
    // bind to a specific provider
    this.provider = serverless.getProvider("providerX");

    // ...
  }
}
```

## Let's build something

Now that you know the basics, let's do something practical. We'll add more to enhance the serverless capabilities of our tools by adding a `get-stack` command. This way, we can retrieve information about the stack via the AWS describeStacks command.

First, we will create a class and include a provider for AWS. Then, we will add a custom command with a life cycle event. 

The `serverless` parameter grants you access to all the methods provided by Serverless. Refer to the official documentation for other capabilities. 

```javascript
class MyServerlessPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;
    this.provider = this.serverless.getProvider("aws");

    this.commands = {
      "get-stack": {
        lifecycleEvents: ["run"],
        options: {
            name: {
                usage: "Specify the name of stack (e.g., --name dev-stack)",
                required: true,
                shortcut: "n",
            },
        },
      },
    };

    this.hooks = {
      "get-stack:run": this.getStackInfo.bind(this),
    };

    async getStackName() {

        // ...
    
    }
```

Now we have a provider prepared, so we will be able to execute different AWS commands with this provider. That means now all the commands with respect to AWS can be executed without problems.

```javascript
  async getStackName() {
    const name = this.options.name;
    const response = await this.provider.request(
      "CloudFormation",
      "describeStacks",
      { StackName: name }
    );
    this.serverless.cli.log("Response: ", response); // use serverless.log
  }
```

If you run `serverless --help` command now you will see:

```bash
## ...

MyServerlessPlugin
get-stack
```

run this command:

```bash
serverless get-stack --name dev-stack
```

