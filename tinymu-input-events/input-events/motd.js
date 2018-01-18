'use strict';

const util = require('util');

/**
 * MOTD event -- display contents of 'data/motd' file
 */
module.exports = (srcPath) => {
  const Logger = require(srcPath + 'Logger');
  const bundle = require('../../tinymu-lib/lib/common').bundle(__filename);
  const deferModule = require('../../tinymu-lib/lib/common').deferModule(__filename);
  const EventUtil = require(srcPath + 'EventUtil');
  const Data = require(srcPath + 'Data');

  return {
    event: state => (socket, args) => {
      if(deferModule) {
        Logger.verbose(`${bundle.name}: ${bundle.module}: deferring`);
        return(false);
      }
      Logger.verbose(`${bundle.module}: state args: ${util.inspect(args)}`);
      Logger.verbose(`${bundle.name}: ${bundle.module}`);

      const motd = Data.loadMotd();
      if (motd) {
        EventUtil.genSay(socket)(motd);
      }

      return socket.emit('prelogin', socket, args);
    },
  };
};
