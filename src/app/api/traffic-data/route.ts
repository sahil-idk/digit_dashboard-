/* eslint-disable @typescript-eslint/no-explicit-any */
// route.ts
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { parse } from 'csv-parse/sync';
import path from 'path';

let currentIndex = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '1h';
    const dataType = searchParams.get('type') || 'both';
    
    // Read both CSV files
    const trafficFilePath = path.join(process.cwd(), 'public', '1.csv');
    const predictionFilePath = path.join(process.cwd(), 'public', 'prediction_results.csv');
    
    const trafficContent = await fs.readFile(trafficFilePath, 'utf-8');
    
    // Parse real-time traffic data
    const trafficRecords = parse(trafficContent, {
      columns: true,
      skip_empty_lines: true
    });

    // Calculate records to return based on range
    let numRecords = 12;
    switch (range) {
      case '3h': numRecords = 36; break;
      case '6h': numRecords = 72; break;
      case '12h': numRecords = 144; break;
    }

    // Get traffic slice
    let trafficSlice = trafficRecords.slice(currentIndex, currentIndex + numRecords);
    if (trafficSlice.length < numRecords) {
      currentIndex = 0;
      trafficSlice = trafficRecords.slice(currentIndex, currentIndex + numRecords);
    }

    // Increment current index
    currentIndex = (currentIndex + 1) % trafficRecords.length;

    // If only real-time data is requested
    if (dataType === 'realtime') {
      return NextResponse.json(trafficSlice);
    }

    // Try to read and parse prediction data
    let predictionRecords = [];
    try {
      const predictionContent = await fs.readFile(predictionFilePath, 'utf-8');
      predictionRecords = parse(predictionContent, {
        columns: false,
        skip_empty_lines: true
      }).map((row: any[]) => ({
        timestamp: row[0],
        predictedFlow: parseFloat(row[2]),
        actualFlow: parseFloat(row[3]),
        predictionTime: parseFloat(row[4]),
        globalTime: parseFloat(row[5])
      }));

      // Filter out any invalid entries
      predictionRecords = predictionRecords.filter((record: { predictedFlow: number; actualFlow: number; predictionTime: number; }) => 
        !isNaN(record.predictedFlow) && 
        !isNaN(record.actualFlow) &&
        !isNaN(record.predictionTime)
      );

    } catch (err) {
      console.warn('Prediction file not found or error parsing:', err);
      predictionRecords = [];
    }

    // If only prediction data is requested
    if (dataType === 'prediction') {
      return NextResponse.json({
        data: predictionRecords,
        lastUpdate: new Date().toISOString()
      });
    }

    // For both, return a combined response
    const combinedResponse = {
      traffic: trafficSlice,
      predictions: predictionRecords,
      lastUpdate: new Date().toISOString()
    };

    return NextResponse.json(combinedResponse);

  } catch (error) {
    console.error('Error reading data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}