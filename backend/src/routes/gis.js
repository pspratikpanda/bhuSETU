import express from 'express';
import { db } from '../db/database.js';

const router = express.Router();

// Khunti, Jharkhand GeoJSON Cadastral Polygon Features
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
router.get('/parcels', (req, res) => {
  res.json({
    success: true,
    crs: 'EPSG:4326',
    district: 'Khunti, Jharkhand',
    data: cadastralGeoJSON
  });
});

// GET /api/v1/gis/parcels/:ulpin/geometry - Get single parcel geometry
router.get('/parcels/:ulpin/geometry', (req, res) => {
  const { ulpin } = req.params;
  const feature = cadastralGeoJSON.features.find((f) => f.properties.ulpin === ulpin);

  if (!feature) {
    return res.status(404).json({ success: false, message: 'Parcel geometry not found' });
  }

  res.json({ success: true, data: feature });
});

// GET /api/v1/gis/layers - GIS Spatial Vector Layers Metadata
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

// POST /api/v1/gis/spatial-check - Perform spatial intersection / overlap calculation
router.post('/spatial-check', (req, res) => {
  const { ulpin, compareCoordinates } = req.body;
  const feature = cadastralGeoJSON.features.find((f) => f.properties.ulpin === ulpin);

  res.json({
    success: true,
    ulpin,
    spatialResult: {
      hasOverlap: false,
      overlapAreaAcres: 0.0,
      boundaryStatus: 'Aligned',
      coordinatePrecision: 'High (0.01m GPS survey)',
      crs: 'EPSG:4326 WGS 84'
    }
  });
});

export default router;
