/**
 * Pre-export time series data for all polygons in Rangeland Explorer
 * 1. Import the master feature collection
 * 2. Import the satellite data and training data needed for temporal statistics
 * 3. Loop over time series and projects to extract mean value per polygon across set of time series data
 * 4. Export to Drive
 * 5. Import into R to merge files
 * 6. Upload back into a GEE Asset
 */


//// Global objects and paramaters ----------------------------------------------------------------

// Import geometries defining project extents
var geometry = 
    /* color: #d63000 */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[31.23125396489256, -22.2108383566201],
          [31.23125396489256, -24.229971486534726],
          [33.42302642583006, -24.229971486534726],
          [33.42302642583006, -22.2108383566201]]], null, false),
    geometry2 = 
    /* color: #98ff00 */
    /* displayProperties: [
      {
        "type": "rectangle"
      },
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.MultiPolygon(
        [[[[28.68534673367544, -30.458023749705003],
           [28.68534673367544, -30.953937876315717],
           [29.23466313992544, -30.953937876315717],
           [29.23466313992544, -30.458023749705003]]],
         [[[28.7890869564936, -32.05624939716554],
           [28.7890869564936, -32.208593381736804],
           [28.883844036571723, -32.208593381736804],
           [28.883844036571723, -32.05624939716554]]]], null, false),
    geometry3 = 
    /* color: #0b4a8b */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[20.95024748677959, -17.842248671588656],
          [20.95024748677959, -21.094178276654002],
          [25.190970143029585, -21.094178276654002],
          [25.190970143029585, -17.842248671588656]]], null, false),
    geometry4 = 
    /* color: #ffc82d */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[29.187987374711472, -22.788392235251568],
          [29.187987374711472, -23.137384763111807],
          [29.970763253617722, -23.137384763111807],
          [29.970763253617722, -22.788392235251568]]], null, false),
    geometry5 = 
    /* color: #00ffff */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[31.2569524356448, -24.525712407318565],
          [31.2569524356448, -24.745411382234263],
          [31.52337089267605, -24.745411382234263],
          [31.52337089267605, -24.525712407318565]]], null, false),
    geometry6 = 
    /* color: #bf04c2 */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[28.690026287829856, -21.346586704704198],
          [28.690026287829856, -22.47286905403228],
          [29.947960858142356, -22.47286905403228],
          [29.947960858142356, -21.346586704704198]]], null, false),
    geometry7 = 
    /* color: #ff0000 */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[17.449015007575344, -28.89105074204393],
          [17.449015007575344, -30.513248612037206],
          [18.294962273200344, -30.513248612037206],
          [18.294962273200344, -28.89105074204393]]], null, false),
    geometry8 = 
    /* color: #00ff00 */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[30.815308510610254, -27.81725645071073],
          [30.815308510610254, -28.48804580663223],
          [31.485474526235254, -28.48804580663223],
          [31.485474526235254, -27.81725645071073]]], null, false),
    geometry9 = 
    /* color: #d63000 */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[30.776846960049554, -27.785834593420404],
          [30.776846960049554, -28.48337879171887],
          [31.606314733487054, -28.48337879171887],
          [31.606314733487054, -27.785834593420404]]], null, false);

// Define the date today - needed to get most recent Sentinel-2 
var nowDate = '2023-10-08'

// Define the date with which to label the update
var dateLabel = '20231008'

Map.setOptions('HYBRID')

// Import master shapefile of project areas/communities
var communities = ee.FeatureCollection('users/zandersamuel/Consult_CSA/CSA_master_20231008');
print(communities.distinct('Project').reduceColumns(ee.Reducer.toList(), ['Project']))
communities = communities.map(function(ft){return ft.set('area', ft.geometry().area().divide(ee.Number(10000)))});
Map.addLayer(communities, {}, 'communities', 0)

// Get a list of distinct communities
var distinctComs = communities.distinct(['Project']).reduceColumns(ee.Reducer.toList(), ['Project'])
print(distinctComs, 'distinctComs')

