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
// T-048: the second route, five stops on the AI methods (about 10 minutes), opened as aitour.html?s=1 .. 5.
export const AI_STOPS = [
  {n: 1, key: 'asked', name: 'What we asked', min: 2, title: 'Five questions put to the models',
   show: 'What went in (a photograph, an outline, catalogue words) and the five things we asked of it.',
   say: 'The models see only photographs, outlines and catalogue words. We asked them five things and measured each against a plain baseline.',
   live: 'analyse.html#ai', liveLabel: 'Open the results page'},
  {n: 2, key: 'worked', name: 'What worked', min: 3, title: 'How well each one did',
   show: 'One number per question, the 95 % interval, and what it is compared with.',
   say: 'Look-alike search and plain-word search clearly beat their baselines. Groups and function labels help but are not verified by experts. Asbestos flagging beats guessing by a modest margin.',
   live: 'analyse.html#ai', liveLabel: 'Open the results page'},
  {n: 3, key: 'examples', name: 'Predictions', min: 3, title: 'Real predictions, right and wrong',
   show: 'Real objects, what the model said, and whether it was right. A wrong one for every question.',
   say: 'These are drawn by a fixed rule, not picked for looks; the wrong ones are shown on purpose.',
   live: 'analyse.html#ai', liveLabel: 'Open the results page'},
  {n: 4, key: 'failed', name: 'What did not work', min: 1, title: 'What did not work, and where the models stay silent',
   show: 'Tests that failed or tied, and how often the function view declines to answer.',
   say: 'Several ideas did not beat a simple baseline. Where evidence is thin the models abstain, and abstaining is not a no.',
   live: 'analyse.html#ai', liveLabel: 'Open the results page'},
  {n: 5, key: 'museum', name: 'For a museum', min: 1, title: 'What this gives a museum',
   show: 'Links to objects in other museums, an order in which to sample for asbestos, and catalogue entries the image disagrees with.',
   say: 'Use the output as a list of candidates to check, never as a verdict.',
   live: 'analyse.html#ai', liveLabel: 'Open the results page'},
];
export const ROUTES = {main: STOPS, ai: AI_STOPS};
export const stopHref = (n, route) => (route === 'ai' ? 'aitour.html?s=' : 'tour.html?s=') + n;
const KEY = 'vh.tour', KEY_AI = 'vh.aitour', KEY_ROUTE = 'vh.tourroute';
const read = (k, len) => { try { const v = Number(sessionStorage.getItem(k)); return v >= 1 && v <= len ? v : 0; } catch { return 0; } };
export const getTour = () => read(KEY, STOPS.length);
export const setTour = n => { try { sessionStorage.setItem(KEY, String(n)); sessionStorage.setItem(KEY_ROUTE, 'main'); } catch {} };
export const getAiTour = () => read(KEY_AI, AI_STOPS.length);
export const setAiTour = n => { try { sessionStorage.setItem(KEY_AI, String(n)); sessionStorage.setItem(KEY_ROUTE, 'ai'); } catch {} };
export const getRoute = () => { try { return sessionStorage.getItem(KEY_ROUTE) === 'ai' ? 'ai' : 'main'; } catch { return 'main'; } };
export const clearTour = () => { try { sessionStorage.removeItem(KEY); sessionStorage.removeItem(KEY_AI); sessionStorage.removeItem(KEY_ROUTE); } catch {} };
