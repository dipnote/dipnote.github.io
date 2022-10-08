const loadJSON = async () => {
  const response = await fetch("./data/data.json");
  const data = await response.json();

  return data;
};

const data = await loadJSON();

console.log(
  data.features.forEach((feature) => {
    console.log(feature.properties.featureNam);
  })
);
