import { ODataClient } from "./core/client";

const client = new ODataClient({
  serviceUrl: "https://localhost:7000",
  routingType: "parentheses",
  http: {
    headers: {},
  },
});

interface Channel {
  id: number;
  name: string;
}

const channelSet = client.createEntityClient(
  {} as Channel,
  {
    entitySet: "channels",
    readSet: "GET",
    create: "POST",
  }
);

channelSet.create({ name: "test" }).select().execute();
