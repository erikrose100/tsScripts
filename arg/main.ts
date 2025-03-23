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

const subVar: string | null | undefined = Deno.env.get("SUBSCRIPTION_LIST");
let subIDs: string[] | undefined;

if (subVar) {
  subIDs = subVar.split(',');
} else {
  try {
    subIDs = await getAllSubscriptions();
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

if (subIDs) {
  const promises = subIDs.map(async (id) => {
    try {
      const result = await resourceGraphClient.resourceChanges({
        interval: {
          start: new Date(now - 24 * 60 * 60 * 1000), // now -24 hrs
          end: new Date(now),
        },
        fetchPropertyChanges: true,
        subscriptionId: id.toString(),
      });

      const changes = result.changes;

      if (changes && changes.length > 0) {
        changes.forEach((x) => {
          if (x.propertyChanges !== undefined) {
            console.log(x.propertyChanges);
          }
        });
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
