/**
 * Code for the Rangeland Explorer web app
 * Contains the following sections: 
 * 1. Define initializing constants
 * 2. Define UI (user interface) elements
 * 3. Define global functions
 * 4. Build UI elements and initialize app
 */

// #############################################################################
// ### DEFINE INITIALIZING CONSTANTS ###
// #############################################################################

// Geometries defining project extents - can hover mouse over and change to import records at top of script
var geometry = 
    /* color: #d63000 */
    /* shown: false */
    ee.Geometry.Polygon(
        [[[31.23125396489256, -22.2108383566201],
          [31.23125396489256, -24.229971486534726],
          [33.42302642583006, -24.229971486534726],
          [33.42302642583006, -22.2108383566201]]], null, false),
    geometry2 = 
    /* color: #98ff00 */
    /* shown: false */
    ee.Geometry.MultiPolygon(
        [[[[28.33378423367544, -30.249456381789305],
           [28.33378423367544, -30.897391153446016],
           [29.23466313992544, -30.897391153446016],
           [29.23466313992544, -30.249456381789305]]],
         [[[28.7890869564936, -32.05624939716554],
           [28.7890869564936, -32.208593381736804],
           [28.883844036571723, -32.208593381736804],
           [28.883844036571723, -32.05624939716554]]]], null, false),
    geometry3 = 
    /* color: #0b4a8b */
    /* shown: false */
    ee.Geometry.Polygon(
        [[[20.95024748677959, -17.842248671588656],
          [20.95024748677959, -21.094178276654002],
          [25.190970143029585, -21.094178276654002],
          [25.190970143029585, -17.842248671588656]]], null, false),
    geometry4 = 
    /* color: #ffc82d */
    /* shown: false */
    ee.Geometry.Polygon(
        [[[29.187987374711472, -22.788392235251568],
          [29.187987374711472, -23.137384763111807],
          [29.970763253617722, -23.137384763111807],
          [29.970763253617722, -22.788392235251568]]], null, false),
    geometry5 = 
    /* color: #00ffff */
    /* shown: false */
    ee.Geometry.Polygon(
        [[[31.2569524356448, -24.525712407318565],
          [31.2569524356448, -24.745411382234263],
          [31.52337089267605, -24.745411382234263],
          [31.52337089267605, -24.525712407318565]]], null, false),
    geometry6 = 
    /* color: #bf04c2 */
    /* shown: false */
    ee.Geometry.Polygon(
        [[[28.690026287829856, -21.346586704704198],
          [28.690026287829856, -22.47286905403228],
          [29.947960858142356, -22.47286905403228],
          [29.947960858142356, -21.346586704704198]]], null, false),
    geometry7 = 
    /* color: #ff0000 */
    /* shown: false */
    ee.Geometry.Polygon(
        [[[17.449015007575344, -28.89105074204393],
          [17.449015007575344, -30.513248612037206],
          [18.294962273200344, -30.513248612037206],
          [18.294962273200344, -28.89105074204393]]], null, false),
    geometry8 = 
    /* color: #00ff00 */
    /* shown: false */
    ee.Geometry.Polygon(
        [[[28.266480385610254, -28.243949117596102],
          [28.266480385610254, -31.550492042788992],
          [31.309693276235254, -31.550492042788992],
          [31.309693276235254, -28.243949117596102]]], null, false),
    geometry9 = 
    /* color: #d63000 */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[32.08297498295084, -22.215135255355992],
          [32.08297498295084, -23.43024891314733],
          [33.47823865482584, -23.43024891314733],
          [33.47823865482584, -22.215135255355992]]], null, false);

// Visualization palettes
var ndvi_palette = ['FFFFFF, CE7E45, DF923D, F1B555, FCD163, 99B718, 74A901, 66A000, 529400, 3E8601, 207401, 056201, 004C00, 023B01, 012E01, 011D01, 011301'];
var woody_palette = ['#D7191C', '#FDAE61','#FFFFC0', '#A6D96A', '#1A9641'];
var ndvi_palette = ['FFFFFF', 'CE7E45', 'DF923D', 'F1B555', 'FCD163', '99B718', '74A901', '66A000', '529400', '3E8601', '207401', '056201', '004C00', '023B01', '012E01', '011D01', '011301'];
var bareGround_palette = [ "#FFFFCC","#FFEDA0", "#FED976", "#FEB24C", "#FD8D3C", "#FC4E2A", "#E31A1C", "#B10026"];
var grass_palette = ["#FFFFD9", "#EDF8B1", "#C7E9B4", "#7FCDBB", "#41B6C4", "#1D91C0", "#225EA8", "#0C2C84"]
var tree_palette = ["#FFFFE5", "#F7FCB9", "#D9F0A3", "#ADDD8E", "#78C679", "#41AB5D", "#238443" ,"#005A32"]
var grazCap_palette = '440154,472878,3E4A89,31688E,25838E,1E9E89,35B779,6CCE59,B5DE2C,FDE725';
var fire_palette = ['#fff600', '#ff9d00', '#ff0000', '#ff07cd'];
var soc_palette = ['#fffcb9', '#fcd27d', '#b6bb5c', '#498939', '#0f747b', '#045375', '#3c0f73'];
var soc_trend_palette = ["#B35806", "#E08214", "#FDB863", "#FEE0B6", "#D8DAEB", "#B2ABD2", "#8073AC", "#542788"]

// Feature collection styles
var communitiesStyle = {color: '000000', fillColor: '00000000', width:2};
var HIGHLIGHT_STYLE = {color: 'ff0000', fillColor: '00000000', width:3};

// Get date information
var presentMonth = ee.Date(Date.now()).get('month').getInfo();
var presentYear = ee.Date(Date.now()).get('year').getInfo();

// Set Sentinel-2 masking parameters and bands
var sceneCloudThreshold = 50;
var cloudMaskProbability = 30;
var S2_BANDS = ['QA60', 'B1','B2','B3','B4', 'B5', 'B6', 'B7','B8','B11','B12']; // Sentinel bands
var S2_NAMES = ['QA60','cb', 'blue', 'green', 'red', 'R1', 'R2', 'R3','nir','swir1', 'swir2']; // Common names
var selectBands = ['blue', 'green', 'red', 'R2','nir','swir1', 'ndvi', 'nbr', 'evi'];

// Initialize app variables
var mapListening = false;
var selectedGeos = ee.FeatureCollection([]);

// Get countries for clipping images to
var names = ['SOUTH AFRICA','LESOTHO','SWAZILAND','NAMIBIA','ZIMBABWE','BOTSWANA','MOZAMBIQUE']
var countries = ee.FeatureCollection('USDOS/LSIB/2013').filter(ee.Filter.inList('name', names));

// Cropland and urban mask
var glc_coll = ee.ImageCollection('users/cgmorton/GlobeLand30');
var glc_img = ee.Image(glc_coll.mosaic());
var masked = glc_img.neq(10)
  .and(glc_img.neq(60))
  .and(glc_img.neq(80))
  .and(glc_img.neq(100))
  .and(glc_img.neq(255));

// Import master shapefile database (feature collection) with project areas
var communities = ee.FeatureCollection('users/zandersamuel/Consult_CSA/CSA_master_20231008');
communities = communities.map(function(ft){return ft.set('area', ft.geometry().area().divide(ee.Number(10000)))});
communities = communities.select(['Name','Project', 'area']);

