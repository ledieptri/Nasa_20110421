const fs = require('fs');
const path = require('path')
const { parse } = require("csv-parse");
const planets = require('./planet.mongo')


const habitablePlanets = [];

function isHabitablePlanet(planet) {
  return planet['koi_disposition'] === 'CONFIRMED'
    && planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11
    && planet['koi_prad'] < 1.6;
}

function loadPlanetsData(){
    return new Promise((resolve, rejects) =>{
        fs.createReadStream(path.join(__dirname, '..', '..', 'data','kepler_data.csv'))
      .pipe(parse({
        comment: '#',
        columns: true,
      }))
      .on('data', (data) => {
        if (isHabitablePlanet(data)) {
          habitablePlanets.push(data);
        }
      })
      .on('error', (err) => {
        console.log(err);
        rejects(err);
      })
      .on('end', async () => {
        const countPlanetsFound = (await getAllPlanets().length)
        console.log(habitablePlanets.map((planet) => {
          return planet['kepler_name'];
        }));
        console.log(`${habitablePlanets.length} habitable planets found!`);
        resolve();
      });
    }) 
}

async function getAllPlanets(){
  return await planets.find({},{
    'id':0,'__v':0
  })
}

async function savePlanet(planet){
  try{
    await planets.updateOne({
      keplerName: planet.kepler_name,
    },{
      keplerName: planet.kepler_name,
    },{
      upsert: true
    })
  }
  catch(error){
    console.log(error)
  }
}


module.exports = {
    loadPlanetsData,
    getAllPlanets,
}

