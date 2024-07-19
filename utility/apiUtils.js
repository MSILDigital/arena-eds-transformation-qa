import utility from '../../utility/utility.js';
const apiUtils = {
async fetchAuthorisationToken(publishDomain){
  try {
    const res = await fetch(`${publishDomain}/content/arena/services/token`);
    if (res.ok) {
      return await res.text();
    }
  } catch (e) {
    return '';
  }
},  
async fetchExShowroomPrices(apiKey, authorization, forCode, modelCodes, channel) {
  const apiUrl = 'https://api.preprod.developersatmarutisuzuki.in/pricing/v2/common/pricing/ex-showroom-detail';
  const params = { forCode, channel, modelCodes };
  const headers = {
    'x-api-key': apiKey,
    Authorization: authorization,
  };
  const url = new URL(apiUrl);
  Object.keys(params).forEach((key) => {
    if (params[key] !== '') {
      url.searchParams.append(key, params[key]);
    }
  });
  try {
    const response = await fetch(url, { method: 'GET', headers });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    return null;
  }
},
getLocalStorage(key) {
  const storedData = localStorage.getItem(key);
  if (storedData) {
    return JSON.parse(storedData);
  }
  return null;
},
setLocalStorage(data, forCode, key) {
  if (data.error === false && data.data) {
    const storedModelPrices = {};
    const timestamp = new Date().getTime() + 1 * 24 * 60 * 60 * 1000; // 1 day from now

    data.data.models.forEach((item) => {
      const { modelCd } = item;
      const formattedPrice = item.lowestExShowroomPrice;
      storedModelPrices[modelCd] = {
        price: { [forCode]: formattedPrice },
        timestamp,
      };
    });

    localStorage.setItem(key, JSON.stringify(storedModelPrices));
    return storedModelPrices;
  }
  return null;
},
};
export default apiUtils;