// Make map layers
var communitiesLayer = ui.Map.Layer(communities.style(communitiesStyle), {}, 'Communities');
var dummyLayer = ui.Map.Layer(ee.FeatureCollection([]), {}, 'dummy');

// Get pre-exported baseline statistics for project areas
var baselineTable = ee.FeatureCollection('users/zandersamuel/Consult_CSA/Baseline_pre_export_20231008');

// Get pre-exported time series statistics for project areas
var temporalTable = ee.FeatureCollection('users/zandersamuel/Consult_CSA/Temporal_pre_export_20231008');
// format table correctluy
temporalTable = temporalTable.select(['Name','ndvi','evi','bare', 'year','month'], 
  ['Name','NDVI','EVI','Bare ground','year','month'])
temporalTable = temporalTable.map(function(ft){
  var date = ee.Date.parse('yyyy-mm-dd', ee.String(ft.get('year')).cat(ee.String('-01-01'))).advance(ee.Number(ft.get('month')), 'months')
  return ft.set('date', date.millis())
});

// Get annual aggregates
var temporalTableYr = temporalTable.reduceColumns({
    selectors: ['NDVI', 'EVI', 'Bare ground', 'Name', 'year'],
    reducer: ee.Reducer.mean().repeat(3).group({
      groupField: 3,
      groupName: 'Name',
    }).group({
      groupField: 4,
      groupName: 'year',
    })
});
temporalTableYr = ee.List(temporalTableYr.get('groups')).map(function(g){
  var subGroup = ee.List(ee.Dictionary(g).get('groups'));
  var year = ee.Dictionary(g).get('year');
  subGroup = subGroup.map(function(i){
    var means = ee.List(ee.Dictionary(i).get('mean'));
    var Name = ee.Dictionary(i).get('Name');
    
    return ee.Feature(null, {"Name":Name, "year":year, "NDVI":means.get(0), "EVI":means.get(1), "Bare ground":means.get(2)})
  })
  return subGroup
}).flatten();
temporalTableYr = ee.FeatureCollection(temporalTableYr);
temporalTableYr = temporalTableYr.map(function(ft){
  var date = ee.Date.parse('yyyy-mm-dd', ee.String(ft.get('year')).cat(ee.String('-01-01')));
  return ft.set('date', date.millis())
});
temporalTableYr= temporalTableYr.sort('Name').sort('date')

// Import training data for running on-the-fly bare/grass/tree cover fractions on near real-time imagery
var trainingTestingMaster = ee.FeatureCollection('users/zandersamuel/Consult_CSA/Training_data_TOA_bg_t_g')

// Define project area/landscape dictionary - these will allow user to zoom to the CSA landscape
var landscapeSelect = '';
var landscapesDict = {
  'Limpopo NP': geometry,
  'UCPP': geometry2,
  'Ngamiland': geometry3,
  'Soutpansberg': geometry4,
  'K2C': geometry5,
  'Mapungubwe TFCA': geometry6,
  'Namakwa': geometry7,
  'Drakensberg Sub-Escarpment': geometry8,
  'Bahine NP': geometry9
};

// Get MODIS vegetation data
var modisVeg = ee.ImageCollection("MODIS/006/MOD13Q1")
  .filterDate('2016-01-01', '2020-01-01')
  .select(['NDVI', 'EVI'])
  .map(function(i){ return i.divide(10000)});
var eviBaseline = modisVeg.select('EVI').median().clipToCollection(countries);
var ndviBaseline = modisVeg.select('NDVI').median().clipToCollection(countries);

// Get fractional ground cover from CGLS
var cglsCol = ee.ImageCollection("COPERNICUS/Landcover/100m/Proba-V-C3/Global")
  .select(['bare-coverfraction','crops-coverfraction', 'urban-coverfraction','shrub-coverfraction', 'grass-coverfraction','tree-coverfraction'])
  .filterBounds(countries);
cglsCol = cglsCol.map(function(i){
  var bg = i.select('bare-coverfraction').add(i.select('urban-coverfraction'));
  var t = i.select('tree-coverfraction').add(i.select('shrub-coverfraction'));
  var g = i.select('grass-coverfraction');
  return bg.rename(['bg']).addBands(t.rename(['t'])).addBands(g.rename(['g']))
    .copyProperties(i)
    .set('year', ee.Number.parse(i.get('system:index')))
})
var cgls = cglsCol.median();
var bg = cgls.select('bg').clipToCollection(countries);
var t = cgls.select('t').clipToCollection(countries);
var g = cgls.select('g').clipToCollection(countries);

// Import pre-exported grazing capacity map
var grazingCapacity = ee.Image('users/zandersamuel/Consult_CSA/grazingCapacity_srnAfrica_LSU_ha');
grazingCapacity = grazingCapacity.rename('grazingCap');
grazingCapacity = grazingCapacity.updateMask(masked).unmask(0).clipToCollection(countries);

// Import pre-exported fire frequency map
var fireFreq = ee.Image('users/zandersamuel/Consult_CSA/fire_freq_SrnAfrica_200m').divide(18)
fireFreq = fireFreq.clipToCollection(countries);

// Import soil organic carbon data from Venter et al 2021 
// https://www.sciencedirect.com/science/article/pii/S0048969721004526
var socCol = ee.ImageCollection("users/grazingresearch/Collaboration/Soil_C/predictions2");
socCol = socCol.map(function(i){
  i = i.divide(ee.Image(1000)).copyProperties(i)
  var year = ee.Number(i.get('year'))
  return ee.Image(year).int().addBands(i).set('year', year)
});

// SOC mean
var ltMean = socCol
  //.filterMetadata('year','greater_than', 2000)
  .select(1).median().rename('SOC');

// SOC trend
var trendSensImg = socCol.reduce({reducer: ee.Reducer.sensSlope()});
trendSensImg = trendSensImg.rename(['scale', 'offset']);
var SOCltTrend = trendSensImg.select('scale').multiply(35).clipToCollection(countries);

// Additional SOC data from iSDA dataset for rest of Africa
// Convert to SOC stocks using bulk density, fraction coarse fragments
// Fill in gaps with SoilGrids
var isda = ee.Image("users/zandersamuel/Africa_misc/iSDA_SOC_m_30m_0_20cm_2001_2017_v0_13_wgs84");
isda = ee.Image(ee.Image(isda.divide(10)).exp()).subtract(1)

  // Soil bulk density (fine earth) g / m3
var bd = ee.Image("users/zandersamuel/SA_misc/SoilGrids_BD").rename('soil_bd').selfMask()
  .divide(100);
var bd2 = ee.Image("ISDASOIL/Africa/v1/bulk_density").select('mean_0_20').rename('soil_bd')
  .divide(100);
bd =  ee.ImageCollection([ bd2.float(),bd.float()]).mosaic();

  // Coast fragment fraction 0-1
var cfvo = ee.Image('users/zandersamuel/SA_misc/Soilgrids_CFVO').selfMask().rename('soil_cfvo')
  .divide(1000);
var cfvo2 = ee.Image("ISDASOIL/Africa/v1/stone_content").select('mean_0_20').rename('soil_cfvo')
  .divide(100);
cfvo =  ee.ImageCollection([ cfvo2.float(),cfvo.float()]).mosaic();
  
