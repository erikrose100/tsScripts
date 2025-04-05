import { ResourceGraphClient } from "@azure/arm-resourcegraph";
import { SubscriptionClient } from "@azure/arm-resources-subscriptions";
import { DefaultAzureCredential } from "@azure/identity";
import { ChangesClient } from "@azure/arm-changes";
import { XML_ATTRKEY } from "../../../Library/Caches/deno/npm/registry.npmjs.org/@azure/core-client/1.9.3/dist/commonjs/interfaces.d.ts";
// import { AzureChangeAnalysisManagementClient } from "@azure/arm-changeanalysis";

const credential = new DefaultAzureCredential();
const subscriptionClient = new SubscriptionClient(credential);
const resourceGraphClient = new ResourceGraphClient(credential);

function parseResourceId(resourceId: string): {
  subscriptionId: string;
  resourceGroupName: string;
  resourceProviderNamespace: string;
  resourceType: string;
  resourceName: string;
} | null {
  if (!resourceId) {
    return null;
  }

  const parts = resourceId.split("/");

  if (parts.length < 9) {
    return null;
  }

  return {
    subscriptionId: parts[2],
    resourceGroupName: parts[4],
    resourceProviderNamespace: parts[6],
    resourceType: parts[7],
    resourceName: parts[8],
  };
}

async function getAllSubscriptions(
  subscriptionClient: SubscriptionClient,
): Promise<string[] | undefined> {
  const subIDs: string[] = [];
  try {
    const subscriptions = subscriptionClient.subscriptions.list();
    for await (const subscription of subscriptions) {
      console.log(subscription.displayName);
      subIDs.push(subscription.subscriptionId!);
    }
    return subIDs;
  } catch (error) {
    console.error("An error occurred:", error);
    throw error;
  }
}

const subVar: string | null | undefined = Deno.env.get("AZ_SUBSCRIPTION_LIST");
let subIDs: string[] | undefined;

if (subVar) {
  subIDs = subVar.split(",");
} else {
  try {
    subIDs = await getAllSubscriptions(subscriptionClient);
  } catch (err) {
    console.error("An error occurred:", err);
    console.log("could not find subs");
    subIDs = undefined;
  }
}

if (subIDs) {
  subIDs.forEach((id: string) => console.log(id));
} else {
  console.log("could not find subs");
}

const now = Date.now();
const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
const nowDate = new Date(now);

if (subIDs) {
  const promises = subIDs.map(async (id) => {
    try {
      const result = await resourceGraphClient.resourceChanges({
        interval: {
          start: oneDayAgo, // now -24 hrs
          end: nowDate,
        },
        fetchPropertyChanges: true,
        fetchSnapshots: true,
        subscriptionId: id.toString(),
      });

      const changes = result.changes;

      if (changes && changes.length > 0) {
        const changesResourceIds = changes.flatMap((x) =>
          x.resourceId ? [`"${x.resourceId}"`] : []
        ).join(",");
        const afterSnapshotIds = changes.flatMap((x) =>
          x.afterSnapshot.snapshotId ? [`"${x.afterSnapshot.snapshotId}"`] : []
        ).join(",");
        const beforeSnapshotIds = changes.flatMap((x) =>
          x.beforeSnapshot.snapshotId
            ? [`"${x.beforeSnapshot.snapshotId}"`]
            : []
        ).join(",");
        resourceGraphClient.resources({
          query:
            `"resourcechanges | where dynamic([${changesResourceIds}]) contains properties.targetResourceId | where dynamic([${changesResourceIds}]) contains properties.targetResourceId"`,
          subscriptions: [id.toString()],
        });
        for (const x of changes) {
          try {
            // const resourceChanges = changesAnalysisClient.resourceChanges.list(
            //   x.resourceId!,
            //   oneDayAgo,
            //   nowDate,
            // );

            // for await (const item of resourceChanges) {
            //   console.log(JSON.stringify(item));
            // }

            if (x.propertyChanges !== undefined) {
              console.log(x.propertyChanges);
              console.log(JSON.stringify(x));
            }
          } catch (innerError) {
            console.error(
              `Error processing change ${x.changeId} in subscription ID ${id}:`,
              innerError,
            );
          }
        }
      }
    } catch (error) {
      console.error(`Error processing subscription ID ${id}:`, error);
      console.error(error);
    }
  });

  await Promise.all(promises);
}

console.log("changes logging done");
Deno.exit();
