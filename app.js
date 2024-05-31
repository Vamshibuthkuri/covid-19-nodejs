const express = require('express')
const path = require('path')
const app = express()
app.use(express.json())

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const dbPath = path.join(__dirname, 'covid19India.db')
let db = null
const intilizeDatabaseAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () => {
      console.log(`Server Running at http://localhost:3000`)
    })
  } catch (e) {
    console.log(`Db Error ${e.message}`)
    process.exit(1)
  }
}

intilizeDatabaseAndServer()
//1)getting of all states
const convertDbObjectToResponseObject = dbObject => {
  return {
    stateId: dbObject.state_id,
    stateName: dbObject.state_name,
    population: dbObject.population,
  }
}
app.get('/staets/', async (request, response) => {
  const getStatesQuery = `
SELECT *
FROM state;`
  const playersArray = await db.all(getStatesQuery)
  response.send(
    playersArray.map(eachPlayer => convertDbObjectToResponseObject(eachPlayer)),
  )
})
//2)getofstatebasedonId
app.get('/states/:stateId/', async (request, response) => {
  const {stateId} = request.params
  const getStateQuery = `
select*
from state;
where state_id=${stateId}`
  const result = await db.get(getStateQuery)
  const {state_id, state_name, population} = result
  const dbResponse = {
    stateId: state_id,
    stateName: state_name,
    population: population,
  }
  response.send(dbResponse)
})
//3)postingofdistricts
app.get('/districts/', async (request, response) => {
  const getDetails = request.body
  const {districtId, districtName, stateId, cases, cured, active, deaths} =
    getDetails
  const addingQuery = `
 insert into district(district_id,district_name,state_id,cases,cured,active,deaths)
 values(${districtId},${districtName},${stateId},${cases},${cured},${active},${deaths})`
  const result = await db.run(addingQuery)
  response.send('District Successfully Added')
})
//4)gettingofdistrictbasedonid
app.get('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const getdistrictquery = `
  select*
  from district
  where district_id=${districtId}`
  const result = await db.get(getdistrictquery)
  const {district_id, district_name, state_id, cases, cured, active, deaths} =
    result
  const dbResponse = {
    districtId: district_id,
    districtName: district_name,
    stateId: state_id,
    cases: cases,
    cured: cured,
    active: active,
    deaths: deaths,
  }
  response.send(dbResponse)
  //5)deletingofdistricts
  app.delete('/districts/:districtId/', async (request, response) => {
    const {districtId} = request.params
    const deletingQuery = `
    select*
    from district
    where district_id=${districtId}`
    const result = await db.run(deletingQuery)
    response.send('District Removed')
  })
})
//6)putting of districts
app.put('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const getBody = request.body
  const {districtName, stateId, cases, cured, active, deaths} = getBody
  const puttingQuery = `
  update district
  set district_name=${districtName},
  state_id=${stateId},
  cases=${cases},
  cured=${cured},
  active=${active},
  deaths=${deaths}
  where district_id=${districtId}`
  const result = await db.run(puttingQuery)
  response.send('District Details Updated')
})
//7)gettingoftotalcases,cured,deathsofaspecificstate
app.get('/states/:stateId/stats/', async (request, response) => {
  const {stateId} = request.params
  const gettingStatesQuery = `
  select SUM(cases),SUM(cured),SUM(active),SUM(deaths)
  from state
  where state_id=${stateId}`
  const stats = await db.get(gettingStatesQuery)
  const dbResponse = {
    totalCases: stats['SUM(cases)'],
    totalCured: stats['SUM(cured)'],
    totalActive: stats['SUM(active)'],
    totalDeaths: stats['SUM(deaths)'],
  }
  response.send(dbResponse)
})
// 8)gettingofdistrict
app.get('/districts/:districtId/details/', async (request, response) => {
  const {districtId} = request.params
  const getDistrictIdQuery = `
select state_id from district
where district_id = ${districtId};`
  const getDistrictIdQueryResponse = await database.get(getDistrictIdQuery)

  const getStateNameQuery = `
select state_name as stateName from state
where state_id = ${getDistrictIdQueryResponse.state_id};`
  const getStateNameQueryResponse = await database.get(getStateNameQuery)
  response.send(getStateNameQueryResponse)
})
module.exports = app
