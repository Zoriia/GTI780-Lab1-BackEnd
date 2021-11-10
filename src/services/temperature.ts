import parse from 'csv-parse'
import path from 'path'
import fs from 'fs'
import _ from 'lodash'

const DATA_COLUMNS = [
  'Humidity',
  'Temperature',
  'Timestamp'
]

export interface TemperatureEntry {
  timestamp: Date
  temperature: number
}

export interface CsvEntry {  
  Humidity: number
  Temperature: number
  Timestamp: Date
}

export async function getCurrentTemperature(): Promise<any> {
  const allTemp = await parseCsv();

  if (allTemp.length === 0)
    throw new Error("Aucune température n'est disponible");

  return Object.values(allTemp.pop() || {timestamp: new Date(), temperature: 0})
}

export async function getTemperatureEntries(nbOfEntries: number): Promise<any[]> {
  const allTemp = await parseCsv();

  if (allTemp.length === 0)
    throw new Error("Aucune température n'est disponible");

  if (nbOfEntries > allTemp.length)
    return allTemp.map(o => Object.values(o))

  return allTemp.slice(allTemp.length - nbOfEntries).map(o => Object.values(o))
}

export async function getAverageTemperature(nbOfEntries: number): Promise<number> {
  const allTemp = await parseCsv();

  if (allTemp.length === 0)
    throw new Error("Aucune température n'est disponible");

  if (nbOfEntries >= allTemp.length) {
    const sum = allTemp.reduce((a, b) => a + b.temperature, 0)
    return sum / allTemp.length
  }
  
  const sum = allTemp.slice(allTemp.length - nbOfEntries).reduce((a, b) => a + b.temperature, 0)
  return sum / nbOfEntries   
}

async function parseCsv(): Promise<TemperatureEntry[]> {
  const filePath = path.resolve(__dirname, '..', '..', 'data', 'results.csv')
  const text = await readFile(filePath)

  return await new Promise(function (resolve, reject) {
    const parser = parse(text, {
      columns: DATA_COLUMNS,
      from_line: 2
    })

    const temperatures: TemperatureEntry[] = []

    parser.on('readable', function () {
      let record: CsvEntry
      while ((record = parser.read()) != null) {
        temperatures.push({
          timestamp: new Date(record.Timestamp),
          temperature: Number(record.Temperature)
        })
      }
    })

    parser.on('error', function (err) {
      reject(err)
    })

    parser.on('end', function () {
      resolve(temperatures)
    })
  })
}

async function readFile (path: string): Promise<string> {
  return await new Promise(function (resolve, reject) {
    fs.readFile(path, { encoding: 'utf-8' }, function (err, data) {
      if (err != null) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}