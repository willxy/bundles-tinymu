'use strict';

const util = require('util');

/**
 * Finish Create -- Finish player creation. Add the character to the account 
 * then add the player to the game world
 */
module.exports = (srcPath) => {
  const Logger = require(srcPath + 'Logger');
  const bundle = require('../../tinymu-lib/lib/common').bundle(__filename);
  const deferModule = require('../../tinymu-lib/lib/common').deferModule(__filename);
  // const Data = require(srcPath + 'Data');
  // const EventUtil = require(srcPath + 'EventUtil');
  // const CommonFunctions = require('../lib/CommonFunctions');
  // const Account = require(srcPath + 'Account');
  const Player = require(srcPath + 'Player');

  return {
    event: state => (socket, args) => {
      if(deferModule) {
        Logger.verbose(`${bundle.name}: ${bundle.module}: deferring`);
        return(false);
      }
      Logger.verbose(`${bundle.name}: ${bundle.module}`);
      Logger.verbose(`${bundle.module}: state args: ${util.inspect(args)}`);

      const remoteAddress = socket.socket.socket.remoteAddress;
      const remotePort = socket.socket.socket.remotePort;

      const account = args.account;

      // from ranvier-input-events/finish-player.js
      let player = new Player({
        name: args.playerName,
        account: args.account,
        email: args.playerEmail,
        // TIP:DefaultAttributes: This is where you can change the default attributes for players
        // TODO: possibly move this into server config settings
        attributes: {
          health: 100,
          strength: 20,
          agility: 20,
          intellect: 20,
          stamina: 20,
          armor: 0,
          critical: 0,
        },
      });

      Logger.verbose(`player: ${util.inspect(player)}`);

      account.addCharacter(args.playerName);
      account.save();

      player.setMeta('class', args.playerClass);

      const room = state.RoomManager.startingRoom;
      player.room = room;
      player.save();

      // reload from manager so events are set
      player = state.PlayerManager.loadPlayer(state, player.account, player.name);
      player.socket = socket;

      Logger.log(`Create: ${player.name} from ${remoteAddress}:${remotePort}`);
      socket.emit('done', socket, { player });

    },
  };
};
