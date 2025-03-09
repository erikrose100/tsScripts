
async function fetchAndProcess(list: string[]) {
  try {
    const responses = await Promise.all(
      list.map(async (uri) => {
        try {
          const response = await fetch(uri);
          return response;
        } catch (error) {
          console.error(`Error fetching ${uri}:`, error);
          return null;
        }
      }),
    );

    for (const response of responses) {
      if (!response) {
        console.log("Response is null (likely due to a fetch error).");
        continue;
      }

      console.log(response.status);

      try {
        const jsonData = await response.json();
        console.log(jsonData);
      } catch (jsonError) {
        console.error(`Error parsing JSON from ${response.url}:`, jsonError);
        try {
          const textData = await response.text();
          console.log("response text: ", textData);
        } catch (textError) {
          console.error("error getting response text", textError);
        }
      }
    }
  } catch (overallError) {
    console.error("An error occurred:", overallError);
  }
}

const urlList: string[] = [
  "https://raw.githubusercontent.com/microsoft/json-schemas/refs/heads/main/dotnet/target-framework-moniker.schema.json",
  "https://developer.microsoft.com/json-schemas/sp/site-design-script-actions.schema.json",
  "https://raw.githubusercontent.com/microsoft/json-schemas/refs/heads/main/rush/rush.schema.json",
];

fetchAndProcess(urlList);
