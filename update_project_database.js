/**
 * 
 * Adding new shapefiles to the master FeatureCollection asset for Rangeland Explorer
 * 1. Upload shapefile to GEE Asset
 * 2. Import and set feature properties
 * 3. Combine with master feature collection
 * 4. Export to Asset
 * 
*/

// Define the date with which to label the update
var dateLabel = '20231008'

// Import the master featurecollection with existing shapefiles displayed in the app
var old = ee.FeatureCollection('users/zandersamuel/Consult_CSA/CSA_master_20230610')
Map.addLayer(old, {}, 'old')

// Import the new shapefile (uploaded to your GEE Asset)
var new1 = ee.FeatureCollection('users/zandersamuel/Consult_CSA/ERS_Project');
print(new1)

// (Optional)
// Set the feature properties
new1 = new1.map(function(ft){
  return ee.Feature(ft.geometry(), {
    Name: ft.get('Name'),
    Country:ft.get('Country'),
    Provnce:  ft.get('Province'),
    Project: ft.get('Project'),
    NGO: ft.get('NGO'),
    Cons_ac: ft.get('Cons_ac'),
    Farmer_num: '',
    Stock_num: '',
    Graz_assoc:  '',
    Year_start:  ft.get('Year_start'),
    Rainfall: '',
    Years_partic: '',
    Status: ft.get('Status')
  });
});
print(new1)
Map.addLayer(new1, {color:'red'}, 'new1')

// Merge the new and the old 
// At this stage, we are only using the Name and Project properties in the app
var combined = old.select(['Name','Project'])
  .merge(new1.select(['Name','Project']))
  
// Check to see the number of polygons is in fact changed
print(old.size(), 'old size')
print(combined, 'combined')
print(combined.size(), 'new size')

Map.addLayer(combined, {}, 'combined', 0)

// Check to see the list of unique projects
print(combined.distinct(['Project']).reduceColumns(ee.Reducer.toList(), ['Project']))

// Export to GEE Asset
Export.table.toAsset({
  collection: combined,
  assetId: 'Consult_CSA/CSA_master_' + dateLabel,
  description:'CSA_master_' + dateLabel
});
