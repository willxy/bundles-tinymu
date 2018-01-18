'use strict';

const util = require('util');

/**
 * Done event -- Login is done, allow the player to actually execute commands
 */
module.exports = (srcPath) => {
  const Logger = require(srcPath + 'Logger');
  const bundle = require('../../tinymu-lib/lib/common').bundle(__filename);
  const deferModule = require('../../tinymu-lib/lib/common').deferModule(__filename);
  const Broadcast = require(srcPath + 'Broadcast');

  return {
    event: state => (socket, args) => {
      if(deferModule) {
        Logger.verbose(`${bundle.name}: ${bundle.module}: deferring`);
        return(false);
      }
      Logger.verbose(`${bundle.name}: ${bundle.module}`);
      // Logger.verbose(`${bundle.module}: state args: ${util.inspect(args)}`);

      const remoteAddress = socket.socket.socket.remoteAddress;
      const remotePort = socket.socket.socket.remotePort;
      let player = args.player;
      player.hydrate(state);

      // Allow the player class to modify the player (adding attributes, changing default prompt, etc)
      player.playerClass.setupPlayer(player);

      player.save();

      Logger.log(`Login: ${player.name} from ${remoteAddress}:${remotePort}`);

      // for "who" output
      player.connectTime = Date.now();

      player._lastCommandTime = Date.now();

      player.socket.on('close', () => {
        Logger.log(`Disconnect: ${player.name} from ${remoteAddress}:${remotePort}`);
        // TODO: try to fetch the person the player is fighting and dereference the player
        //if (player.inCombat.inCombat) {
        //  player.inCombat.inCombat = null;
        //}
        player.save(() => {
          player.room.removePlayer(player);
          state.PlayerManager.removePlayer(player, true);
        });
      });

      state.CommandManager.get('look').execute(null, player);

      Broadcast.prompt(player);

      // All that shit done, let them play!
      player.socket.emit('commands', player);
    },
  };
};
