import { ResourceGraphClient } from "@azure/arm-resourcegraph";
import { SubscriptionClient } from "@azure/arm-resources-subscriptions";
import { DefaultAzureCredential } from "@azure/identity";

const credential = new DefaultAzureCredential();
const subscriptionClient = new SubscriptionClient(credential);
const resourceGraphClient = new ResourceGraphClient(credential);

async function getAllSubscriptions(): Promise<string | undefined> {
  try {
    const subscriptions = subscriptionClient.subscriptions.list();
    for await (const subscription of subscriptions) {
      console.log(subscription.displayName);
      return subscription.subscriptionId;
    }
  } catch (error) {
    console.error("An error occurred:", error);
    throw error;
  }
}
const subIDs = await getAllSubscriptions().catch((err) => {
  console.error("An error occurred:", err);
});
console.log(subIDs?.toString());
console.log("done");

const now = Date.now();

const result = await resourceGraphClient.resourceChanges({
  interval: {
    start: new Date(now - (24 * 60 * 60 * 1000)), // now -24 hrs
    end: new Date(now),
  },
  fetchPropertyChanges: true,
  subscriptionId: subIDs?.toString(),
});

const changes = result.changes;

console.log(changes?.forEach( x => (console.log(x.propertyChanges))));
