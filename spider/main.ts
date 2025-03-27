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

// // fetchAndProcess(urlList);

type AType = {
  name: string;
  value: number;
  properties: string[];
};

type BType = {
  values: number[];
};

type DU = AType | BType;

type OutTupleResult<T> =
  | { type: "success"; value: T }
  | { type: "error"; message: string };

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

// Higher-order function to create a type-specific extractor
function createTupleValueExtractor<T extends DU, R>(
  typeGuard: (input: DU) => input is T,
  extractor: (input: T) => R
): (input: DU) => OutTupleResult<R> {
  return (input: DU) => {
      if (typeGuard(input)) {
          return { type: "success", value: extractor(input) };
      } else {
          return { type: "error", message: "Input does not match expected type." };
      }
  };
}

// Higher-order function to handle the OutTupleResult
function handleTupleResult<T>(
  result: OutTupleResult<T>,
  onSuccess: (value: T) => void,
  onError?: (message: string) => void
): void {
  if (result.type === "success") {
      onSuccess(result.value);
  } else if (result.type === "error" && onError) {
      onError(result.message);
  } else if (result.type === "error") {
      console.error("Error:", result.message);
  }
}

// Higher-order function to try multiple extractors
function tryExtractValue<T>(
  input: DU,
  extractors: Array<(input: DU) => OutTupleResult<T>>
): OutTupleResult<T> {
  for (const extractor of extractors) {
      const result = extractor(input);
      if (result.type === "success") {
          return result;
      }
  }
  return { type: "error", message: "Could not extract value using any provided extractor" };
}

// Create specific extractors using the higher-order function
const getName = createTupleValueExtractor(isAType, (aType) => aType.name);
const getJoinedValues = createTupleValueExtractor(isBType, (bType) => bType.values.join());

const tuple: DU[] = [
  { name: "User A", value: 10, properties: ["prop1"] },
  { values: [1, 2, 3] },
  { name: "User B", value: 20, properties: ["prop2", "prop3"] },
  { values: [4, 5] }
];

tuple.forEach((item) => {
  // Example using handleTupleResult with specific extractors
  handleTupleResult(getName(item), (name) => console.log(`Name: ${name}`), () => {});
  handleTupleResult(getJoinedValues(item), (values) => console.log(`Values: ${values}`), () => {});

  console.log("---");

  // Example using tryExtractValue to attempt both extractions
  const extractionResult = tryExtractValue(item, [getName, getJoinedValues]);
  handleTupleResult(
      extractionResult,
      (value) => console.log(`Extracted value (tryExtractValue): ${value}`),
      (error) => console.error(`Extraction failed (tryExtractValue): ${error}`)
  );

  console.log("===");
});