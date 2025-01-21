import { getEnv } from "@vercel/functions";

export async function POST(request) {
  const { EXTERNAL_API_URL, WHITELIST_ORIGINS } = getEnv();
  const { email, course, language } = await request.json();
  const origin = request.headers.get("origin");
  const whitelist = process.env.WHITELIST_ORIGINS
    ? process.env.WHITELIST_ORIGINS.split(",")
    : [];
  // Check if the origin matches the allowed origin
  if (
    (origin == "http://localhost:3001" ||
      whitelist.indexOf(origin) !== -1 ||
      whitelist.some((allowedOrigin) => origin.startsWith(allowedOrigin))) &&
    origin
  ) {
    const raw = JSON.stringify({
      email,
      course,
      language,
    });

    try {
      const externalApiUrl = process.env.EXTERNAL_API_URL;
      const externalApiResponse = await fetch(externalApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: raw,
      });

      const externalApiData = await externalApiResponse.json();
      console.log(externalApiData);
      return new Response(
        JSON.stringify({
          message: "Triaged and created support ticket!",
          externalApiResponse: externalApiData,
        }),
        { status: 200, header: { "Content-type": "application/json" } }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({
          message: `An error occurred while processing the request. ${error}`,
        }),
        { status: 402, header: { "Content-type": "application/json" } }
      );
    }
  } else {
    console.log("Rejected Origin:", origin);
    return new Response(
      JSON.stringify({
        message: "Please visit academy.dhis2.org for more info!",
      }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
}
