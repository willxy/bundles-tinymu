'use strict';

/**
 * 
 */

const util = require('util');

const srcPath = '../../../src/';
const Config  = require(srcPath + 'Config');
const Logger = require(srcPath + 'Logger');

const path = require('path');

exports.bundle = (filepath) => {
  // filepath eg "..../bundles/tinymu-input-events/input-events/motd.js"
  // name eg "tinymu-input-events"
  const name = path.basename(path.dirname(path.dirname(filepath)));
  // type eg "input-events"
  const type = path.basename(path.dirname(filepath));
  // module eg "motd"
  const module = path.parse(filepath).name;
  return { name, type, module };
};

exports.deferModule = (filepath) => {
  // Logger.verbose(`filepath: ${filepath}`);
  const bundle = exports.bundle(filepath);
  // Logger.verbose(`bundle: ${util.inspect(bundle)}`);
  const exclusive = Config.get('handleExclusive');
  // Logger.verbose(`exclusive: ${util.inspect(exclusive)}`);
  const owners = exclusive[bundle.type][bundle.module];
  // Logger.verbose(`owners: ${util.inspect(owners)}`);

  // defer if: something is specified to handle it, and we're not in that
  // list
  return (owners && !(owners.includes(bundle.name)));
};
