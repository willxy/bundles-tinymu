'use strict';

// const util = require('util');

/**
 * Main command loop. All player input after login goes through here.
 * If you want to swap out the command parser this is the place to do it.
 */
module.exports = (srcPath) => {
  // const bundlePath = srcPath + "../bundles";
  const { CommandParser, InvalidCommandError, RestrictedCommandError } = require(srcPath + 'CommandParser');
  const PlayerRoles = require(srcPath + 'PlayerRoles');
  const CommandTypes = require(srcPath + 'CommandType');
  const Broadcast = require(srcPath + 'Broadcast');
  const Logger = require(srcPath + 'Logger');
  const bundle = require('../../tinymu-lib/lib/common').bundle(__filename);
  const deferModule = require('../../tinymu-lib/lib/common').deferModule(__filename);

  return {
    event: state => player => {
      if(deferModule) {
        Logger.verbose(`${bundle.name}: ${bundle.module}: deferring`);
        return(false);
      }
      Logger.verbose(`${bundle.name}: ${bundle.module}`);
      // Logger.verbose(`${bundle.module}: state args: ${util.inspect(args)}`);

      player.socket.once('data', data => {
        function loop() {
          player.socket.emit('commands', player);
        }
        data = data.toString().trim();

        if (!data.length) {
          return loop();
        }

        player._lastCommandTime = Date.now();

        Logger.verbose(`Got '${data}'`);

        const punct = '`~!@#$%^&*()-_=+[]{}\\|;:\'",.<>/?';
        // IF the first char is a punctuation char
        // AND that char is a command
        // THEN split first word into char and restofword
        //if(punct.includes(data[0]) && state.CommandManager.get(data[0])) {
        if(punct.includes(data[0]) && CommandParser.parse(state, data[0], player)) {
          data = data.split(data[0], 2).join(data[0] + ' ');
          Logger.verbose(`Has punct: '${data}'`);
        }

        try {
          const result = CommandParser.parse(state, data, player);
          if (!result) {
            throw null;
          }
          switch (result.type) {
            case CommandTypes.COMMAND: {
              const { requiredRole = PlayerRoles.PLAYER } = result.command;
              if (requiredRole > player.role) {
                throw new RestrictedCommandError();
              }
              // commands have no lag and are not queued, just immediately execute them
              result.command.execute(result.args, player, result.originalCommand);
              break;
            }
            case CommandTypes.CHANNEL: {
              if (result.channel.minRequiredRole !== null && result.channel.minRequiredRole > player.role) {
                throw new RestrictedCommandError();
              }
              // same with channels
              result.channel.send(state, player, result.args);
              break;
            }
            case CommandTypes.SKILL: {
              // See bundles/ranvier-player-events/player-events.js commandQueued and updateTick for when these
              // actually get executed
              player.queueCommand({
                execute: () => {
                  player.emit('useAbility', result.skill, result.args);
                },
                label: data,
              }, result.skill.lag || state.Config.get('skillLag') || 1000);
              break;
            }
          }
        } catch (error) {
          switch(true) {
            case error instanceof InvalidCommandError:
              // check to see if room has a matching context-specific command
              const roomCommands = player.room.getBehavior('commands');
              const [commandName, ...args] = data.split(' ');
              if (roomCommands && roomCommands.includes(commandName)) {
                player.room.emit('command', player, commandName, args.join(' '));
              } else {
                Broadcast.sayAt(player, 'Huh?  (Type "help" for help.)');
                Logger.warn(`WARNING: Player tried non-existent command '${data}'`);
              }
              break;
            case error instanceof RestrictedCommandError:
              Broadcast.sayAt(player, "You can't do that.");
              break;
            default:
              Logger.error(error);
          }
        }

        Broadcast.prompt(player);
        loop();
      });
    },
  };
};
