# tinymu*-style bundles for [ranviermud](https://github.com/shawncplus/ranviermud)

## [tinymu-input-events](tinymu-input-events/)

Derived from [ranvier-input-events](http://ranviermud.com/extending/bundles/).
Provides login flow and command interpreter.
Includes at connect screen:

 - `connect <player> <password>`
 - `create <player> <password> <email>`
 - `who`
 - `help`
 - `news`
 - `quit`

Command handler includes:

 - support punctuation-leading commands (`:grins`, `;'s eyes glaze over`, `"hello`)

 - misc formatting:

   - `Huh?  (Type "help" for help.)` rather than `Huh?`


## tinymu-commands

Derived from [ranvier-commands](http://ranviermud.com/extending/bundles/).
To provide basic tinymu-style commands.
Currently includes:

 - `pose`, `:`, `;`

	```
 	:grins
	Joe grins.

	;'s eyes glaze over
	Joe's eyes glaze over.

	:
	Joe
	```

 - misc formatting:

   - `Joe grins.` rather than `You emote "Joe grins."`
   - `Joe` rather than `Yes, but what do you want to emote?`


## tinymu-channels

Derived from [ranvier-channels](http://ranviermud.com/extending/bundles/).

Currently includes:

 - `'`, `"`

	```
	"hello
	You say "hello"
	```

 - misc formatting:

   - `You say "Foo"` rather than `You say: 'Foo'`
   - `Joe says "Foo"` rather than `Joe says: 'Foo'`


## tinymu-lib

Provides common functions used by other tinymu-* bundles.  Not loaded in `ranvier.json`; referenced by other tiny-mu bundles.
