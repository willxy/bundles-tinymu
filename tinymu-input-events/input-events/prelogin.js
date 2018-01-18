'use strict';

const util = require('util');

/**
 * PreLogin event -- handle commands available prior to login
 */
module.exports = (srcPath) => {
  const Logger = require(srcPath + 'Logger');
  const bundle = require('../../tinymu-lib/lib/common').bundle(__filename);
  const deferModule = require('../../tinymu-lib/lib/common').deferModule(__filename);
  // const EventUtil = require(srcPath + 'EventUtil');

  return {
    event: state => (socket, args) => {

      socket.once('data', data => {
        if(deferModule) {
          Logger.verbose(`${bundle.name}: ${bundle.module}: deferring`);
          return(false);
        }
        Logger.verbose(`${bundle.name}: ${bundle.module}`);
        Logger.verbose(`${bundle.module}: state args: ${util.inspect(args)}`);
        // Logger.verbose(`prelogin: data: ${util.inspect(data)}`);

        function loop() {
          return socket.emit('motd', socket, args);
        }

        const line = data.toString().trim();
        if(!line.length) {
          Logger.verbose(`${bundle.module}: no cmd`);
          return loop();
        }

        const cmdarray = line.split(/\s+/);
        const cmd = cmdarray[0].toLowerCase();
        const cmdargs = cmdarray.slice(1);
        // store cmdargs for later cmd handler
        args.cmdargs = cmdargs;

        // EventUtil.genSay(socket)(`Got: ${cmd}`);
        Logger.verbose(`${bundle.module}: cmd: ${cmd}`);

        if(cmd == 'quit') {
          return socket.emit('quit', socket, args);
        }
        else if(cmd.slice(0,1) == 'h') {
          return socket.emit('help', socket, args);
        }
        else if(cmd.slice(0,1) == 'n') {
          return socket.emit('news', socket, args);
        }
        else if(cmd.slice(0,1) == 'w') {
          return socket.emit('who', socket, args);
        }
        else if(cmd.slice(0,2) == 'co') {
          return socket.emit('connect', socket, args);
        }
        else if(cmd.slice(0,2) == 'cr') {
          return socket.emit('create', socket, args);
        }
        else {
          Logger.log(`${bundle.module}: unrecognized cmd: ${cmd}`);
          return loop();
        }
      });

    },
  };
};
