/**
 * ! the original script for the burned area in Rangeland Explorer was deleted by mistake
 * Here I provide a script to do the same, but with an updated dataset called FireCCI
 * 1. Import the FireCCI data
 * 2. mask pixels with confidence < 50%
 * 3. Calculate fire frequency
 * 4. Export to GEE Asset
 */

// Define AOI
var geometry = 
    /* color: #d63000 */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-17.705829305349635, 17.992608332091926],
          [-17.705829305349635, -34.964047263572354],
          [51.59592850715036, -34.964047263572354],
          [51.59592850715036, 17.992608332091926]]], null, false);
var aoi = geometry; 
var fire_palette = ['#fff600', '#ff9d00', '#ff0000', '#ff07cd'];

// Import and clean FireCCI data between 2000 and 2022 (original Rangeland explorer map between 2000 and 2018)
var ba = ee.ImageCollection("ESA/CCI/FireCCI/5_1")
  .filter(ee.Filter.calendarRange(2000, 2022, 'year'))
  .map(confidenceMask(50))
  .select('BurnDate');
print(ba.limit(10))
Map.addLayer(ba, {}, 'ba raw', 0)

// Get annual burns
var baAnnual = temporalAverage(ba, 'year', ee.Reducer.max());

// Count number of burns over time period
var baCount = baAnnual.reduce(ee.Reducer.count());
Map.addLayer(baCount, {min:0, max:20, palette:fire_palette}, 'baAnnual', 0)

// Export
Export.image.toAsset({
  image: baCount,
  scale: 250,
  region:aoi,
  description: 'fire_freq_SrnAfrica_FireCCI_250m',
  assetId: 'Consult_CSA/fire_freq_SrnAfrica_FireCCI_250m',
  maxPixels: 1e11
})


///// Functions ---------------------------------------------------------------
function confidenceMask(thresh){
  return function(img){
    var confMask = img.select('ConfidenceLevel').gt(thresh);
    return img.updateMask(confMask)
  }
}

function temporalAverage(collection, unit, reducer) {
  var startDate = ee.Date(ee.Image(collection.sort('system:time_start').first().get('system:time_start')));
  startDate = startDate.advance(ee.Number(0).subtract(startDate.getRelative('month',unit)),'month')
    .update(null,null,null,0,0,0);
  var endDate = ee.Date(ee.Image(collection.sort('system:time_start',false).first()).get('system:time_start'));
  endDate = endDate.advance(ee.Number(0).subtract(endDate.getRelative('month',unit)),'month')
    .advance(1,unit).advance(-1,'month')
    .update(null,null,null,23,59,59);
  var dateRanges = ee.List.sequence(0, endDate.difference(startDate,unit).round().subtract(1))
  function makeTimeslice(num) {
    var start = startDate.advance(num, unit);
    var startNum = start.millis()
    var startDateNum = ee.Number.parse(start.format("YYYYMMdd"));
    var end = start.advance(1, unit).advance(-1, 'second');
    var filtered = collection.filterDate(start, end);
    var unitMeans = filtered.reduce(reducer)/////////Can be changed to another statistic!!!
      .set('system:time_start',startNum,'system:time_end',end,'date',startDateNum);
    return unitMeans;
  }
  var new_collection = ee.ImageCollection(dateRanges.map(makeTimeslice));
  return new_collection;
}
