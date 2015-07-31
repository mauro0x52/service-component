Service Component for Node.js
=============================

A simple Service Component Architecture (SCA) framework for Node.JS

What is SCA?
------------

SCA is a modeling specification for composing systems according to the principles of Service Oriented Architecture (SOA). SCA separates the implementation concerns into three artifacts: 

- Components: implement its business function
- Composites: assemble various components together to create business solutions
- Services: create an interface for remote access to component and composite functions

Composites, services, and their relations with components are defined in a dynamic descriptor file, so every component can be implemented regardless how it will communicate with other components.

What is this framework about?
-----------------------------

It is a simple way to build SCA systems using RESTful webservices with JSON communication.

In the examples folder, you can find the HelloWorld service-component app, which the directory tree is something like:

```
HelloWorld/
├── components/
│   ├── Writer.js
│   └── Translator.js
├── composite.json
└── HelloWorld.js
```

HelloWorld.js is the main interface to the real world. It builds the composite described in composite.json.
Translator.js translate "hello" to different languages.
Writer.js gets writes "{hello} {name}!", using the "hello" translated from the translator.

The composite.json file can be summarized like this:

```
{
    "name" : "HelloWorld",
    "services" : {
        "hello" : {
            "path"       : "/hello/:language/:name",
            "bind"      : {
                "component" : "Writer",
                "service"   : "write"
            }
        }
    },
    "components" : {
        "Writer" : {
            "services" : {
                "write" : {
                    "path"    : "/write/:language/:name"
                }
            },
            "bind" : {
                "translate" : {
                    "component" : "Translator",
                    "service"   : "translate"
                }
            }
        },
        "Translator" : {
            "services" : {
                "translate" : {
                    "path"    : "/translate/:language"
                }
            }
        }
    }
}

```
