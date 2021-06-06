var metaData = {
  tablet1Documents: 0,
  tablet2Documents: 0,
  tablet3Documents: 0,
  tablet1KeyRange: {
    start: 0,
    end: 0,
  },
  tablet2KeyRange: {
    start: 0,
    end: 0,
  },
  tablet3KeyRange: {
    start: 0,
    end: 0,
  },
};
function setMetaData(data) {
  for (const key of Object.keys(metaData)) {
    metaData[key] = data[key];
  }
}
module.exports = { metaData: metaData, set: setMetaData };
