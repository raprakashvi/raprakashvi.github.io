// The six stops of the 30-minute tour (T-047).  One list, read by the tour pages, the persistent bar, the front page
// and the printable route sheet, so a stop is named and timed in one place only.
export const STOPS = [
  {n: 1, key: 'why', name: 'Why', min: 3, title: 'The same tool, held by many museums',
   show: 'One kind of instrument, photographed in several collections, each catalogued in its own words.',
   say: 'Every museum describes its objects differently, so the same kind of tool is hard to find across collections.',
   live: 'collection.html', liveLabel: 'Browse the collection'},
  {n: 2, key: 'clusters', name: 'Groups across museums', min: 6, title: 'Groups that cross museums',
   show: 'Four ways of grouping the whole collection: by look, by type, by shape, by use. No museum is an input.',
   say: 'These groups were found from the objects themselves, then we counted which museums they reach.',
   live: 'clusters.html', liveLabel: 'Open every group'},
  {n: 3, key: 'group', name: 'One group in depth', min: 6, title: 'One group, museum by museum',
   show: 'A photograph from each museum, the dates, and the closest pairs between museums.',
   say: 'Pick any museum: the nearest object in another collection is one click away.',
   live: 'clusters.html', liveLabel: 'Open this group'},
  {n: 4, key: 'map', name: 'Map of forms and time', min: 6, title: 'A map of forms, and when they were made',
   show: 'Every object with a photograph placed by how it looks; choose a museum to see where it sits.',
   say: 'Look-alikes sit together. Filter to your own museum and see which neighbours it has elsewhere.',
   live: 'map.html', liveLabel: 'Open the map'},
  {n: 5, key: 'tree', name: 'Family tree and lineages', min: 5, title: 'How a principle moves through time',
   show: 'Chains of devices that grew out of one another, and the family tree that joins them.',
   say: 'A working principle can be followed from its first object to its last, across museums.',
   live: 'atlas.html#map', liveLabel: 'Open the family tree'},
  {n: 6, key: 'museum', name: 'What it means for a museum', min: 4, title: 'What this gives a museum',
   show: 'Gaps no collection here fills, bridges between medicine and science, a side-by-side Compare, and who to contact.',
   say: 'Your collection gets neighbours, missing stages and comparisons it did not have in one place.',
   live: 'gaps.html', liveLabel: 'Open the gaps'},
];
export const stopHref = n => 'tour.html?s=' + n;
const KEY = 'vh.tour';
export const getTour = () => { try { const v = Number(sessionStorage.getItem(KEY)); return v >= 1 && v <= STOPS.length ? v : 0; } catch { return 0; } };
export const setTour = n => { try { sessionStorage.setItem(KEY, String(n)); } catch {} };
export const clearTour = () => { try { sessionStorage.removeItem(KEY); } catch {} };
