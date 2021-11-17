var parse = require('csv-parse')
var path = require('path')
var fs = require('fs')
var spawn = require('child_process').spawn
var mqtt = require('mqtt')

const commandStartSensor = spawn('sudo', ['python3', 'src/scripts/humid.py'])
const commandStartLed = spawn('sudo', ['python3', 'src/scripts/rgb_alert.py'])
const client  = mqtt.connect('ws://localhost:9001')
client.on('connect', function () {
    console.log('Connecté au broker MQTT')
})

const DATA_COLUMNS = [
    'Humidity',
    'Temperature',
    'Timestamp'
]

commandStartSensor.stdout.on('data', async function (data) {
    const dataTable = (data + '').split(',')

    await pushNewData(dataTable)
})

commandStartSensor.stderr.on('data', function (data) {
    console.log('Une erreur s\'est produite. Erreur:' + data)
})

async function pushNewData(data) {
    const filePath = path.resolve(__dirname, '..' ,'..', 'data', 'results.csv')
    const text = await readFile(filePath)

    return await new Promise(function (resolve, reject) {
        const parser = parse(text, {
            columns: DATA_COLUMNS,
            from_line: 2
        })
        const newData = []
        parser.on('readable', function () {
            let record
            while ((record = parser.read()) != null) {
                const recordHum = record['Humidity']
                const recordTemp = record['Temperature']
                const recordTime = record['Timestamp']
                newData.push(recordHum + ',' + recordTemp + ',' + recordTime)
            }
        })

        parser.on('error', function (err) {
            reject(err)
        })
        
        const humidity = data[0]
        const temperature = data[1].replace(/(\r\n|\n|\r)/gm, '')
        parser.on('end', function () {
            client.publish('/gti780a2021/equipe09/temperature', temperature)
            client.publish('/gti780a2021/equipe09/humidite', humidity)
            if (newData.length >= 50)
                newData.splice(0,1)
            const today = new Date()
            const todayText = today.toLocaleString('en-US', { hour12: false }).replace(',','')
            console.log(humidity + ',' + temperature + ',' + todayText)
            newData.push(`${humidity},${temperature},${todayText}`)
            let output = newData.join("\n")
            output = 'Humidity,Temperature,Timestamp\n' + output
            fs.writeFileSync(path.resolve(__dirname, '..' ,'..', 'data', 'results.csv'), output);
            resolve()
        })
    })
}

async function readFile(path){
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


// Code found on https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}