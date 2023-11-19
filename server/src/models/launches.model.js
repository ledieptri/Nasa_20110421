const launches = new Map();

let DEFALUT_FLIGHT_NUMBER = 100;

const launchesDatabase = require('./launches.mongo')
const axios =  require('axios')
const SPACEX_API_URL = 'https:/api.spacexdata.com/v4/launches/query'

async function populateLaunches(){
    console.log('Downloading launches data...')
    const response = await axios.post(SPACEX_API_URL, {
        query: {},
        options: {
            pagination: false,
            populate: [
                {
                    path: 'rocket',
                    select: {
                        name: 1
                    }
                },
                {
                    path: 'payloads',
                    select: {
                        'customer': 1
                    }
                }
                
            ]
            
        }
    })

    if (response.status !== 200){
        console.log('Problems downloading')
        throw new Error('Launch Data downloading failed')
    }

    const launchDocs = response.data.docs;
    for (const launchDoc of launchDocs){
        const payloads = launchDoc['payloads'];
        const customers = payloads.flatMap((payload) => {
            return payload['customers'];
        })
    }

    const launch = {
        flightNumber: launchDoc['flight_number'],
        mission: launchDoc['name'],
        rocket: launchDoc['rocket']['name'],
        launchDate: launchDoc['date_local'],
        upcoming: launchDoc['upcoming'],
        success: launchDoc['success'],
        customers,
      };
      
      console.log(`${launch.flightNumber} ${launch.mission}`);
      
      await saveLaunch(launch);
}

async function saveLaunch(launch){
    await launchesDatabase.findByIdAndUpdate({
        flightNumber: launch.flightNumber
    }, launche, {
        upsert: true
    })
}

async function loadLaunchData(){
    const firstLaunch = await findLaunch({
        flightNumber: 1,
        rocket: 'Falcon 1',
        misson: 'FalconSat'
    })
}

async function findLaunch(filter){
    return await launchesDatabase.findOne(filter)
}

async function existsLaunchWithId(launchId){
    return await findLaunch(
        {
            flightNumber: launchId,
        }
    );
}

async function getLatestFlightNumber(){
    const latestlaunch = await launchesDatabase
        .findOne()
        .sort('-flightNumber')
    if (!latestlaunch){
        return DEFALUT_FLIGHT_NUMBER
    }
    return latestlaunch.flightNumber;
}

async function getAllLaunches(skip, limit){
    return await launchesDatabase
    .find({}, {'id':0, '__v':0})
    .sort({flightNumber:1})
    .skip(skip)
    .limit(limit)
    
}

async function scheduleNewLaunch(){
    const planet = await planets.findOne({
        keplerName: launch.target,
    })

    if (!planet){
        throw new Error('No matching planet found')
    }

    const newFlightNmuber = await getLatestFlightNumber() + 1;

    const newLaunch = Object.assign(launch, {
        success:true,
        upcoming: true,
        customer: ['Zero to Mastery', 'NASA'],
        flightNumber: newFlightNmuber,
    })
    await saveLaunch(newLaunch)
}

async function abortLaunchById(launchId){
    const aborted = await launchesDatabase.updateOne({
        flightNumber: launchID,
    }, {
        upcoming: false,
        success: false,
    })
    return aborted.modifiedCount === 1 
}

module.exports = {
    existsLaunchWithId,
    getAllLaunches,
    loadLaunchData,
    scheduleNewLaunch,
    abortLaunchById,
}