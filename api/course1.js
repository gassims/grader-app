import {getEnv} from '@vercel/functions';


export function GET(request) {
  return new Response(JSON.stringify({message:'Please use the submit form!'}),{status:400,headers:{'Content-Type':'application/json'}});
}


export async function POST(request) {

const {API_USERNAME,API_PASSWORD,APIKEY,ORIGINS,COURSE1URL} = getEnv()
const username = process.env.API_USERNAME;
const password = process.env.API_PASSWORD;
const apiKey = process.env.APIKEY;
const { email,assignment } = await request.json();
const origin = request.headers.get('origin')
const whitelist = process.env.ORIGINS;
console.log("recieved request: ", origin)
// Check if the origin matches the allowed origin
if (whitelist == origin) {
try {
    //const externalApiUrl = process.env.externalApiUrl;
    const URL = process.env.COURSE1URL + `&username=${email}&assignment_id=${assignment}`;
    const authHeader = btoa(username + ":" + password);
    const externalApiResponse = await fetch(URL, {
      method: "GET",
      headers: {
        "Authorization": `Basic ${authHeader}`,
        "x-api-key": apiKey
      }
    });

    return new Response(externalApiResponse.body,{
      status: externalApiResponse.status, 
      headers: externalApiResponse.headers 
    });
  } catch (error) {
    return new Response(JSON.stringify({message:`An error occurred while processing the request. ${error}`}),{ status: 402, header: {'Content-type':'application/json'}});
  }
} else
      {
        return new Response(JSON.stringify({message:"Please visit academy.dhis2.org for more info!"}),{status:401,headers:{'Content-Type':'application/json'}})
      }
}