isda = isda.multiply(bd)
  .multiply(ee.Image(1).subtract(cfvo))
  .multiply(0.6).rename('SOC');

// Get mean SOC from Venter et al and iSDA
var SOCltMean = ee.ImageCollection([isda.float(), ltMean.float()]).mean();
SOCltMean = SOCltMean.clipToCollection(countries);
 

// #############################################################################
// ### DEFINE UI ELEMENTS ###
// #############################################################################

// Style.
var PANEL_WIDTH_1 = '320px';
var PANEL_WIDTH_2 = '220px';
var textFont = {fontSize: '12px'};
var titleFont = {fontSize: '20px', fontWeight: 'bold'};
var headerFont = {fontSize: '13px', fontWeight: 'bold', margin: '4px 8px 0px 8px'};
var sectionFont = {fontSize: '16px', color: '#808080', margin: '16px 8px 0px 8px'};
var sectionFont2 = {fontSize: '13px', color: '#d13328', margin: '16px 8px 0px 8px'};
var infoFont = {fontSize: '11px', color: '#505050'};
var instrucFont = {fontSize: '13px', color: '#505050'};
var instrucFontRed = {fontSize: '13px', color: '#d13328'};

//// Master panel ---------------------------------------------------------------------
// Control panel.
var controlPanel = ui.Panel({
  layout: ui.Panel.Layout.Flow('vertical'),
  style: {position: 'top-left', maxHeight: '350px'}
});

// About panel.
var aboutPanelShown = false;
var aboutPanel = ui.Panel(
  {style: {shown: aboutPanelShown, margin: '0px -4px 0px -4px', width: PANEL_WIDTH_2}});

// Layers panel.
var layersPanelShown = false;
var layersPanel = ui.Panel(
  {style: {shown: layersPanelShown, margin: '0px -4px 0px -4px'}});

// Analysis panel.
var analysisPanelShown = false;
var analysisPanel = ui.Panel(
  {style: {shown: analysisPanelShown, margin: '0px -4px 0px -4px'}});

// Show/hide about panel button.
var aboutButton = ui.Button(
  {label: 'About ❯', style: {margin: '0px 4px 0px 0px'}});

// Show/hide layers panel button.
var layersButton = ui.Button(
  {label: 'Layers ❯', style: {margin: '0px 4px 0px 0px'}});
  
// Show/hide layers panel button.
var analysisButton = ui.Button(
  {label: 'Analysis ❯', style: {margin: '0px 0px 0px 0px'}});
  
// Info/control button panel.
var buttonPanelControl = ui.Panel(
  [aboutButton, layersButton, analysisButton],
  ui.Panel.Layout.Flow('horizontal'),
  {stretch: 'horizontal', margin: '0px 0px 0px 0px'});

// Control sub-panel labels
var title = ui.Label('Rangeland Explorer', titleFont)
var aboutLabel = ui.Label('About', sectionFont);
aboutLabel.style().set('margin', '12px 8px 2px 8px');
var layersLabel = ui.Label('Layers', sectionFont);
layersLabel.style().set('margin', '12px 8px 2px 8px');
var analysisLabel = ui.Label('Analysis', sectionFont);
analysisLabel.style().set('margin', '12px 8px 2px 8px');

//// About panel ---------------------------------------------------------------------

// Information text
var aboutText = ui.Label(
  'This is a decision-support tool for rangeland stewards and conservaiton ' +
  'managers in southern Africa that are affiliated with Meat Naturally.' ,
  infoFont);

var appCodeLink = ui.Label({
  value: 'Technical docs and user guide',
  style: {fontSize: '11px', color: '#505050', margin: '-4px 8px 0px 8px'}, 
  targetUrl: 'https://docs.google.com/document/d/1SH5SA3-B16bUPLsp0CH86R9I2EN59oJf7eSeWnpLWnk/edit?usp=sharing'
});

//// Layers panel ---------------------------------------------------------------------
// baseline layers panel.
var b_layersPanelShown = false;
var b_layersPanel = ui.Panel(
  {style: {shown: b_layersPanelShown, margin: '0px 4px 0px 4px'}});

// nrt layers panel.
var nrt_layersPanelShown = false;
var nrt_layersPanel = ui.Panel(
  {style: {shown: nrt_layersPanelShown, margin: '0px 4px 0px 4px'}});

var nrt_layersPanelSub = ui.Panel(
  {style: { margin: '0px 4px 0px 4px'}});

var b_layersButton = ui.Button(
  {label: 'Baseline ❯', style: {margin: '0px 4px 0px 0px'}});

var nrt_layersButton = ui.Button(
  {label: 'Near real-time ❯', style: {margin: '0px 0px 0px 0px'}});

var selectLandscapePan = ui.Panel({layout: ui.Panel.Layout.Flow('horizontal')});
var land_text = ui.Label('Zoom to landscape:  ', instrucFont);
land_text.style().set('margin', '7px 0px 0px 0px');
var land_selector = ui.Select({
  items: ['Select a value...'].concat(Object.keys(landscapesDict)),
  value: 'Select a value...',
  onChange: handleLandscapeSelectZoom,
  style:{'margin': '1px 1px 1px 1px'}
});
selectLandscapePan.add(land_text).add(land_selector);


var b_layersLabel = ui.Label('Baseline', sectionFont);
b_layersLabel.style().set('margin', '12px 8px 2px 8px');
var nrt_layersLabel = ui.Label('Near real-time', sectionFont);
nrt_layersLabel.style().set('margin', '12px 8px 2px 8px');

var nrt_layersLabel_date = ui.Label('Average for past 30 days ', sectionFont2)
nrt_layersLabel_date.style().set('margin', '2px 8px 2px 8px');

var buttonPanelLayers = ui.Panel(
  [b_layersButton, nrt_layersButton],
  ui.Panel.Layout.Flow('horizontal'),
  {stretch: 'horizontal', margin: '0px 0px 0px 0px'});

// Checkboxes to turn layers on and off in map
var checkboxes = [
  ui.Checkbox("EVI 2015-2020",false, handleLayers, false),
  ui.Checkbox("NDVI 2015-2020",false, handleLayers, false),
  ui.Checkbox("Bare ground cover 2015-2020",false, handleLayers, false),
  ui.Checkbox("Grass cover 2015-2020",false, handleLayers, false),
  ui.Checkbox("Woody plant cover 2015-2020",false, handleLayers, false),
  ui.Checkbox("Grazing capacity 2015-2020",false, handleLayers, false),
  ui.Checkbox("Fire frequency 2000-2020",false, handleLayers, false),
  ui.Checkbox("Soil carbon 1984-2019",false, handleLayers, false),
  ui.Checkbox("Soil carbon change 1984-2019",false, handleLayers, false),
  
  ui.Checkbox("EVI",false, handleLayers, false),
  ui.Checkbox("NDVI",false, handleLayers, false),
  ui.Checkbox("Bare ground cover",false, handleLayers, false),
  ];

