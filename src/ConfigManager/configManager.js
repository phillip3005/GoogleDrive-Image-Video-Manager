const fs = require("fs")

module.exports = function Config(path) {

    this.get = (key) => {
        let config = getConfig()
        return key ? config[key] : config
    }
    this.set = (newConfig) => {
        saveConfig(newConfig)
    }
    this.setValue = (key, value) => {
        let config = getConfig()
        config[key] = value
        saveConfig(config)
    }

    function saveConfig(config) {
        fs.writeFileSync(path, JSON.stringify(config))
    }

    function getConfig() {
        return JSON.parse(fs.readFileSync(path))
    }
}