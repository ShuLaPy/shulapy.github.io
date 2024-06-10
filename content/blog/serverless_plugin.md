---
title: "Creating a Plugin for Serverless Framework"
date: 2024-06-10T09:40:55+05:30
draft: false
images:
- https://res.cloudinary.com/dju7jxioz/image/upload/v1717994685/serverless_plugin_b00tgu.webp
---

![plugin](https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExaHpzdDRranNzdXRxOGw1dWJtb3ZxbXVrcndiaXc5Nzk3NjBweDh2MyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/QvGCMeHuP1vLYl2hLb/giphy-downsized.gif)

While working on a project in my company, I found the need to customize an open-source serverless plugin called `serverless-appsync-plugin` to meet our requirements. As I delved into the plugin, my interest grew, and I began to explore its intricacies. Through this process, I gained a deeper understanding of what it takes to build a serverless plugin. In this post, I'll share some fundamental concepts to help you get started with plugin development.

# Introduction

The Serverless Framework is a powerful tool that enables developers to build and deploy serverless applications with ease. While the framework offers a robust set of features out of the box, its true potential is unlocked through the use of plugins. Plugins allow developers to extend and customize the functionality of the Serverless Framework to suit their specific needs. In this blog, I'll walk you through the process of creating your own plugin for the Serverless Framework.

# Understanding Serverless Framework

The Serverless Framework is an open-source tool that simplifies the deployment of serverless applications across various cloud providers. It abstracts the complexities of serverless architecture, allowing developers to focus on writing code rather than managing infrastructure.

Using the Serverless Framework can significantly reduce the operational overhead and speed up the development process for serverless applications.

# What Are Plugins in Serverless Framework?

Plugins in the Serverless Framework are add-ons that enhance the framework’s capabilities. They can modify the behavior of the framework, add new commands, or integrate with other tools and services. Popular plugins include those for monitoring, security, and deployment automation. By creating custom plugins, developers can tailor the framework to meet the unique requirements of their projects.

# Let's create a plugin

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

Every serverless plugin is a class. This class is instantiated with a serverless object and a set of options.

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

Don't worry about the `hooks` and `commands` for now. We'll look into them later, as they are the most crucial part of the plugin system.

#### Step 3: Adding Functionality to the Plugin

Extend the plugin by hooking into Serverless Framework lifecycle events and adding custom commands:

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

Now in another directory create a test Serverless project, install, and configure your plugin:

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

Now check if the plugin is configured correctly. To check it just run the below command and you will see `mycommand` in the list.

```bash
serverless --help
```

Run your custom command to test:

```bash
serverless mycommand
```

# Commands

Commands in the Serverless Framework plugins provide custom functionality that can be executed through the Serverless CLI. By defining commands, you can extend the Serverless Framework with new capabilities tailored to your specific needs.

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

Commands can also accept options, which allow users to pass parameters when executing the command. Options are defined within the command object.

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

Plugins can be provider specific, which means that run only with a specific provider.

Note: Binding a plugin to a provider is optional. Serverless will always consider your plugin if you don't specify a provider.

To bind to a specific provider, retrieve it and set the this.provider property in the plugin constructor:

```javascript
class MyServerlessPlugin {
  constructor(serverless, options) {
    // bind to a specific provider
    this.provider = serverless.getProvider("providerX");

    // ...
  }
}
```

# Let's build something

Now that you've got the basics down, let's create something practical. We'll enhance the serverless capabilities by adding a `get-stack` command. This command will allow us to retrieve information about a stack using the AWS describeStacks command.

To start, we'll create a class and include a provider for AWS. Then, we'll add a custom command with a lifecycle event.

The `serverless` parameter grants access to all the methods provided by Serverless. You can learn more about its capabilities in the official documentation.

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

Now that we have a provider set up, we're equipped to execute various AWS commands using this provider. This means we can now run all the commands associated with AWS seamlessly.

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

