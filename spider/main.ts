// import { parseArgs } from "jsr:@std/cli/parse-args";

// async function fetchAndProcess(list: string[]) {
//   try {
//     const responses = await Promise.all(
//       list.map(async (uri) => {
//         try {
//           const response = await fetch(uri);
//           return response;
//         } catch (error) {
//           console.error(`Error fetching ${uri}:`, error);
//           return null;
//         }
//       }),
//     );

//     for (const response of responses) {
//       if (!response) {
//         console.log("Response is null (likely due to a fetch error).");
//         continue;
//       }

//       console.log(response.status);

//       try {
//         const jsonData = await response.json();
//         console.log(jsonData);
//       } catch (jsonError) {
//         console.error(`Error parsing JSON from ${response.url}:`, jsonError);
//         try {
//           const textData = await response.text();
//           console.log("response text: ", textData);
//         } catch (textError) {
//           console.error("error getting response text", textError);
//         }
//       }
//     }
//   } catch (overallError) {
//     console.error("An error occurred:", overallError);
//   }
// }

// // const args = parseArgs(["--foo", "bar", "--foo", "baz"], {
// //   collect: ["foo"],
// //  });

// const args = parseArgs(Deno.args, {
//   string: ["url"],
//   collect: ["url"],
// });

// for (const url of args.url) {
//   console.log(`url: ${url}`)
// }

// // const urlList: string[] = [
// //   "https://raw.githubusercontent.com/microsoft/json-schemas/refs/heads/main/dotnet/target-framework-moniker.schema.json",
// //   "https://developer.microsoft.com/json-schemas/sp/site-design-script-actions.schema.json",
// //   "https://raw.githubusercontent.com/microsoft/json-schemas/refs/heads/main/rush/rush.schema.json",
// // ];


type AType = {
  name: string;
  value: number;
  properties: string[];
};

type BType = {
  values: number[];
};

type DU = AType | BType | string;

function isAType(input: DU): input is AType {
  return (
      typeof (input as AType).name === "string" &&
      typeof (input as AType).value === "number" &&
      Array.isArray((input as AType).properties) &&
      (input as AType).properties.every((prop) => typeof prop === "string")
  );
}

function isBType(input: DU): input is BType {
  return (
      Array.isArray((input as BType).values) &&
      (input as BType).values.every((val) => typeof val === "number")
  );
}

const tuple: DU[] = [
  { name: "User A", value: 10, properties: ["prop1"] },
  { values: [1, 2, 3] },
  { name: "User B", value: 20, properties: ["prop2", "prop3"] },
  { values: [4, 5] },
  "NotAUser"
];

function exhaustiveCheck(param: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(param)}`);
}

const extractValue = (input: DU): string => {
  if (isAType(input)) {
    return `AType - Name: ${input.name}`;
  } else if (isBType(input)) {
    return `BType - Values: ${input.values.join(", ")}`;
  } else if (typeof input === "string") {
    return `String - ${input}`;
  } else {
    return exhaustiveCheck(input); // Enforces handling of all DU types
  }
};

tuple.forEach((item) => console.log(extractValue(item)));
