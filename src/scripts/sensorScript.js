var parse = require('csv-parse')
var path = require('path')
var fs = require('fs')
var spawn = require('child_process').spawn

const command = spawn('sudo', ['python3', 'humid.py']);

const DATA_COLUMNS = [
    'Humidity',
    'Temperature',
    'Timestamp'
]

command.stdout.on('data', async function (data) {
    const dataTable = (data + '').split(',')

    await pushNewData(dataTable)
})

command.stderr.on('data', function (data) {
    console.log('Une erreur s\'est produite. Erreur:' + data)
})

async function pushNewData(data) {
    const filePath = path.resolve(__dirname, '..', '..', 'data', 'results.csv')
    const text = await readFile(filePath)

    console.log('Push started')

    return await new Promise(function (resolve, reject) {
        const parser = parse(text, {
            columns: DATA_COLUMNS
        })
        const newData = []
        parser.on('readable', function () {
            console.log('Read started')
            let record
            while ((record = parser.read()) != null) {
                console.log('New record read')
                newData.push(record)
            }
        })

        parser.on('error', function (err) {
            reject(err)
        })
        
        const humidity = data[0]
        const temperature = data[1]
        parser.on('end', function () {
            console.log('Reading ended')
            if (newData.length > 30)
                newData.splice(1,1)
            const today = new Date()
            newData.push({humidity, temperature, today})
            console.log('New record added')
            const output = newData.join("\n")
            fs.writeFileSync('new.csv', output);
            console.log('New csv written')
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