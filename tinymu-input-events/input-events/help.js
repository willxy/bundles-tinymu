'use strict';

const fs = require('fs');
const util = require('util');

const default_text = `
Commands available:

   <blue>create</blue> <bold><magenta><name></magenta></bold> <bold><magenta><password></magenta></bold>
   <blue>create</blue> <green>"</green><bold><magenta><name></magenta></bold><green>"</green> <bold><magenta><password></magenta></bold>
   <blue>conect</blue> <bold><magenta><name></magenta></bold> <bold><magenta><password></magenta></bold> <bold><magenta><email></magenta></bold>
   <blue>conect</blue> <green>"</green><bold><magenta><name></magenta></bold><green>"</green> <bold><magenta><password></magenta></bold> <bold><magenta><email></magenta></bold>
   <blue>help</blue>
   <blue>who</blue>
   <blue>quit</blue>
`;

/**
 * Help event -- display command summary help text
 */
module.exports = (srcPath) => {
  const Logger = require(srcPath + 'Logger');
  const bundle = require('../../tinymu-lib/lib/common').bundle(__filename);
  const deferModule = require('../../tinymu-lib/lib/common').deferModule(__filename);
  const dataPath = srcPath + '/../data/';
  const EventUtil = require(srcPath + 'EventUtil');
  const textFile = dataPath + 'motd.help';

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
