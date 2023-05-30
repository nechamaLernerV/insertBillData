// eslint-disable-next-line @typescript-eslint/no-var-requires
const axios = require('axios/dist/node/axios.cjs');

async function createAutomaticAccount(
  { email, name, password, country_name, time_zone },
  feature_flags,
) {
  let options = {
    email: email,
    business_name: name,
    password: password,
    directory_id: 1,
    country_name: country_name,
    time_zone: time_zone,
  };

  const resp = await adminApi({
    method: 'post',
    path: `/admin/users/`,
    data: {
      generate_api_token: true,
      options: JSON.stringify(options),
    },
  });
  console.log(resp);

  await addFeaturesToUser(resp.user_id, feature_flags);
  return resp;
}

async function createAccount(id) {
  let auto_account_detaUSD = {
    email: `nechama.lerner+qb${id}@gmail.com`,
    name: `Nechama Lerner QB ${id}`,
    password: '12345678',
    country_name: 'United States',
    time_zone: 'America/New_York',
  };
  console.log(`Creating automatic account ${auto_account_detaUSD.email}`);

  const flags = ['qb'];
  const data = await createAutomaticAccount({ ...auto_account_detaUSD }, flags);
  const account = {
    ...auto_account_detaUSD,
    pivot_uid: data.pivot_uid,
    api_token: data.api_token,
    user_id: data.user_id,
    subscription_id: data.subscription_id,
  };
  // console.log(data);
  return account;
}

async function adminApi({ method, path, data }) {
  return await axios.post(`https://api2.meet2know.com${path}`, data, {
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
      Authorization: `Admin kjh7tdewtfvdewolmmd`,
    },
  });
}

function addFeaturesToUser(user_id, feature_flags) {
  let features = feature_flags.join(',');
  return adminApi({
    method: 'post',
    path: `/admin/feature_flags/${user_id}/add_user_features`,
    data: { features: features },
  });
}

async function main() {
  try {
    const account = await createAccount(1);
  } catch (e) {
    console.log(e);
  }
}

main();
