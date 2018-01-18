'use strict';

const util = require('util');

/**
 * Connect event -- log in a player
 */
module.exports = (srcPath) => {
  const Logger = require(srcPath + 'Logger');
  const bundle = require('../../tinymu-lib/lib/common').bundle(__filename);
  const deferModule = require('../../tinymu-lib/lib/common').deferModule(__filename);
  const Data = require(srcPath + 'Data');
  const EventUtil = require(srcPath + 'EventUtil');

  // TODO: move this into server config settings.
  const maxFailedAttempts = 2;
  let failedAttempts = {};

  return {
    event: state => (socket, args) => {
      if(deferModule) {
        Logger.verbose(`${bundle.name}: ${bundle.module}: deferring`);
        return(false);
      }
      Logger.verbose(`${bundle.name}: ${bundle.module}`);
      Logger.verbose(`${bundle.module}: state args: ${util.inspect(args)}`);

      function loop() {
        return socket.emit('prelogin', socket, []);
      }

      // Limit number of login attempts per connection
      // adapted from ranvier-input-events/password.js
      function exceededAttempts(key) {
        if(!failedAttempts[key])
          failedAttempts[key] = 0;
        failedAttempts[key]++;
        Logger.log(`Failed attempts, ${key}: ${failedAttempts[key]}`);
        if (failedAttempts[key] > maxFailedAttempts) {
          EventUtil.genSay(socket)("Login attempts exceeded.");
          Logger.log(`Dropped connection; exceeded max failed login attempts, ${key}: ${failedAttempts[key]}`);
          socket.end();
          // Note: We *could* reset the count to 0 here, but we don't.
          //  - The effect at that point is to reduce attempts to 1/connection
          //    instead of 3/connection.
          //  - Correct passwords will still succeed.
          //  - And it'll get reset anyway whenever the server restarts.
          return true;
        }
      }

      const remoteAddress = socket.socket.socket.remoteAddress;
      const remotePort = socket.socket.socket.remotePort;

      if(args.cmdargs.length < 2) {
        EventUtil.genSay(socket)("<cyan>Usage:</cyan>");
        EventUtil.genSay(socket)("  <blue>connect</blue> <bold><magenta><name></magenta></bold> <bold><magenta><password></magenta></bold>");
        EventUtil.genSay(socket)('  <blue>connect</blue> <green>"</green><bold><magenta><name></magenta></bold><green>"</green> <bold><magenta><password></magenta></bold>');
        return loop();
      }

      let name = args.cmdargs[0];
      name = name[0].toUpperCase() + name.slice(1);
      const password = args.cmdargs[1];

      // from ranvier-input-events/login.js
      let account = Data.exists('account', name);
      if(!account) {
        Logger.log(`${remoteAddress}:${remotePort}: Login failed, account not exist: ${name}`);
        EventUtil.genSay(socket)("<red>Either that name does not exist, or has a different password.</red>");
        if(exceededAttempts(remoteAddress))
          // socket end?
          return false;
        else
          return loop();
      }

      account = state.AccountManager.loadAccount(name);
      if(account.banned) {
        Logger.log(`${remoteAddress}:${remotePort}: Login failed, banned player: ${name}`);
        EventUtil.genSay(socket)("That player has been banned.");
        socket.end();
        return false;
      }
      if(account.deleted) {
        Logger.log(`${remoteAddress}:${remotePort}: Login failed, deleted player: ${name}`);
        EventUtil.genSay(socket)("That player has been deleted.");
        socket.end();
        return false;
      }

      // from ranvier-input-events/password.js
      if (!account.checkPassword(password.toString().trim())) {
        Logger.log(`${remoteAddress}:${remotePort}: Login failed, incorrect password: ${name}`);
        EventUtil.genSay(socket)("<red>Either that name does not exist, or has a different password.</red>");
        if(exceededAttempts(remoteAddress))
          return false;
        else
          return loop();
      }

      // from ranvier-input-events/choose-character.js
      const player = state.PlayerManager.loadPlayer(state, account, name);
      player.socket = socket;
      socket.emit('done', socket, { player });
    },
  };
};
