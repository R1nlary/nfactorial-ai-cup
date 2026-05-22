/** @type {import('next').NextAdapter} */
const adapter = {
  name: "Vercel",
  modifyConfig(config) {
    return config;
  },
};

module.exports = adapter;