// Lookup table for layers that display through checkboxes
var checkboxesLookup = [
  {
    layer: eviBaseline,
    visParams: {min:0, max:1, palette: ndvi_palette, opacity: 0.8},
    legTitle: 'EVI',
    displayed: false,
    type: 'baseline'
  },
  {
    layer: ndviBaseline,
    visParams: {min:0, max:1, palette: ndvi_palette, opacity: 0.8},
    legTitle: 'NDVI',
    displayed: false,
    type: 'baseline'
  },
  {
    layer: bg,
    visParams: {min:0, max:60, palette: bareGround_palette, opacity: 0.8},
    legTitle: 'Bare ground cover (%)',
    displayed: false,
    type: 'baseline'
  },
  {
    layer: g,
    visParams: {min:0, max:60, palette: grass_palette, opacity: 0.7},
    legTitle: 'Grass cover (%)',
    displayed: false,
    type: 'baseline'
  },
  {
    layer: t,
    visParams: {min:0, max:60, palette: tree_palette, opacity: 0.7},
    legTitle: 'Woody plant cover (%)',
    displayed: false,
    type: 'baseline'
  },
  {
    layer: grazingCapacity,
    visParams: {min:0, max:0.3, palette: grazCap_palette, opacity: 0.7},
    legTitle: 'Grazing capacity (LSU/ha)',
    displayed: false,
    type: 'baseline'
  },
  {
    layer: fireFreq,
    visParams: {min:0, max:1, palette: fire_palette, opacity: 0.7},
    legTitle: 'Fire frequency (fires/yr)',
    displayed: false,
    type: 'baseline'
  },
  {
    layer: SOCltMean,
    visParams: {min:2, max:15, palette: soc_palette, opacity: 0.7},
    legTitle: 'Soil organic carbon (kg/m2)',
    displayed: false,
    type: 'baseline'
  },
  {
    layer: SOCltTrend,
    visParams: {min:-0.5, max:0.5, palette: soc_trend_palette, opacity: 0.7},
    legTitle: 'Soil organic carbon change (kg/m2)',
    displayed: false,
    type: 'baseline'
  },
  
  {
    layer: 'EVI',
    visParams: {min:0, max:1, palette: ndvi_palette, opacity: 0.7},
    legTitle: 'EVI',
    displayed: false,
    type: 'NRT'
  },
  {
    layer: 'NDVI',
    visParams: {min:0, max:1, palette: ndvi_palette, opacity: 0.7},
    legTitle: 'NDVI',
    displayed: false,
    type: 'NRT'
  },
  {
    layer: 'BG',
    visParams: {min:0, max:100, palette: bareGround_palette, opacity: 0.7},
    legTitle: 'Bare ground cover (%)',
    displayed: false,
    type: 'NRT'
  }
];

// Dictionary with names for map layers and their ee.Image() objects
var spatialLayerDict = {
  'EVI': eviBaseline,
  'NDVI': ndviBaseline,
  'Bare ground': bg,
  'Grass cover': g,
  'Woody cover': t,
  'Grazing capacity': grazingCapacity,
  'Soil carbon': SOCltMean,
  'Soil carbon change': SOCltTrend
};

//// Analysis panels ----------------------------------------------------------------------

// Empty dictionary that will be populated with analysis parameters from user
var analysisDict = {
  landscape: '',
  analysisType: '',
  variable: '',
  t_resolution: '',
  
  Temporal: {
     Annual: {
      ref: '',
      test: ''
    },
    Quarterly: {
      ref: '',
      test: ''
    }
  },
  Spatial: {
    Annual: '',
    Quarterly: ''
  }
};

// Dictionary converting quarter strings to start months
var quarterDict = {
  '01': 1,
  '02':4,
  '03':7,
  '04':10
}

// Drawing widget initialization
var drawWarning = ui.Label({value: 'Area too big - smaller please',style: {color: 'ff0000', margin: '13px 1px 1px 8px'}});
var drawPanel = ui.Panel();
var toolsPanel = ui.Panel({layout:  ui.Panel.Layout.Flow("horizontal")})
var stopDrawingButton = ui.Button('Finish drawing', stopDrawing)

// Create drawing buttons
var ToggleButton = function(labels, func, tools) {
  var index = 0, l = labels.length;
  var button = ui.Button(labels[index]);
  var toggle = function() {
    var i = index;
    this.setLabel(labels[++index % l]);
    func(labels[i % l], i % l);
  }.bind(button);
  button.toggle = toggle;
  button.onClick(toggle);
  return button;
};

var drawButton = ToggleButton(['Draw', 'Cancel'], function(label) {
  if (label == 'Cancel') {
    geomLayer.geometries().reset([]);
    toolsPanel.widgets().reset([drawButton]);
    tools.stop();
    drawPanel.remove(selectInstruction);
    map.layers().reset([communitiesLayer]);
    mapListening = false;
    legendPanel.style().set('shown', false);
  } else {
    toolsPanel.widgets().reset([drawButton, stopDrawingButton]);
    geomLayer.geometries().reset();
    tools.draw();
  }
});
toolsPanel.widgets().reset([drawButton])
drawPanel.widgets().reset([toolsPanel])

// Reset the analysis button
var resetAnalaysisButton = ui.Button('Reset form', handleResetAnalysis);

// Sequential steps for quiding the user through running the analysis
var step1_panel = ui.Panel({layout: ui.Panel.Layout.Flow('horizontal')});
var step1_text = ui.Label('1) Select landscape:  ', instrucFont);
step1_text.style().set('margin', '7px 0px 0px 0px');
var step1_selector = ui.Select({
  items: ['Select a value...'].concat(Object.keys(landscapesDict)),
  value: 'Select a value...',
  onChange: handleLandscapeSelect,
  style:{'margin': '1px 1px 1px 1px'}
});
step1_panel.add(step1_text).add(step1_selector);

var step2_panel = ui.Panel({layout: ui.Panel.Layout.Flow('horizontal')});
var step2_text = ui.Label('2) Select analysis type: ', instrucFont);
step2_text.style().set('margin', '7px 0px 0px 0px');
var step2_selector = ui.Select({
  items: ['Select a value...','Baseline', 'Temporal', 'Spatial'],
  value: 'Select a value...',
  onChange: handleAnalysisTypeSelect,
  style:{'margin': '1px 1px 1px 1px'}
});
step2_panel.add(step2_text).add(step2_selector);

var step3_panel = ui.Panel({layout: ui.Panel.Layout.Flow('horizontal')});
var step3_text = ui.Label('3) Select temporal resolution: ', instrucFont);
step3_text.style().set('margin', '7px 0px 0px 0px');
var step3_selector = ui.Select({
  items: ['Select a value...', 'Annual', 'Quarterly'],
  value: 'Select a value...',
  onChange: handleResolutionSelect,
  style:{'margin': '1px 1px 1px 1px'}
});
step3_panel.add(step3_text).add(step3_selector);

var s_step3_panel = ui.Panel({layout: ui.Panel.Layout.Flow('horizontal')});
var s_step3_text = ui.Label('3) Select variable: ', instrucFont);
s_step3_text.style().set('margin', '7px 0px 0px 0px');
var s_step3_selector = ui.Select({
  items: ['Select a value...', 'EVI', 'NDVI',  'Bare ground', 'Woody cover', 'Grass cover', 'Grazing capacity', 'Soil carbon', 'Soil carbon change'],
  value: 'Select a value...',
  onChange: s_handleVarSelect,
  style:{'margin': '1px 1px 1px 1px'}
});
s_step3_panel.add(s_step3_text).add(s_step3_selector);

