'use strict';

const util = require('util');
const sprintf = require('sprintf-js').sprintf;

/**
 * Who event -- show logged in players
 */
module.exports = (srcPath) => {
  const Logger = require(srcPath + 'Logger');
  const bundle = require('../../tinymu-lib/lib/common').bundle(__filename);
  const deferModule = require('../../tinymu-lib/lib/common').deferModule(__filename);
  const EventUtil = require(srcPath + 'EventUtil');

  return {
    event: state => (socket, args) => {
      if(deferModule) {
        Logger.verbose(`${bundle.name}: ${bundle.module}: deferring`);
        return(false);
      }
      Logger.verbose(`${bundle.name}: ${bundle.module}`);
      Logger.verbose(`${bundle.module}: state args: ${util.inspect(args)}`);

      function getRoleString(role = 0) {
        return [
          'Player',
          '<white>[Builder]</white>',
          '<b><white>[Admin]</white></b>',
        ][role] || '';
      }

      EventUtil.genSay(socket)(sprintf("%-18.18s  %6s  %4s   %.20s",
        "Player Name", "On For", "Idle", "Info"));

      state.PlayerManager.players.forEach((otherPlayer) => {
        const name = otherPlayer.name;

        // TODO: format into "11d", "11:11", "11m", "11s", etc
        const timems = Date.now() - otherPlayer.connectTime;
        const time = Math.floor(timems / 1000) + 's';
        const idlems = Date.now() - otherPlayer._lastCommandTime;
        const idle = Math.floor(idlems / 1000) + 's';
        const role = getRoleString(otherPlayer.role);

        EventUtil.genSay(socket)(sprintf("%-18.18s  %6s  %4s   %.20s",
          name, time, idle, role));
        // Logger.verbose(`who: player: ${util.inspect(otherPlayer, null, 2)}`);
      });

      const total = state.PlayerManager.players.size;
      EventUtil.genSay(socket)(`${total} Players logged in`);

      return socket.emit('prelogin', socket, []);
    },
  };
};
