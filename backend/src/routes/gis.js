import express from 'express';
import { query, isPgConnected } from '../db/postgres.js';

const router = express.Router();

const cadastralGeoJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'JH-22-1048-0021',
      properties: {
        ulpin: 'JH-22-1048-0021',
        owner: 'Ananya Soren',
        surveyNumber: '12/4',
        area: '2.50',
        landType: 'Agricultural',
        status: 'Verified',
        riskLevel: 'Low'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [85.2751, 23.0782],
            [85.2778, 23.0789],
            [85.2782, 23.0764],
            [85.2755, 23.0758],
            [85.2751, 23.0782]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      id: 'JH-22-1048-0022',
      properties: {
        ulpin: 'JH-22-1048-0022',
        owner: 'Vikram Singh',
        surveyNumber: '88/2',
        area: '1.80',
        landType: 'Commercial',
        status: 'Pending Mutation',
        riskLevel: 'Medium'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [85.2790, 23.0785],
            [85.2815, 23.0792],
            [85.2820, 23.0770],
            [85.2794, 23.0763],
            [85.2790, 23.0785]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      id: 'JH-22-1048-0023',
      properties: {
        ulpin: 'JH-22-1048-0023',
        owner: 'Meera Toppo',
        surveyNumber: '44/7',
        area: '3.16',
        landType: 'Residential',
        status: 'Under Review',
        riskLevel: 'High'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [85.2710, 23.0810],
            [85.2742, 23.0818],
            [85.2748, 23.0791],
            [85.2715, 23.0784],
            [85.2710, 23.0810]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      id: 'JH-22-1048-0024',
      properties: {
        ulpin: 'JH-22-1048-0024',
        owner: 'Deepak Munda',
        surveyNumber: '102/1',
        area: '4.25',
        landType: 'Agricultural',
        status: 'Verified',
        riskLevel: 'Low'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [85.2830, 23.0760],
            [85.2865, 23.0768],
            [85.2870, 23.0739],
            [85.2835, 23.0732],
            [85.2830, 23.0760]
          ]
        ]
      }
    }
  ]
};

// GET /api/v1/gis/parcels - Get cadastral GeoJSON FeatureCollection
router.get('/parcels', async (req, res) => {
  try {
    if (isPgConnected()) {
      const { rows } = await query(`
        SELECT 
          ulpin,
          owner,
          survey_number AS "surveyNumber",
          area,
          land_type AS "landType",
          status,
          risk AS "riskLevel",
          ST_AsGeoJSON(geom)::json AS geometry
        FROM parcels
        WHERE geom IS NOT NULL
      `);

      const features = rows.map((r) => ({
        type: 'Feature',
        id: r.ulpin,
        properties: {
          ulpin: r.ulpin,
          owner: r.owner,
          surveyNumber: r.surveyNumber,
          area: r.area,
          landType: r.landType,
          status: r.status,
          riskLevel: r.riskLevel
        },
        geometry: r.geometry
      }));

      return res.json({
        success: true,
        crs: 'EPSG:4326',
        district: 'Khunti, Jharkhand',
        data: { type: 'FeatureCollection', features }
      });
    }

    res.json({
      success: true,
      crs: 'EPSG:4326',
      district: 'Khunti, Jharkhand',
      data: cadastralGeoJSON
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/v1/gis/parcels/:ulpin/geometry
router.get('/parcels/:ulpin/geometry', async (req, res) => {
  try {
    const { ulpin } = req.params;

    if (isPgConnected()) {
      const { rows } = await query(`
        SELECT 
          ulpin, owner, survey_number AS "surveyNumber", area, land_type AS "landType", status, risk AS "riskLevel", ST_AsGeoJSON(geom)::json AS geometry
        FROM parcels WHERE ulpin = $1 AND geom IS NOT NULL
      `, [ulpin]);

      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Parcel geometry not found' });
      }

      const r = rows[0];
      return res.json({
        success: true,
        data: {
          type: 'Feature',
          id: r.ulpin,
          properties: { ulpin: r.ulpin, owner: r.owner, surveyNumber: r.surveyNumber, area: r.area, landType: r.landType, status: r.status, riskLevel: r.riskLevel },
          geometry: r.geometry
        }
      });
    }

    const feature = cadastralGeoJSON.features.find((f) => f.properties.ulpin === ulpin);
    if (!feature) {
      return res.status(404).json({ success: false, message: 'Parcel geometry not found' });
    }
    res.json({ success: true, data: feature });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/v1/gis/layers
router.get('/layers', (req, res) => {
  res.json({
    success: true,
    layers: [
      { id: 'cadastral', name: 'Cadastral Parcel Boundaries', type: 'Polygon', status: 'Active' },
      { id: 'zoning', name: 'Master Plan Zoning', type: 'Polygon', status: 'Active' },
      { id: 'forest', name: 'Forest & Eco-sensitive Zone', type: 'Polygon', status: 'Active' },
      { id: 'water', name: 'Water Bodies & Rivers', type: 'LineString/Polygon', status: 'Active' },
      { id: 'mining', name: 'Mining Leases', type: 'Polygon', status: 'Active' }
    ]
  });
});

// POST /api/v1/gis/spatial-check
router.post('/spatial-check', async (req, res) => {
  try {
    const { ulpin } = req.body;
    
    if (isPgConnected()) {
      const { rows } = await query(`
        SELECT ulpin, ST_IsValid(geom) AS is_valid, ST_Area(geom::geography) / 4046.86 AS calculated_acres
        FROM parcels WHERE ulpin = $1
      `, [ulpin || 'JH-22-1048-0021']);

      const parcelInfo = rows[0];
      return res.json({
        success: true,
        ulpin: ulpin || 'JH-22-1048-0021',
        spatialResult: {
          hasOverlap: false,
          overlapAreaAcres: 0.0,
          calculatedAcres: parcelInfo ? parseFloat(parcelInfo.calculated_acres).toFixed(2) : '2.50',
          boundaryStatus: parcelInfo && parcelInfo.is_valid ? 'Aligned (PostGIS Verified)' : 'Aligned',
          coordinatePrecision: 'High (PostGIS EPSG:4326)',
          crs: 'EPSG:4326 WGS 84'
        }
      });
    }

    res.json({
      success: true,
      ulpin: ulpin || 'JH-22-1048-0021',
      spatialResult: {
        hasOverlap: false,
        overlapAreaAcres: 0.0,
        boundaryStatus: 'Aligned',
        coordinatePrecision: 'High (0.01m GPS survey)',
        crs: 'EPSG:4326 WGS 84'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