var t_step4_panel = ui.Panel({layout: ui.Panel.Layout.Flow('horizontal')});
var t_step4_text = ui.Label('4) Select variable: ', instrucFont);
t_step4_text.style().set('margin', '7px 0px 0px 0px');
var t_step4_selector = ui.Select({
  items: ['Select a value...', 'EVI', 'NDVI', 'Bare ground'],
  value: 'Select a value...',
  onChange: t_handleVarSelect,
  style:{'margin': '1px 1px 1px 1px'}
});
t_step4_panel.add(t_step4_text).add(t_step4_selector);


var step5_panel = ui.Panel({layout: ui.Panel.Layout.Flow('horizontal')});
var step5_text = ui.Label('5) Select reference period: ', instrucFont);
step5_text.style().set('margin', '7px 0px 0px 0px');
var year_step5_selector = ui.Select({
  items: ['Select a value...','2017', '2018', '2019', '2020', '2021', '2022', '2023'],
  value: 'Select a value...',
  onChange: handleDateSelectYear,
  style:{'margin': '1px 1px 1px 1px'}
});
var quarter_step5_selector = ui.Select({
  items: ['Select quarter...', '01', '02', '03', '04'],
  onChange: handleDateSelectQuarter,
  value: 'Select quarter...',
  style:{'margin': '1px 1px 1px 1px'}
});
step5_panel.add(step5_text).add(year_step5_selector);

var step5b_panel = ui.Panel({layout: ui.Panel.Layout.Flow('horizontal')});
var step5b_text = ui.Label('Select comparison period: ', instrucFont);
step5b_text.style().set('margin', '7px 0px 0px 0px');
var year_step5b_selector = ui.Select({
  items: ['Select a value...', '2017', '2018', '2019', '2020', '2021', '2022', '2023'],
  value: 'Select a value...',
  onChange: handleDateSelectYearb,
  style:{'margin': '1px 1px 1px 1px'}
});
var quarter_step5b_selector = ui.Select({
  items: ['Select quarter...', '01', '02', '03', '04'],
  value: 'Select quarter...',
  onChange: handleDateSelectQuarterb,
  style:{'margin': '1px 1px 1px 1px'}
});
step5b_panel.add(step5b_text).add(year_step5b_selector);

//// Statistics panel ---------------------------------------------------------------------
var statsPanel = ui.Panel({
  layout: ui.Panel.Layout.Flow('vertical'),
  style: {
    position: 'top-right',
    maxHeight: '350px',
    width: '350px',
    shown: false
  }});

var tablePanel = ui.Panel(
  {style: {margin: '2px 2px 2px 2px'}});

var statLabel = ui.Label('Statistics', sectionFont);

var statLoadText = ui.Label('Loading statistics...', {shown: false})

var selectInstruction = ui.Label('Click polygons on the map', instrucFontRed)
var drawingInstruction_1 = ui.Label('Draw a reference area', instrucFontRed)

//// Legend panel ---------------------------------------------------------------------
var legendPanel = ui.Panel({style: {position: 'bottom-center', shown:false}});

// #############################################################################
// ### DEFINE GLOBAL FUNCTIONS ###
// #############################################################################
var createLegend = function(title, minVal, maxVal, minLab, maxLab, palette) { 
  var geometry = ee.Geometry.Polygon(
          [[[-54, -4.05],
            [-53, -4.05],
            [-53, -4.00],
            [-54, -4.00]]]);
  
  var latlong = ee.Image.pixelLonLat();
  
  var legend = ui.Panel({
      style: {
          position: 'bottom-right',
          margin: '-4px -4px -4px -4px'
      }
  });
  
  // layer 1
  var obj = {
      "title": ui.Label({
          "value": title,
          "style": {
              "fontSize": '12px',
              "margin": '3px 0px 0px 3px',
          }
      }),
      "bar": ui.Thumbnail({
          "image": latlong.clip(geometry).visualize({
              "bands": ['longitude'],
              "min": -54,
              "max": -53,
              "palette": palette
          }),
          "params": {
              "region": geometry.toGeoJSON(),
              "format": 'png'
          },
          "style": {
              "height": '20px',
              "width": '150px',
              "margin": '0px 0 0 8px',
              "border": '1px solid gray'
          }
      }),
      "panel1": ui.Panel({
          "layout": ui.Panel.Layout.flow('horizontal'),
      }),
      "panel2": ui.Panel({
          "layout": ui.Panel.Layout.flow('horizontal'),
      }),
      "minAxis": ui.Label({
          "value": minVal,
          "style": {
              "margin": '0 0 0 4px',
              "fontSize": '10px'
          }
      }),
      "maxAxis": ui.Label({
          "value": maxVal,
          "style": {
              "margin": '0 0 0 140px',
              "fontSize": '10px'
          }
      }),
      "minLabel": ui.Label({
          "value": minLab,
          "style": {
              "margin": '0 0 0 6px',
              "fontSize": '10px'
          }
      }),
      "maxLabel": ui.Label({
          "value": maxLab,
          "style": {
              "margin": '0 0 0 100px',
              "fontSize": '10px'
          }
      })
  };
  
  /**
   *
   */
  var legendAddLayer = function(legend, layer) {
  
      legend.add(layer.title);
      layer.panel1.add(layer.minAxis);
      layer.panel1.add(layer.maxAxis);
      //layer.panel2.add(layer.minLabel);
      //layer.panel2.add(layer.maxLabel);
      legend.add(layer.panel1);
      legend.add(layer.bar);
      legend.add(layer.panel2);
  
      return legend;
  };
  
  return legendAddLayer(legend, obj);
  
};

var quarterlyMedians = function(collection,dateStart, unit, step, reducer) {
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
};

// Check to see if month is in correct quarter
function quarterCheck(month){
  if (month < 4){
    return 1
  } else if (month >= 4 & month < 7){
    return 4
  } else if (month >= 7 & month < 10){
    return 7
  } else {
    return 10
  }
}

// Produce error if incorrect quarter
function checkQuarterError(year, quarter){
  if (year != String(presentYear)){
    return false
  }
  if (quarterCheck(quarterDict[quarter]) <= quarterCheck(presentMonth)){
    return false
  }
  return true
}

// Function to add spectral indices to Sentinel images
var addIndices = function(image) {
  var evi =   image.expression(
    '2.5 * ((NIR - RED) / (NIR + (2.4 * RED) + 1000))', {
      'NIR': image.select('nir'),
      'RED': image.select('red')
  }).rename('evi')
  // Add vegetation indices
  var ndvi = image.normalizedDifference(['nir', 'red']).rename('ndvi');
  var nbr = image.normalizedDifference(['nir', 'swir2']).rename("nbr");
  return image.addBands(ndvi).addBands(nbr).addBands(evi);
};

// Mask clouds for S2 imagery
var maskClouds = function(cloudProbabilityThreshold){
  return function(_img) {
  var cloudMask = _img.select('probability').lt(cloudProbabilityThreshold);
  return _img.updateMask(cloudMask);
}};

// Get S2 masked collection
function getS2cloudMasked(aoi, startDate, endDate) { 
  var csPlus = ee.ImageCollection('GOOGLE/CLOUD_SCORE_PLUS/V1/S2_HARMONIZED');
  
  var s2 = ee.ImageCollection("COPERNICUS/" + 'S2_HARMONIZED')
    .filterBounds(aoi)
      .filterDate(startDate, endDate)
      .filterMetadata('CLOUDY_PIXEL_PERCENTAGE', 'less_than', 40);
  
  s2 = s2.linkCollection(csPlus, ['cs_cdf'])
    .map(function(img) {
      return img.updateMask(img.select('cs_cdf').gte(0.6));
    })
    
  s2 = s2.select(S2_BANDS, S2_NAMES).map(addIndices);
  
  return s2.select(selectBands)
}

