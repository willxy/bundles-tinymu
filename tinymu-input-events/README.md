# tinymu-input-events

Derived from [ranvier-input-events](http://ranviermud.com/extending/bundles/).  Provides login flow and command interpreter.  Includes at connect screen:

 - `connect <player> <password>`
 - `create <player> <password> <email>`
 - `who`
 - `help`
    - Displays `data/motd.help` file if present
 - `news`
    - Displays `data/motd.news` file if present
 - `quit`

Misc:

 - formatting:
   - `Your name cannot be blank.` instead of `Please enter a name.`
   - `Your name needs to be less than ${maxLength} characters.` isntead of `Too long, try a shorter name.`
   - `Your name needs to be greater than ${minLength} characters.` instead of `Too short, try a longer name.`

 - logging:
   - `Login: ${player.name} from ${remoteAddress}:${remotePort}`
   - `Disconnect: ${player.name} from ${remoteAddress}:${remotePort}`

 - other:
   - Stores `player.connectTime` for `who`
   - `Either there is already someone with that name, or that name is illegal.`

## Login event flow

                      intro
                        |
                       motd
                        |
       ______________prelogin________________
      /      ||     ||      ||      |        \    
    quit    who    help    news   connect   create 
                                    |          |   
                                    |      character-class
                                    |          |   
                                    |      finish-create
                                     \    /      
                                      done     
                                       |
                                    commands
         (command prompt, all player input after login goes through this event)

## Notes
 - `create` creates both an Account and a Player, both with the same name.

## TODO
 - more in `commands` event
 - formatting of times in `who`
