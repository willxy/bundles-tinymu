'use strict';

const fs = require('fs');
const util = require('util');

const default_text = `
  No news is good news, right?
`;

/**
 * News event -- display news bulletin
 */
module.exports = (srcPath) => {
  const Logger = require(srcPath + 'Logger');
  const bundle = require('../../tinymu-lib/lib/common').bundle(__filename);
  const deferModule = require('../../tinymu-lib/lib/common').deferModule(__filename);
  const dataPath = srcPath + '/../data/';
  const EventUtil = require(srcPath + 'EventUtil');
  const textFile = dataPath + 'motd.news';

  return {
    event: state => (socket, args) => {
      if(deferModule) {
        Logger.verbose(`${bundle.name}: ${bundle.module}: deferring`);
        return(false);
      }
      Logger.verbose(`${bundle.name}: ${bundle.module}`);
      Logger.verbose(`${bundle.module}: state args: ${util.inspect(args)}`);

      let text_contents = null;
      if (fs.existsSync(textFile))
        text_contents = fs.readFileSync(textFile).toString('utf8');
      if (text_contents)
        EventUtil.genSay(socket)(text_contents);
      else
        EventUtil.genSay(socket)(default_text);

      return socket.emit('prelogin', socket, []);
    },
  };
};
