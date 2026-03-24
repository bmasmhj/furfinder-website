const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

const localDir = path.join(__dirname, ".local").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
config.resolver.blockList = [
  new RegExp(localDir + "[\\/\\\\].*"),
];

config.watcher = {
  ...config.watcher,
  watchman: false,
  additionalExts: config.watcher?.additionalExts || [],
};

module.exports = config;
