'use strict';

const util = require('util');

/**
 * Character class -- set (initial) character class
 */
module.exports = (srcPath) => {
  const Logger = require(srcPath + 'Logger');
  const bundle = require('../../tinymu-lib/lib/common').bundle(__filename);
  const deferModule = require('../../tinymu-lib/lib/common').deferModule(__filename);
  // const Data = require(srcPath + 'Data');
  // const EventUtil = require(srcPath + 'EventUtil');
  // const CommonFunctions = require('../lib/CommonFunctions');

  return {
    event: state => (socket, args) => {
      if(deferModule) {
        Logger.verbose(`${bundle.name}: ${bundle.module}: deferring`);
        return(false);
      }
      Logger.verbose(`${bundle.name}: ${bundle.module}`);
      Logger.verbose(`${bundle.module}: state args: ${util.inspect(args)}`);

      // separate module so that it can be overridden by another bundle

      // from ranvier-input-events/choose-class.js
      args.playerClass = "warrior";
      socket.emit('finish-create', socket, args);

    },
  };
};
