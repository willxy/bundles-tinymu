'use strict';

const util = require('util');

/**
 * Create event -- create matching Account and Player
 */
module.exports = (srcPath) => {
  const Logger = require(srcPath + 'Logger');
  const bundle = require('../../tinymu-lib/lib/common').bundle(__filename);
  const deferModule = require('../../tinymu-lib/lib/common').deferModule(__filename);
  const Data = require(srcPath + 'Data');
  const EventUtil = require(srcPath + 'EventUtil');
  const CommonFunctions = require('../lib/CommonFunctions');
  const Account = require(srcPath + 'Account');

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

      const remoteAddress = socket.socket.socket.remoteAddress;
      const remotePort = socket.socket.socket.remotePort;

      if(args.cmdargs.length < 3) {
        EventUtil.genSay(socket)("<cyan>Usage:</cyan>");
        EventUtil.genSay(socket)("  <blue>create</blue> <bold><magenta><name></magenta></bold> <bold><magenta><password></magenta></bold> <bold><magenta><email></magenta></bold>");
        EventUtil.genSay(socket)('  <blue>create</blue> <green>"</green><bold><magenta><name></magenta></bold><green>"</green> <bold><magenta><password></magenta></bold> <bold><magenta><email></magenta></bold>');
        return loop();
      }

      let name = args.cmdargs[0];

      // from ranvier-input-events/login.js
      name = name[0].toUpperCase() + name.slice(1);
      const password = args.cmdargs[1];
      const email = args.cmdargs[2];

      const invalid = CommonFunctions.validateName(name);
      if(invalid) {
        Logger.log(`${remoteAddress}:${remotePort}: Create failed, invalid name: ${name}`);
        // EventUtil.genSay(socket)(`<red>${invalid}</red>`);
        EventUtil.genSay(socket)("<red>Either there is already someone with that name, or that name is illegal.</red>");
        return loop();
      }

      const accountExist = Data.exists('account', name);
      if(accountExist) {
        Logger.log(`${remoteAddress}:${remotePort}: Create failed, account exists: ${name}`);
        EventUtil.genSay(socket)("<red>Either there is already a someone with that name, or that name is illegal.</red>");
        return loop();
      }

      // from ranvier-input-events/create-player.js
      const playerExist = state.PlayerManager.exists(name);
      if (playerExist) {
        Logger.log(`${remoteAddress}:${remotePort}: Create failed, character exists: ${name}`);
        EventUtil.genSay(socket)("<red>Either there is already a someone with that name, or that name is illegal.</red>");
        return loop();
      }

      // from ranvier-input-events/change-password.js
      // TODO: possibly move this into server config settings
      if(password.length < 8) {
        Logger.log(`${remoteAddress}:${remotePort}: Create failed, password too short: ${name}`);
        EventUtil.genSay(socket)("<red>Password needs to be at least 8 characters.</red>");
        return loop();
      }

      // from ranvier-input-events/create-account.js
      const account = new Account({
        username: name,
      });
      // from ranvier-input-events/change-password.js
      account.setPassword(password);
      state.AccountManager.addAccount(account);
      account.save();

      // pass on
      args.playerName = name;
      args.playerEmail = email;
      args.account = account;

      socket.emit('character-class', socket, args);
    },
  };
};
