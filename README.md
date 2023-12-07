# rangeland-explorer
Google Earth Engine code to support the [rangeland explorer web app](https://zandersamuel.users.earthengine.app/view/mnp-rangeland-explorer). The documentation and details behind the methodology and data sources for the layers in the app can be found in this [Google Doc](https://docs.google.com/document/d/1SH5SA3-B16bUPLsp0CH86R9I2EN59oJf7eSeWnpLWnk/edit).

## Description of each script
1. 'app.js' - This is the master script coding the GEE web app. It depends on the inputs from all the other scripts in this repository.
2. 'make_fire_freq_map.js' - This pre-exports the fire frequency base map used in the app and to derive fire frequency statistics for project polygons.
3. 'make_grazing_capacity_map.js' - This pre-exports the grazing capacity map used in the app and to derive grazing capacity statistics for project polygons.
4. 'update_project_database.js' - This is used to add new shapefiles to the master app database of project areas/polygons. The FeatureCollection exported from this script is imported in script 1, 5 and 6.
5. 'update_baseline_stats.js' - This extracts the baseline layer means for all polygons in the master project database. The FeatureCollection exported from this script is imported in script 1.
6. 'update_timeseries_stats.js' - This extracts the temporal satellite data for the polygons in the master project database. The FeatureCollection exported from this script is imported in script 1.

## Updating the app with new shapefiles
When you need to incorporate a new shapefile into the app or update an exsisting shapefile, you need make changes to scripts 1, 4, 5, and 6. This is the workflow: 

- Upload the shapefile as a GEE Asset
- Run script 4 which will import the new GEE Asset and incorporate it into the master FeatureCollection for the app and save with the current date string as the export name suffix "CSA_master_*" where * could be 20231026 for example.
- Run script 5, but make sure to import the updated master FeatureCollection produced in the previous script. This will export a file with current date string as suffix "Baseline_pre_export_*"
- Run script 6 which will generate CSV exports to your Google Drive.
- Download the CSV files from Google Drive, import into R and merge with the R code snipped provided in-line in script 6.
- Upload the CSV file to GEE asset with file name with current date as suffix "Temporal_pre_export_"
- Update script 1 with the new FeatureCollection names for "CSA_master_*", "Baseline_pre_export_*", and "Temporal_pre_export_"
- Update the App with the current contents of the script


