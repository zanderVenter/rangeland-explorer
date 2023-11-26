/**
 * Pre-export baseline statistics for all polygons in Rangeland Explorer
 * 1. Import the master feature collection
 * 2. Import the set of baseline layers
 * 3. Reduce regions to extract mean value per polygon across set of baseline layers
 * 4. Export to Asset
 */

// Define the date with which to label the update
var dateLabel = '20231008'

// Importing the master feature collection and calculating the area for each feature in hectares
var communities = ee.FeatureCollection('users/zandersamuel/Consult_CSA/CSA_master_20231008');
communities = communities.map(function(ft){
  return ft.set('area', ft.geometry().area().divide(ee.Number(10000)))
});

// Importing and processing MODIS vegetation indices, calculating median values for baseline
var modisVeg = ee.ImageCollection("MODIS/006/MOD13Q1")
  .filterDate('2016-01-01', '2020-01-01')
  .select(['NDVI', 'EVI'])
  .map(function(i){ return i.divide(10000)});
var eviBaseline = modisVeg.select('EVI').median()
var ndviBaseline = modisVeg.select('NDVI').median()

// Processing land cover data from COPERNICUS to get cover fractions
var cgls = ee.ImageCollection("COPERNICUS/Landcover/100m/Proba-V-C3/Global")
  .select(['bare-coverfraction','crops-coverfraction', 'urban-coverfraction','shrub-coverfraction', 'grass-coverfraction','tree-coverfraction'])
cgls = cgls.median();

// Additional calculations for land cover fractions and grazing capacity
var bg = cgls.select('bare-coverfraction').add(cgls.select('urban-coverfraction'))
var t = cgls.select('tree-coverfraction').add(cgls.select('shrub-coverfraction'))
var g = cgls.select('grass-coverfraction')

// Cropland and urban mask - Creating a mask to exclude certain land cover types in the grazing capacity map
// Using GlobeLand - could use a better one
// https://www.un-spider.org/links-and-resources/data-sources/land-cover-map-globeland-30-ngcc
var glc_coll = ee.ImageCollection('users/cgmorton/GlobeLand30');
var glc_img = ee.Image(glc_coll.mosaic());
var masked = glc_img.neq(10)
  .and(glc_img.neq(60))
  .and(glc_img.neq(80))
  .and(glc_img.neq(100))
  .and(glc_img.neq(255));

// Grazing capacity map produced in external script
var grazingCapacity = ee.Image('users/zandersamuel/Consult_CSA/grazingCapacity_srnAfrica_LSU_ha');
grazingCapacity = grazingCapacity.rename('grazingCap');
grazingCapacity = grazingCapacity.updateMask(masked).unmask(0);

// Fire frequency from external script
// divide by 18 (years) to get average annual burn frequency
var fireFreq = ee.Image('users/zandersamuel/Consult_CSA/fire_freq_SrnAfrica_200m').divide(18)
fireFreq = fireFreq.unmask(0);

// Importing and processing Soil Organic Carbon (SOC) data for South Africa
// data for SA from https://www.sciencedirect.com/science/article/pii/S0048969721004526
var socCol = ee.ImageCollection("users/grazingresearch/Collaboration/Soil_C/predictions2");

// Get SOC trend
socCol = socCol.map(function(i){
  i = i.divide(ee.Image(1000)).copyProperties(i)
  var year = ee.Number(i.get('year'))
  return ee.Image(year).int().addBands(i).set('year', year)
});

// Calculating the trend of SOC over time
var trendSensImg = socCol.reduce({reducer: ee.Reducer.sensSlope()});
trendSensImg = trendSensImg.rename(['scale', 'offset']);
var SOCltTrend = trendSensImg.select('scale').multiply(35).rename('SOCltTrend');

// Calculate mean SOC for South Africa
var ltMean = socCol.select(1).median().rename('SOC');

// Additional SOC data from iSDA dataset for rest of Africa
// Convert to SOC stocks using bulk density, fraction coarse fragments
var isda = ee.Image("users/zandersamuel/Africa_misc/iSDA_SOC_m_30m_0_20cm_2001_2017_v0_13_wgs84");
isda = ee.Image(ee.Image(isda.divide(10)).exp()).subtract(1)

// Soil bulk density (fine earth) in g/m3
var bd = ee.Image("users/zandersamuel/SA_misc/SoilGrids_BD").rename('soil_bd').selfMask()
  .divide(100);
var bd2 = ee.Image("ISDASOIL/Africa/v1/bulk_density").select('mean_0_20').rename('soil_bd')
  .divide(100);
bd =  ee.ImageCollection([ bd2.float(),bd.float()]).mosaic();

// Coarse fragment fraction 0-1 - mosaicing SoilGrids data with ISDA data because of data gaps in ISDA
var cfvo = ee.Image('users/zandersamuel/SA_misc/Soilgrids_CFVO').selfMask().rename('soil_cfvo')
  .divide(1000);
var cfvo2 = ee.Image("ISDASOIL/Africa/v1/stone_content").select('mean_0_20').rename('soil_cfvo')
  .divide(100);
cfvo =  ee.ImageCollection([ cfvo2.float(),cfvo.float()]).mosaic();

// Calculate SOC
isda = isda.multiply(bd)
  .multiply(ee.Image(1).subtract(cfvo))
  .multiply(0.6).rename('SOC');

// Calculating mean SOC from Venter et al. and iSDA datasets
var SOCltMean = ee.ImageCollection([isda.float(), ltMean.float()]).mean();
SOCltMean = SOCltMean.rename('SOCltMean');

// Combining all layers for analysis and renaming for clarity
var combined = ee.Image.cat(eviBaseline, ndviBaseline, bg, t, g, grazingCapacity, fireFreq, SOCltMean, SOCltTrend)    
combined = combined.select(['EVI', 'NDVI', 'bare-coverfraction', 'tree-coverfraction', 'grass-coverfraction', 'grazingCap', 'fireFreq', 'SOCltMean', 'SOCltTrend'],
  ['EVI', 'NDVI', 'Bare ground %', 'Woody cover %', 'Grass cover %','Grazing capacity LSU/ha', 'Fires/yr', 'SOC kg/m2', 'SOC change kg/m2']);

// Reducing regions to extract mean values per polygon
var reduced = combined.reduceRegions(communities, ee.Reducer.mean(), 100);
reduced = reduced.distinct(['Name', 'Area ha'])
print(reduced.limit(10))

// Exporting the results to an Earth Engine Asset
Export.table.toAsset({
  collection: reduced,
  description: 'Baseline_pre_export_' +dateLabel,
  assetId: 'Consult_CSA/Baseline_pre_export_' +dateLabel
})