// We need to iterate the processing over projects because we run into memory limits if we do all in one go
// Some are named different things e.g. "Umzimvubu Catchment Partnership Programme", "UCPP"
// others cover the similar geographic area e.g. "NGED", "Namakwa"
// make list of projects to iterate the export over
var distinctComs = [
    ["Greater Mapungubwe TFCA"],
    ["Ngamiland"],
    ["Limpopo NP Project", "Bahine National Park"],
    ["Drakensberg Sub-Escarpment"],
    ["Soutpansberg"],
    ["K2C"],
    ["Umzimvubu Catchment Partnership Programme", "UCPP"],
    ["NGED", "Namakwa"],
    ['ReGen Agric']
  ]

// Import training data for fractional cover prediction
// these were hand-digitized by Zander and exported to GEE Asset
// ideally, when a new project area is added, you need to collect more training data over this area
// an alterantive to this approach is to use the global maps from "COPERNICUS/Landcover/100m/Proba-V-C3/Global"
// instead of a custom-trained model for each project area. 
// but the CGLC data is only annual frequency and I have not compared the difference in accuracy
var trainingTestingMaster = ee.FeatureCollection('users/zandersamuel/Consult_CSA/Training_data_TOA_bg_t_g')
Map.addLayer(trainingTestingMaster, {}, 'training data', 0);

// Sentinel-2 parameters
var sceneCloudThreshold = 50;
var cloudMaskProbability = 30;

// Define S2 band common names
var S2_BANDS = ['QA60', 'B1','B2','B3','B4', 'B5', 'B6', 'B7','B8','B11','B12']; // Sentinel bands
var S2_NAMES = ['QA60','cb', 'blue', 'green', 'red', 'R1', 'R2', 'R3','nir','swir1', 'swir2']; // Common names
var selectBands = ['blue', 'green', 'red', 'R2','nir','swir1', 'ndvi', 'nbr', 'evi'];


//// Collect tempporal data for polygons and export ---------------------------------------------------------------

// Iterate over the list of projects
for (var c=0; c<9; c++){
  var x = distinctComs[c]
  
  var communitiesSelect = communities.filter(ee.Filter.inList('Project', x));
  
  var geo = communitiesSelect.geometry().bounds();
  
  var classifier;
  
  if (x == "Drakensberg Sub-Escarpment"){
     classifier = trainBGT(geometry9)
  } else if (x == 'ReGen Agric') {
    classifier = trainBGT(geometry2);
  } else {
    classifier = trainBGT(geo);
  }
  
  // Get quarterly sentinel-2 mosaics
  var col = getSentQuarterly(geo);
  
  // map over image collection and classify into fractional cover and compute NDVI and EVI
  var feats = col.map(function(img){
    var bg = classifyBGT(img, classifier).select('bare')
    var image = img.select(['evi', 'ndvi']).addBands(bg);
    
    // Reduce regions over project polygons in the area
    var reduced = image.reduceRegions({
      collection: communitiesSelect, 
      reducer: ee.Reducer.mean(), 
      scale: 120,
      tileScale: 4
    });
    reduced = reduced.distinct(['Name', 'area'])
    
    // Set the year and month of the image
    reduced = reduced.map(function(ft){
      return ft.set('year', img.get('year'), 'month', img.get('month'))
    })
    
    return reduced
  }).flatten()
  
  // Export
  Export.table.toDrive({
    collection: feats,
    description: 'Temporal_pre_export_' + dateLabel + '_' + String(c) ,
    fileFormat: 'CSV'
  })
}


//// Post-export instructions ----------------------------------------------------------------
// After tasks have completed, import into R and merge using the script below
// Then upload the output CSV file back to GEE Asset

/*
# Set working directory to the location of the GEE exported files
readMultiFiles <- function(directory){
  
  files <- list.files(directory, pattern='*.csv', full.names=TRUE)
  raw <- files %>% 
    map_df(~read_csv(.)) %>%
    dplyr::select(-'system:index', -'.geo')
  return (raw)
  
}
table <- readMultiFiles('./')
write_csv(table%>% 
            dplyr::select('Name', 'name','ndvi','evi','bare', 'year','month'), 'Temporal_pre_export_20220404.csv')

*/


//// Global functions -----------------------------------------------------------------------


// Function to train a RandomForest classifier to predict fractional cover
function trainBGT(aoi){
  var trainingTesting = trainingTestingMaster.filterBounds(aoi)

  // Get a RandomForest classifier and train it.
  var classifier = ee.Classifier.smileRandomForest(100).train({
    features: trainingTesting, 
    classProperty: 'landcover', 
    inputProperties: selectBands
  }).setOutputMode('MULTIPROBABILITY');
  
  return classifier
}


