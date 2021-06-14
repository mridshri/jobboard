
var fetch = require('node-fetch');
var  redis = require("redis");

const client = redis.createClient();

const { promisify } = require("util");
//const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

const baseUrl = 'https://jobs.github.com/positions.json?';

async function fetchGithub(){

    let resCount = 1;
    let onPage = 1;
    const allJobs = [];

    //get all jobs
    while(resCount > 0) {
        const res = await fetch(`${baseUrl}page=${onPage}`);
        const jobs = await res.json();
        allJobs.push(...jobs);
        resCount = jobs.length
        console.log('got ' + resCount + '  jobs');
        onPage++;
    }

    console.log('got ' + allJobs.length + ' total jobs')

    //filter jobs
    const jrJobs = allJobs.filter(job => {
        const jobTitle = job.title.toLowerCase();

        if (
            jobTitle.includes("senior") ||
            jobTitle.includes("sr.") ||
            jobTitle.includes("manager") ||
            jobTitle.includes("architect")
        ) {
            return false;
        }
        return true;;

    });
    console.log(jrJobs.length);
    

    //set in redis
    const success = await setAsync('github', JSON.stringify(allJobs));
    console.log({success});
}

module.exports = fetchGithub();