import { ODataClient } from "./core/client";
import { HttpMethod } from "./utils/http";
import { createOperatorFactory } from "./values/base";
import { DateConstantValue } from "./values/constant";

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
    readSet: "GET" as HttpMethod,
    create: "POST" as HttpMethod,
  }
);

channelSet.create({ name: "test" });

const o = createOperatorFactory({
  /** blah */
  date: (value: string) => new DateConstantValue(new Date(value)),
});

o.date(""); //valid
o.dateTime(new Date());
