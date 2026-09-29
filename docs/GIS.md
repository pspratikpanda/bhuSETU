# GIS plan

The current Leaflet map renders fictional GeoJSON parcels around the Khunti area. The polygons and layers are illustrative and must not be used for boundary, title or field decisions.

Future integration should define authoritative geometry sources, CRS and precision; store parcels in PostGIS with spatial indexes; validate topology and parcel adjacency; and expose access-controlled GeoJSON or vector layers. Document map tile attribution and terms. Agricultural/residential/commercial/government layers, disputed parcels, flood-risk layers and reviewed encroachment indicators should carry source, date, confidence and review state. Imagery comparison is future work and does not itself establish a legal boundary or encroachment.
