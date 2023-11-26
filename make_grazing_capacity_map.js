/**
 * Pre-export grazing capacity layer for Rangeland Explorer
 * 1. Import the grazing capacity training data and satellite data
 * 2. Export features for calibrating and testing a Random Forest in R
 * 3. Train a Random Forest in GEE and make inference
 * further description here: https://docs.google.com/document/d/1SH5SA3-B16bUPLsp0CH86R9I2EN59oJf7eSeWnpLWnk/edit
 */

var geometry = 
    /* color: #d63000 */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[11.561964539736664, -10.303247727453806],
          [11.561964539736664, -34.98428481240949],
          [40.961378602236664, -34.98428481240949],
          [40.961378602236664, -10.303247727453806]]], null, false);

// Import the reference data for grazing capacity
var gp = ee.FeatureCollection('users/zandersamuel/SA_misc/Grazing_Capacity_10102016')
print(gp.limit(10));

// Import countries to export for
var names = ['SOUTH AFRICA','LESOTHO','SWAZILAND','NAMIBIA','ZIMBABWE','BOTSWANA','MOZAMBIQUE']
var countries = ee.FeatureCollection('USDOS/LSIB/2013').filter(ee.Filter.inList('name', names));
Map.addLayer(countries, {},'countries',0)

var samplingArea = countries; 
Map.addLayer(samplingArea, {}, 'sampling area',0);

// Define the start and end date of the period you want to map
var startDate = '2015-01-01';
var endDate = '2017-01-01'

// Create a mask of non-natural lands
var glc_coll = ee.ImageCollection('users/cgmorton/GlobeLand30');
var glc_img = ee.Image(glc_coll.mosaic())//.divide(ee.Image(10));

var masked = glc_img.neq(10)
  .and(glc_img.neq(20))
  .and(glc_img.neq(50))
  .and(glc_img.neq(60))
  .and(glc_img.neq(80))
  .and(glc_img.neq(100))
  .and(glc_img.neq(255));
//Map.setCenter(-88.6, 26.4, 3);
Map.addLayer(masked, {}, 'masked',0);

//////////////////////////////////////////////////////////
// MODIS
var ndwi = ee.ImageCollection('MODIS/MCD43A4_NDWI')
  .filterBounds(samplingArea)
  .filterDate(startDate, endDate)
  .median();

var evi = ee.ImageCollection('MODIS/006/MOD13Q1')
  .filterBounds(samplingArea)
  .filterDate(startDate, endDate)
  .select('EVI');
var eviMed = evi.median();
var ndvi_palette = ['FFFFFF', 'CE7E45', 'DF923D', 'F1B555', 'FCD163', '99B718', '74A901', '66A000', '529400', '3E8601',
'207401', '056201', '004C00', '023B01', '012E01', '011D01', '011301'];
Map.addLayer(evi, {min:0,max:5000,palette:ndvi_palette}, 'evi',0)

// Calculate variance in EVI over time
var eviVar = evi.reduce(ee.Reducer.variance());

// Get surface reflectance data as well
var srf = ee.ImageCollection('MODIS/006/MOD09A1')
  .filterBounds(samplingArea)
  .filterDate(startDate, endDate)
  .select(['sur_refl_b01', 'sur_refl_b02','sur_refl_b03','sur_refl_b04','sur_refl_b05','sur_refl_b06','sur_refl_b07']);  
var srfMed = srf.median()

// Combine
var combined = ndwi.addBands(eviMed.rename('evi')).addBands(eviVar.rename('evi_var')).addBands(srfMed)
// Apply land cover mask to isolate rangeland
combined = combined.updateMask(masked)

var bands = combined.bandNames()

//////////////////////////////////////////////////////////
// Pre-export to R for testing random forest accuracy 
var trainTest = gp.map(function(ft) {
  return ft.setGeometry(null).set(combined.reduceRegion({
    reducer: 'mean',
    geometry: ft.geometry(),
    scale: 500,
  }));
});

print(trainTest.limit(10))

Export.table.toDrive({
  collection:trainTest,
   description:'MODIS_grazingCap_training', 
  fileFormat:'CSV'
});


//////////////////////////////////////////////////////////
// Random forest

// Convert to LSU per hectare
trainTest = trainTest.map(function(ft){
  return ft.set('LSU_ha', ee.Number(1).divide(ee.Number(ft.get('ha_LSU'))))
})

// Train RF classifier
var classifierReg = ee.Classifier.smileRandomForest(100)// parameters: numberOfTrees, variablesPerSplit, minLeafPopulation, bagFraction
  .setOutputMode('REGRESSION')
  .train({
  features: trainTest, 
  classProperty: 'LSU_ha', 
  inputProperties: bands
});

// Classify with RandomForest.
var classified = combined.select(bands).classify(classifierReg);

Map.addLayer(classified, {min:0, max:0.5, palette: ndvi_palette}, 'classified')

Export.image.toAsset({
  image: classified.clipToCollection(samplingArea),
  description: 'grazingCapacity_srnAfrica_LSU_ha',
  assetId: 'Consult_CSA/grazingCapacity_srnAfrica_LSU_ha',
  scale: 250,
  region: geometry, // need to buffer to include coastline points //samplingArea.geometry().bounds().buffer(50000)
  maxPixels: 1142052456000
});