function getNRTsentinel(aoi, months){
  var col = getS2cloudMasked(aoi, '2022-06-01', '2025-01-01');
  var nowDt = ee.Date(Date.now());
  var nrtImg = col.filter(ee.Filter.date(nowDt.advance(months*-1, 'months'), nowDt)).median();
  //var nrtImg = col.median()
  return nrtImg
}

function getSentQuarterly(aoi){
  var sentinel2 = getS2cloudMasked(aoi, '2021-01-01', '2025-01-01');
  var sentQuarterly = quarterlyMedians(sentinel2,'2021-01-01', 'month', 3, ee.Reducer.median());
  sentQuarterly = sentQuarterly.map(function(i){return i.rename(selectBands)})
  return sentQuarterly
}

function trainBGT(aoi){
  var trainingTesting = trainingTestingMaster.filterBounds(aoi)
  
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

function getLatestStats(geo, communitiesSelect){
  var col = getSentQuarterly(communitiesSelect);
  var classifier = trainBGT(geo);
  
  var feats = col.map(function(i){
    var bg = classifyBGT(i, classifier).select('bare')
    var img = i.select(['evi', 'ndvi']).addBands(bg);
    
    var reduced = img.reduceRegions({
      collection: communitiesSelect, 
      reducer: ee.Reducer.mean(), 
      scale: 120,
      tileScale: 4
    });
    
    reduced = reduced.map(function(ft){
      return ft.set('year', i.get('year'), 'month', i.get('month'))
    })
    
    return reduced
  }).flatten()
  return feats
}

// Master panel ---------------------------------------------------------------
function aboutButtonHandler() {
  if(aboutPanelShown) {
    aboutPanelShown = false;
    aboutPanel.style().set('shown', false);
    aboutButton.setLabel('About ❯');
  } else {
    aboutPanelShown = true;
    
    layersButton.setLabel('Layers ❯');
    layersPanel.style().set('shown', false);
    layersPanelShown = false;
    analysisButton.setLabel('Analysis ❯');
    analysisPanel.style().set('shown', false);
    analysisPanelShown = false;
    
    aboutPanel.style().set('shown', true);
    aboutButton.setLabel('About ❮');
  }
}

function layersButtonHandler() {
  if(layersPanelShown) {
    layersPanelShown = false;
    layersPanel.style().set('shown', false);
    layersButton.setLabel('Layers ❯');
  } else {
    layersPanelShown = true;
    
    aboutButton.setLabel('About ❯');
    aboutPanel.style().set('shown', false);
    aboutPanelShown = false;
    analysisButton.setLabel('Analysis ❯');
    analysisPanel.style().set('shown', false);
    analysisPanelShown = false;
    
    layersPanel.style().set('shown', true);
    layersButton.setLabel('Layers ❮');
  }
}

function analysisButtonHandler() {
  if(analysisPanelShown) {
    analysisPanelShown = false;
    analysisPanel.style().set('shown', false);
    analysisButton.setLabel('Analysis ❯');
  } else {
    analysisPanelShown = true;
    
    aboutButton.setLabel('About ❯');
    aboutPanel.style().set('shown', false);
    aboutPanelShown = false;
    layersButton.setLabel('Layers ❯');
    layersPanel.style().set('shown', false);
    layersPanelShown = false;
    
    analysisPanel.style().set('shown', true);
    analysisButton.setLabel('Analysis ❮');
  }
}

// Analysis panel ---------------------------------------------------------------

// Reset analysis panel
function handleResetAnalysis(){
  statsPanel.style().set('shown', false);
  tablePanel.widgets().reset([]);
  selectedGeos = ee.FeatureCollection([]);
  drawPanel.widgets().reset([toolsPanel]);
  mapListening = false;
  drawPanel.remove(selectInstruction);
  map.layers().reset([communitiesLayer]);
  legendPanel.style().set('shown', false);
  
  step1_selector.setDisabled(false)
  step1_selector.setValue('Select a value...',false);
  step2_selector.setDisabled(false);
  step2_selector.setValue('Select a value...',false);
  step3_selector.setDisabled(false);
  step3_selector.setValue('Select a value...',false);
  s_step3_selector.setDisabled(false);
  s_step3_selector.setValue('Select a value...',false);
  t_step4_selector.setDisabled(false);
  t_step4_selector.setValue('Select a value...',false);
  year_step5_selector.setDisabled(false);
  year_step5_selector.setValue('Select a value...',false);
  year_step5b_selector.setDisabled(false);
  year_step5b_selector.setValue('Select a value...',false);
  quarter_step5_selector.setDisabled(false);
  quarter_step5_selector.setValue('Select quarter...',false);
  quarter_step5b_selector.setDisabled(false);
  quarter_step5b_selector.setValue('Select quarter...',false);
  
  
  step5_panel.clear().add(step5_text).add(year_step5_selector);
  step5b_panel.clear().add(step5b_text).add(year_step5b_selector);
  
  analysisPanel.widgets().reset([analysisLabel, step1_panel])
}

function handleLandscapeSelect(landscape){
  analysisDict.landscape = landscape;
  handleLandscapeSelectZoomAnalysis(landscape)
  analysisPanel.add(step2_panel);
  step1_selector.setDisabled(true);
}

function handleAnalysisTypeSelect(analysisType){
  analysisDict.analysisType = analysisType;
  step2_selector.setDisabled(true);
  if (analysisType == "Baseline"){
    activateSelectMode();
    analysisPanel.add(resetAnalaysisButton);
    return
  } else if (analysisType == "Spatial"){
    analysisPanel.add(s_step3_panel);
    return
  }
  analysisPanel.add(step3_panel);
}

// Stop drawing widget
function stopDrawing(){
  tools.stop();
  checkGeom(geomLayer.toGeometry());
}

// Group of functions to handle analysis panel selectors
function handleResolutionSelect(res){
  analysisDict.t_resolution = res;
  analysisPanel.add(t_step4_panel);
  step3_selector.setDisabled(true);
}

function t_handleVarSelect(variable){
  analysisDict.variable = variable;
  analysisPanel.add(step5_panel);
  t_step4_selector.setDisabled(true);
}
function s_handleVarSelect(variable){
  analysisDict.variable = variable;
  analysisPanel.add(drawingInstruction_1);
  analysisPanel.add(drawPanel);
  analysisPanel.add(resetAnalaysisButton);
  s_step3_selector.setDisabled(true);
}

function handleDateSelectYear(year){
  year_step5_selector.setDisabled(true);
  
  if (analysisDict.analysisType == 'Temporal'){
    analysisDict['Temporal']['Annual']['ref'] = year;
  } else {
    analysisDict['Spatial']['Annual'] = year;
  }
  
  if (analysisDict.t_resolution == 'Quarterly'){
    step5_panel.add(quarter_step5_selector)
  } else {
    if (analysisDict.analysisType == 'Temporal'){
      analysisPanel.add(step5b_panel);
    } else {
      activateSelectMode();
      analysisPanel.add(resetAnalaysisButton);
    } 
  }
}

function handleDateSelectQuarter(quart){
  if (analysisDict.analysisType == 'Temporal'){
    analysisDict['Temporal']['Quarterly']['ref'] = quart;
    analysisPanel.add(step5b_panel);
  } else {
    analysisDict['Spatial']['Quarterly'] = quart;
    print('To be continued....')
    //activateSelectMode();
    analysisPanel.add(resetAnalaysisButton);
  }
  quarter_step5_selector.setDisabled(true);
}

function handleDateSelectYearb(year){
  year_step5b_selector.setDisabled(true);
  analysisDict['Temporal']['Annual']['test'] = year;
  if (analysisDict.t_resolution == 'Quarterly'){
    step5b_panel.add(quarter_step5b_selector)
  } else {
    activateSelectMode();
    analysisPanel.add(resetAnalaysisButton);
  }
}

function handleDateSelectQuarterb(quart){
  quarter_step5b_selector.setDisabled(true);
  analysisDict['Temporal']['Quarterly']['test'] = quart;
  activateSelectMode();
  analysisPanel.add(resetAnalaysisButton);
}


function activateSelectMode(){
  print(analysisDict)
  if (analysisDict.analysisType != "Baseline"){
    if (analysisDict.t_resolution == "Quarterly"){
      var refCheck = checkQuarterError(analysisDict.Temporal.Annual.ref, analysisDict.Temporal.Quarterly.ref);
      var testCheck = checkQuarterError(analysisDict.Temporal.Annual.test, analysisDict.Temporal.Quarterly.test);
      if (refCheck | testCheck){
        analysisPanel.add(ui.Label('Year-quarter is out or range. Please Reset Form and select valid quarter.', instrucFontRed))
        return
      }
    } else {
      if (analysisDict.Temporal.Annual.ref == "2023" | analysisDict.Temporal.Annual.test == "2023" ){
        analysisPanel.add(ui.Label('Data for ' + String(presentYear) + ' is incomplete. Please Reset Form and select valid year', instrucFontRed))
        return
      }
    } 
    
  }
  mapListening = true;
  analysisPanel.add(selectInstruction)
}

// Check the size of a geometry and throw error if too large 
// Not want to run into memory limits
function checkGeom(geometry){
  print('in checkGeom')
  
  // Check if geometry is too big
  var area = geometry.area();
  area.evaluate(function(val){
    if (val > 500000000){
      geomLayer.geometries().reset();
      toolsPanel.widgets().reset([drawButton]);
      drawPanel.widgets().set(1, drawWarning);
    } else {
      drawPanel.widgets().reset([toolsPanel])
      getGeomStats(geometry);
      toolsPanel.widgets().reset([drawButton]);
    }
  });
}

// Get statistics for a user-drawn geometry
var relDiff = null;
function getGeomStats(geometry){
  print('getting stats...')
  
  mapListening = true;
  drawPanel.add(selectInstruction)
  
  print(analysisDict.variable)
  var imgSelect = spatialLayerDict[analysisDict.variable];
  imgSelect = imgSelect.rename('val');
  var geoManual = geomLayer.toGeometry();
  
  var red = imgSelect.reduceRegion({
    reducer: ee.Reducer.mean(),
    scale: 60,
    geometry: geoManual,
    bestEffort: true
  });
  var mean = ee.Number(red.get('val'))
  print(mean)
  
  relDiff = imgSelect.subtract(ee.Image(mean)).divide(ee.Image(mean)).multiply(ee.Image(100));
  var relDiffToMap = ui.Map.Layer(relDiff, {min:-25, max:25, palette:['#f9837b','#fffcb9','#fffcb9','#32c2c8'], opacity:0.7}, '% difference')
  map.layers().reset([relDiffToMap,communitiesLayer]);
  
  var legend =  createLegend('% difference in '+ String(analysisDict.variable), -25,25, 'less', 'more', ['#f9837b','#fffcb9','#fffcb9','#32c2c8'])
  legendPanel.clear()
  legendPanel.style().set('shown', true);
  legendPanel.add(legend);
  
}


// Layers panel -----------------------------------------------------------------

// Handle layers button
function b_layersButtonHandler() {
  if(b_layersPanelShown) {
    b_layersPanelShown = false;
    b_layersPanel.style().set('shown', false);
    b_layersButton.setLabel('Baseline ❯');
  } else {
    b_layersPanelShown = true;
    
    nrt_layersButton.setLabel('Near real-time ❯');
    nrt_layersPanel.style().set('shown', false);
    nrt_layersPanelShown = false;
    
    b_layersPanel.style().set('shown', true);
    b_layersButton.setLabel('Baseline ❮');
  }
}

// Handle near-realtime burron panel
function nrt_layersButtonHandler() {
  if(nrt_layersPanelShown) {
    nrt_layersPanelShown = false;
    nrt_layersPanel.style().set('shown', false);
    nrt_layersButton.setLabel('Near real-time ❯');
  } else {
    nrt_layersPanelShown = true;
    
    b_layersButton.setLabel('Baseline ❯');
    b_layersPanel.style().set('shown', false);
    b_layersPanelShown = false;
    
    nrt_layersPanel.style().set('shown', true);
    nrt_layersButton.setLabel('Near real-time ❮');
  }
}

//  Center map on landscape of interest from drop-down menu
function handleLandscapeSelectZoom(landscape){
  nrt_layersPanelSub.clear();
  landscapeSelect = landscape;
  var selected = landscapesDict[landscape];
  map.centerObject(selected)
  nrt_layersPanelSub.add(checkboxes[9]).add(checkboxes[10]).add(checkboxes[11])
}

//  Center map on landscape of interest from drop-down menu
function handleLandscapeSelectZoomAnalysis(landscape){
  landscapeSelect = landscape;
  var selected = landscapesDict[landscape];
  map.centerObject(selected)
}

// Get a selected community/project
function getSelCom(){
  var selectedComms = communities.filterBounds(selectedGeos);
  return selectedComms
}

// Function to turn layers on or off in response to users interaction with checkboxes
function handleLayers(val, box){
  if (!val){
    map.layers().reset([communitiesLayer,dummyLayer, getSelCom().style(HIGHLIGHT_STYLE)]);
    legendPanel.clear()
    legendPanel.style().set('shown', false);
    return
  }
  var select = checkboxesLookup[checkboxes.indexOf(box)];
  var visParams = select['visParams']
  var legend =  createLegend(select['legTitle'], visParams['min'], visParams['max'], '', '', visParams['palette'])
  legendPanel.clear()
  legendPanel.style().set('shown', true);
  legendPanel.add(legend);
  var layer = select['layer'];
  
  map.layers().reset([]);
  
  if (select['type'] == 'baseline'){
    var toAdd = ui.Map.Layer(layer, visParams, '');
    map.layers().reset([toAdd,communitiesLayer,getSelCom().style(HIGHLIGHT_STYLE)]);
  } else {
    var aoi = landscapesDict[landscapeSelect];
    if (layer == 'EVI'){
      var toAdd = ui.Map.Layer(getNRTsentinel(aoi, 2).select('evi'), visParams, '');
    } else if (layer == 'NDVI'){
      var toAdd =  ui.Map.Layer(getNRTsentinel(aoi, 2).select('ndvi'), visParams, '');
    } else {
      var nrtImg = getNRTsentinel(aoi, 2)
      var classifier = trainBGT(aoi);
      var bg = classifyBGT(nrtImg, classifier).select('bare')
      var toAdd =  ui.Map.Layer(bg, visParams, '');
    }
    map.layers().reset([toAdd,communitiesLayer,getSelCom().style(HIGHLIGHT_STYLE)]);
  }
  
  
  select['displayed'] = val
  var len = checkboxesLookup.length
  for (var i = 0; i<len; i++){
    var selected = checkboxesLookup[i]
    if (selected != select){
      checkboxes[i].setValue(false, false)
      selected['displayed'] = false
    }
  }
  
}

// Main function to fetch statistics after user clicks map
function handleMapClick(location){
  if (!mapListening){
    return
  }
  var geo = ee.Geometry.Point([location.lon, location.lat])
  selectedGeos = selectedGeos.merge(ee.FeatureCollection([ee.Feature(geo)]));
  var selectNames = communities.filterBounds(selectedGeos)
    .distinct(['Name']).reduceColumns(ee.Reducer.toList(),['Name']);
    print(selectNames)
  selectNames = selectNames.get('list');
  
  
  if (analysisDict.analysisType == "Spatial"){
    
    var reduced = relDiff.reduceRegions({
      collection: communities.filterBounds(selectedGeos), 
      reducer: ee.Reducer.mean(), 
      scale: 60,
      tileScale: 4
    });
    
    var tableSpatial = ui.Chart.feature.byFeature(reduced, 'Name','mean');
    tableSpatial.setChartType('ColumnChart');
    tableSpatial.setOptions({title: '% difference to reference area'})
    tableSpatial.style().set({stretch: 'both', height:'200px'});
  }
  
  if (analysisDict.analysisType == "Baseline"){
    var select = baselineTable.filterBounds(selectedGeos);
    
    var table = ui.Chart.feature.byFeature(select, 'Name');
    table.setChartType('Table');
    table.setOptions({allowHtml: true, pageSize: 4});
    table.style().set({stretch: 'both', height:'200px'});
  }
  
  if (analysisDict.analysisType == "Temporal"){
    
    var res = analysisDict.t_resolution;
    var baselineYr = parseInt(analysisDict.Temporal['Annual']['ref']);
    var testYr = parseInt(analysisDict.Temporal['Annual']['test']);
    
    if (res == "Quarterly"){
      
      if (analysisDict.Temporal.Annual.ref == "2023" | analysisDict.Temporal.Annual.test == "2023"){
        var newStats = getLatestStats(landscapesDict[analysisDict.landscape], communities.filterBounds(selectedGeos));
        newStats = newStats.select(['Name','ndvi','evi','bare', 'year','month'], 
            ['Name','NDVI','EVI','Bare ground','year','month'])
        newStats = newStats.map(function(ft){
          var date = ee.Date.parse('yyyy-mm-dd', ee.String(ft.get('year')).cat(ee.String('-01-01'))).advance(ee.Number(ft.get('month')), 'months')
          return ft.set('date', date.millis())
        });
        temporalTable = temporalTable.merge(newStats)
        print('updated Temporal table', temporalTable)
      }
      
      var baselineQuart = quarterDict[analysisDict.Temporal['Quarterly']['ref']];
      var testQuart = quarterDict[analysisDict.Temporal['Quarterly']['test']];
      
      var toPlot = temporalTable
        .filter(ee.Filter.inList('Name',selectNames))
        .filter(ee.Filter.or(
            ee.Filter.and(ee.Filter.eq('year',baselineYr), ee.Filter.eq('month', baselineQuart)),
            ee.Filter.and(ee.Filter.eq('year',testYr), ee.Filter.eq('month', testQuart))));
    } else {
      var toPlot = temporalTableYr
        .filter(ee.Filter.inList('Name',selectNames))
        .filter(ee.Filter.inList('year', [baselineYr, testYr]));
    }
    toPlot= toPlot.sort('Name').sort('date');
    var table = ui.Chart.feature.groups(toPlot, 'date', analysisDict.variable, 'Name');
    table.setChartType('ColumnChart');
    table.setOptions({title: ''})
    table.style().set({stretch: 'both', height:'200px'});
    
    var toPlotTS = temporalTable.filter(ee.Filter.inList('Name',selectNames))
    toPlotTS= toPlotTS.sort('Name').sort('date');
    var tableTS = ui.Chart.feature.groups(toPlotTS, 'date', analysisDict.variable, 'Name');
    tableTS = tableTS.setOptions({
      title: '',
      trendlines: {0: {}, 1:{}, 2:{}, 3:{}}
    })
    
  }
  
  statsPanel.style().set('shown', true);
  tablePanel.widgets().reset([]);
  map.layers().set(2, ui.Map.Layer(getSelCom().style(HIGHLIGHT_STYLE), {}, 'selected'));
  
  if (analysisDict.analysisType == "Baseline"){
    tablePanel.add(table);
  } else if (analysisDict.analysisType == "Temporal") {
    tablePanel.add(table).add(tableTS);
  } else {
    tablePanel.add(ui.Label('Relative % difference in ' + String(analysisDict.variable) + ' between your reference area and selected camp/s:'))
    tablePanel.add(tableSpatial);
  }
  
}


// #############################################################################
// ### BUILD UI ELEMENTS AND INTIALIZE APP ###
// #############################################################################

//// Control panel -------------------------------------------------------------
controlPanel.add(title);
controlPanel.add(buttonPanelControl);
controlPanel.add(aboutPanel);
controlPanel.add(layersPanel);
controlPanel.add(analysisPanel);

aboutPanel.add(aboutLabel).add(aboutText).add(appCodeLink);
layersPanel.add(layersLabel).add(buttonPanelLayers).add(b_layersPanel).add(nrt_layersPanel);
analysisPanel.add(analysisLabel).add(step1_panel);

b_layersPanel.add(b_layersLabel)
  .add(checkboxes[0]).add(checkboxes[1])
  .add(checkboxes[2]).add(checkboxes[3])
  .add(checkboxes[4]).add(checkboxes[5])
  .add(checkboxes[6]).add(checkboxes[7]).add(checkboxes[8]);
nrt_layersPanel.add(nrt_layersLabel).add(nrt_layersLabel_date).add(selectLandscapePan).add(nrt_layersPanelSub);

aboutButton.onClick(aboutButtonHandler);
layersButton.onClick(layersButtonHandler);
analysisButton.onClick(analysisButtonHandler);

b_layersButton.onClick(b_layersButtonHandler);
nrt_layersButton.onClick(nrt_layersButtonHandler);

//// Stat panel -------------------------------------------------------------
statsPanel.add(statLabel).add(tablePanel)

//// Map setup ---------------------------------------------------------------

var map = ui.Map();

var tools = ui.Map.DrawingTools();
tools.setLinked(false);
var geomLayer = ui.Map.GeometryLayer();
tools.layers().add(geomLayer)
tools.setShown(false);
tools.setShape('polygon')
map.add(tools)

map.add(controlPanel).add(statsPanel).add(legendPanel);

map.centerObject(countries, 5);
map.style().set('cursor', 'crosshair');
map.setOptions('HYBRID');
map.setControlVisibility(
  {layerList: true, fullscreenControl: true, zoomControl: false});
map.layers().reset([communitiesLayer, dummyLayer]);

map.onClick(handleMapClick)

ui.root.clear();
ui.root.add(map)
