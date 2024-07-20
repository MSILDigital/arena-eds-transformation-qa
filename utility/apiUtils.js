const apiUtils = {
  async fetchAuthorisationToken(publishDomain) {
    try {
      const res = await fetch(`${publishDomain}/content/arena/services/token`);
      if (res.ok) {
        return await res.text();
      }
    } catch (e) {
      return '';
    }
    return '';
  },
  async fetchExShowroomPrices(
    apiKey,
    authorization,
    forCode,
    modelCodes,
    channel,
    variantInfoRequired,
  ) {
    const apiUrl = 'https://api.preprod.developersatmarutisuzuki.in/pricing/v2/common/pricing/ex-showroom-detail';
    const params = {
      forCode, channel, modelCodes, variantInfoRequired,
    };
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
  setLocalStorageVarientList(data, forCode, key) {
    if (data.error === false && data.data) {
      const storedModelPrices = {};
      const timestamp = new Date().getTime() + 1 * 24 * 60 * 60 * 1000; // 1 day from now

      data.data.models.forEach((model) => {
        model.exShowroomDetailResponseDTOList.forEach((item) => {
          const { variantCd, colorType, exShowroomPrice } = item;
          if (!storedModelPrices[variantCd]) {
            storedModelPrices[variantCd] = { timestamp };
          }
          const colorKey = `color${Object.keys(storedModelPrices[variantCd]).length}`;
          storedModelPrices[variantCd][colorKey] = {
            colorType,
            price: { [forCode]: exShowroomPrice },
          };
        });
      });

      localStorage.setItem(key, JSON.stringify(storedModelPrices));
      return storedModelPrices;
    }
    return null;
  },
};
export default apiUtils;
