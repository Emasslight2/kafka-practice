const express = require('express');
const typeorm = require('typeorm');
const Kafka = require('node-rdkafka');

const { Post } = require('./models/Post');

const PORT = process.env.PORT || 5001;

typeorm.createConnection({
    type: "postgres",
    host: "postgres",
    port: 5432,
    username: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    entities: [
        require("./entities/PostSchema")
    ]
}).then(connection => {
    const postRepository = connection.getRepository("Post");
    console.log("CONSUMER TO POSTGRES CONNECTION SUCCESS!!!");
    const app = express();

    var consumer = new Kafka.KafkaConsumer({
        'group.id': 'testconsumers',
        'metadata.broker.list': 'kafka:9092',
    }, {});
    
    consumer.connect();

    consumer.on('ready', () => {
        consumer.subscribe(['post']);
        // Read one message every 1000 milliseconds
        setInterval(function() {
            consumer.consume(1);
        }, 1000);
    }).on('data', (dataBuffer) => {
        console.log("MESSAGE:", dataBuffer.value.toString());
        const { type, data }= JSON.parse(dataBuffer.value);

        if (type === "CREATE_POST") {
            console.log("CREATION,", data)
            const post = new Post(data.title, data.text);
			postRepository.save(post).then(async (savedPost) => {
                console.log("Post has been saved:", savedPost);
                console.log("All posts:", await postRepository.find());
            });
        } else if (type === "DELETE_POST") {
            console.log("DELETION,", data)
        } else {
            console.log("NO SUCH PARTITION YET!!!")
        }
    });

    app.listen(PORT, () => {
        console.log(`Producer service is running on port ${PORT}`);
    });
}).catch(e => {
    console.error(`Error: ${e.message}`, e);
});
