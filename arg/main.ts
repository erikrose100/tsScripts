import { ResourceGraphClient } from "@azure/arm-resourcegraph";
import { SubscriptionClient } from "@azure/arm-resources-subscriptions";
import { DefaultAzureCredential } from "@azure/identity";

const credential = new DefaultAzureCredential();
const subscriptionClient = new SubscriptionClient(credential);
const resourceGraphClient = new ResourceGraphClient(credential);

async function getAllSubscriptions(): Promise<string[] | undefined> {
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
const subIDs = await getAllSubscriptions().catch((err) => {
  console.error("An error occurred:", err);
});
if (subIDs) {
  for (const id of subIDs) {
    console.log(id.toString());
  }
} else {
  console.log("could not find subs");
}
console.log("done");

const now = Date.now();

if (subIDs) {
  for (const id of subIDs) {
    try {
      const result = await resourceGraphClient.resourceChanges({
        interval: {
          start: new Date(now - (24 * 60 * 60 * 1000)), // now -24 hrs
          end: new Date(now),
        },
        fetchPropertyChanges: true,
        subscriptionId: id.toString(),
      });

      const changes = result.changes;

      if (changes && changes.length > 0) {
        changes.forEach((x) => {
          if (x.propertyChanges && x.propertyChanges.toString() != "undefined") {
            console.log(x.propertyChanges);
          }
        });
      }
    } catch (error) {
      console.error(`Error processing subscription ID ${id}:`, error);
    }
  }
} else {
  console.log("could not find subs");
}
