console.log(document.getElementById('map'));
const locations = JSON.parse(document.getElementById('map').dataset.locations);

mapboxgl.accessToken =
  'pk.eyJ1IjoiY2FybG9zYXZlbGxhciIsImEiOiJja2V6czBmNm4wZHJiMzNwZHcza2o4NTBiIn0.bHG6SXX7ouO0yg0l-kyxCA';

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/carlosavellar/ckf00c8u72fzz19p5695ua09c',
});

// putting the configuration on the mapbox
const bounds = new mapboxgl.LngLatBounds();

locations.forEach((loc) => {
  // create markert
  const el = document.createElement('div');
  el.className('marker');

  // add marker
  new mapboxgl.Marken({
    element: el,
    anchor: 'bottom',
  })
    .setLngLat(loc.coordinates)
    .addTo(map);

  // App pop up
  new mapboxgl.Popup({
    offset: 30,
  });

  // extends map bounds
  bounds.extend(loc.coordinates);
});

map.fiBounds(bounds, {
  top: 200,
  bottom: 200,
  left: 100,
  right: 100,
});