function classifyBGT(image, classifier){
  var classifiedImage = image.classify(classifier)
  var percGc = classifiedImage.arrayFlatten([[ 'bare', 'tree','grass']]).multiply(100);
  return percGc
}

function quarterlyMedians(collection,dateStart, unit, step, reducer) {
  //var startDate = ee.Date(ee.Image(collection.sort('system:time_start').first().get('system:time_start')));
  var startDate = ee.Date.parse('YYYY-mm-dd',dateStart);
  startDate = startDate.advance(ee.Number(0).subtract(startDate.getRelative('month',unit)),'month')
    .update(null,null,null,0,0,0);
  
  var endDate = ee.Date(ee.Image(collection.sort('system:time_start',false).first()).get('system:time_start'));
  endDate = endDate.advance(ee.Number(0).subtract(endDate.getRelative('month',unit)),'month')
    .advance(1,unit).advance(-1,'month')
    .update(null,null,null,23,59,59);

  var dateRanges = ee.List.sequence(0, endDate.difference(startDate,unit).round().subtract(1))

  function makeTimeslice(num) {
    var start = startDate.advance(num, unit);
    var startDateNum = start.millis();
    var end = start.advance(step, unit).advance(-1, 'second');
    // Filter to the date range
    var filtered = collection.filterDate(start, end);
    // Get the mean
    var unitMeans = filtered.reduce(reducer)
      .set('system:time_start',startDateNum,
        'date',start, 
        'month', start.get('month'), 
        'year',start.get('year'));
    return unitMeans;
  }
  // Aggregate to each timeslice
  var new_collection = ee.ImageCollection(dateRanges.map(makeTimeslice));
  
  new_collection = new_collection.filter(ee.Filter.inList('month', [1,4,7,10]))

  return new_collection;
}


// Function to add spectral indices to Sentinel images
function addIndices(image) {
  var evi =   image.expression(
    '2.5 * ((NIR - RED) / (NIR + (2.4 * RED) + 1000))', {
      'NIR': image.select('nir'),
      'RED': image.select('red')
  }).rename('evi')
  // Add vegetation indices
  var ndvi = image.normalizedDifference(['nir', 'red']).rename('ndvi');
  var nbr = image.normalizedDifference(['nir', 'swir2']).rename("nbr");
  return image.addBands(ndvi).addBands(nbr).addBands(evi);
}

// Sentinel-2 cloud masking
function maskClouds(cloudProbabilityThreshold){
  return function(_img) {
  var cloudMask = _img.select('probability').lt(cloudProbabilityThreshold);
  return _img.updateMask(cloudMask);
}}

function getS2cloudMasked(aoi, startDate, endDate) { 
  var primary = ee.ImageCollection("COPERNICUS/S2")
      .filterBounds(aoi)
      .filterDate(startDate, endDate)
      .filterMetadata('CLOUDY_PIXEL_PERCENTAGE', 'less_than', sceneCloudThreshold)
      .select(S2_BANDS, S2_NAMES)
      .map(addIndices);
  var secondary = ee.ImageCollection("COPERNICUS/S2_CLOUD_PROBABILITY")
      .filterBounds(aoi)
      .filterDate(startDate, endDate);
  var innerJoined = ee.Join.inner().apply({
    primary: primary,
    secondary: secondary,
    condition: ee.Filter.equals({
      leftField: 'system:index',
      rightField: 'system:index'
    })
  });
  var mergeImageBands = function (joinResult) {
    return ee.Image(joinResult.get('primary'))
          .addBands(joinResult.get('secondary'));
  };
  var newCollection = innerJoined.map(mergeImageBands);
  newCollection =  ee.ImageCollection(newCollection)
      .map(maskClouds(cloudMaskProbability))
      .sort('system:time_start');
  newCollection = newCollection.select(selectBands);
  
  return newCollection
}


function getSentQuarterly(aoi){
  var sentinel2 = getS2cloudMasked(aoi, '2017-01-01', nowDate);
  var sentQuarterly = quarterlyMedians(sentinel2,'2017-01-01', 'month', 3, ee.Reducer.median());
  sentQuarterly = sentQuarterly.map(function(i){return i.rename(selectBands)})
  return sentQuarterly
}
