const express = require('express');
const Kafka = require('node-rdkafka');
const bodyParser = require('body-parser');
console.log(Kafka.features);
console.log(Kafka.librdkafkaVersion);

const PORT = process.env.PORT || 5000;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));

const producer = new Kafka.Producer({
    'metadata.broker.list': 'kafka:9092'
});

producer.connect();

producer.on('ready', () => {
    app.get('/', (req, res, next) => {
        console.log("hello")
        return res.status(200).json({
            message: "Hello world"
        });
    });

    app.post('/create/:counter', (req, res, next) => {
        try {
            const counter = parseInt(req.params.counter);
            console.log(req.body);
            for(let i = 0; i < counter; i++) {
                producer.produce('post', null, Buffer.from(JSON.stringify({type: "CREATE_POST", data: req.body, counter: i})));
            }
           

            return res.status(200).json({
                message: "Your message is queued successfully"
            });
        } catch (error) {
            console.error(`error: ${error.message}`);
            return res.status(500).json({
                message: "Server error"
            });
        }

    });

    app.delete('/delete', (req, res, next) => {
        try {
            console.log(req.body);
            producer.produce('post', null, Buffer.from(JSON.stringify({type: "DELETE_POST", data: req.body})));

            return res.status(200).json({
                message: "Your message is queued successfully"
            });
        } catch (error) {
            console.error(`error: ${error.message}`);
            return res.status(500).json({
                message: "Server error"
            });
        }

    });

    app.listen(PORT, () => {
        console.log(`Producer service is running on port ${PORT}`);
    });
});

// Any errors we encounter, including connection errors
producer.on('event.error', function (err) {
    console.error('Error from producer');
    console.error(err);
});

producer.setPollInterval(100);

producer.on('disconnected', function (arg) {
    console.log('producer disconnected. ' + JSON.stringify(arg));
});