import { Queue, Worker, QueueEvents } from "bullmq";
import dotenv from "dotenv";


//queue
const queue = "testQueue";
//queue events
const queueEvents = new QueueEvents(queue);

//load env variables
dotenv.config();

//redis
const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = process.env;

const redisOptions = {
    redis: {
        host: REDIS_HOST,
        port: REDIS_PORT,
        //password: REDIS_PASSWORD
    }
};

const connection = {
    connection: redisOptions.redis,
}

//define a queue
const testQueue = new Queue(queue, connection);


//add job(s) to the queue
await testQueue.add('testJob', {
    subject: "Test data for the job",
    date: Date.now(),
});


//run a worker to process the incoming jobs
const myWorkder = new Worker(queue, async(job) => {
    console.log("------ PROCESSING JOB -------");
    console.log(job.name, job.data);
    //return data to the hook if needed
    return job.data.date;
}, {
    connection
});


//add hooks to the queue
queueEvents.on('completed', (job) => {
    console.log(`${job.jobId} has been completed, and returned ${job.returnvalue}`);
});


//used docker to run redis -> docker run --name redis -p 6379:6379 -d redis -> will connect using localhost:// insted of redis://