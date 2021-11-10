import parse from 'csv-parse'
import path from 'path'
import fs from 'fs'
import _ from 'lodash'

const DATA_COLUMNS = [
  'Humidity',
  'Temperature',
  'Timestamp'
]

export interface HumidityEntry {
  timestamp: Date
  humidity: number
}

export interface CsvEntry {  
  Humidity: number
  Temperature: number
  Timestamp: Date
}

export async function getCurrentHumidity(): Promise<any> {
  const allHum = await parseCsv();

  if (allHum.length === 0)
    throw new Error("Aucune humidité n'est disponible");

  return allHum.pop()?.humidity || 0
}

export async function getHumidityEntries(nbOfEntries: number): Promise<any[]> {
  const allHum = await parseCsv();

  if (allHum.length === 0)
    throw new Error("Aucune humidité n'est disponible");

  if (nbOfEntries >= allHum.length)
    return allHum.map(o => Object.values(o))

  return allHum.slice(allHum.length - nbOfEntries).map(o => Object.values(o))
}

export async function getAverageHumidity(nbOfEntries: number): Promise<number> {
  const allHum = await parseCsv();

  if (allHum.length === 0)
    throw new Error("Aucune humidité n'est disponible");

  if (nbOfEntries >= allHum.length) {
    const sum = allHum.reduce((a, b) => a + b.humidity, 0)
    return sum / allHum.length
  }
  
  const sum = allHum.slice(allHum.length - nbOfEntries).reduce((a, b) => a + b.humidity, 0)
  return sum / nbOfEntries   
}

async function parseCsv(): Promise<HumidityEntry[]> {
  const filePath = path.resolve(__dirname, '..', '..', 'data', 'results.csv')
  const text = await readFile(filePath)

  return await new Promise(function (resolve, reject) {
    const parser = parse(text, {
      columns: DATA_COLUMNS,
      from_line: 2
    })

    const humidities: HumidityEntry[] = []

    parser.on('readable', function () {
      let record: CsvEntry
      while ((record = parser.read()) != null) {
        humidities.push({
          timestamp: new Date(record.Timestamp),
          humidity: Number(record.Humidity)
        })
      }
    })

    parser.on('error', function (err) {
      reject(err)
    })

    parser.on('end', function () {
      resolve(humidities)
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