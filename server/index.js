const needle = require("needle");
const config = require("dotenv").config();
const TOKEN = process.env.TWITTER_BEARER_TOKEN;

const rulesURL = "https://api.twitter.com/2/tweets/search/stream/rules";
const streamURL =
  "https://api.twitter.com/2/tweets/search/stream?tweet.fields=public_metrics&expansions=author_id";

const rules = [{ value: "giveaway" }];

async function getRules() {
  const response = await needle("get", rulesURL, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });

  return response.body;
}

async function setRules() {
  const data = {
    add: rules,
  };
  const response = await needle("post", rulesURL, data, {
    content_type: "application/json",
    headers: { Authorization: `Bearer ${TOKEN}` },
  });

  return response.body;
}

async function deleteRules(rules) {
  if (!Array.isArray(rules.data)) {
    return null;
  }

  const ids = rules.data.map((rule) => rule.id);

  const data = {
    delete: {
      ids: ids,
    },
  };
  const response = await needle("post", rulesURL, data, {
    content_type: "application/json",
    headers: { Authorization: `Bearer ${TOKEN}` },
  });

  return response.body;
}

function streamTweets() {
  const stream = needle.get(streamURL, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  });

  stream.on("data", (data) => {
    try {
      const json = JSON.parse(data);
      console.log(json);
    } catch (err) {}
  });
}

(async () => {
  let currentRules;
  try {
    currentRules = await getRules();
    await deleteRules(currentRules);
    await setRules();
  } catch (err) {
    console.log(err);
    process.exit(1);
  }

  streamTweets();
})();
