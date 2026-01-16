const axios = require('axios');

async function callApi(url, method = 'GET', data = {}, headers = {}) {
  try {
    const response = await axios({
      url,
      method,
      data,
      headers,
    });

    return response.data;
  } catch (error) {
    console.error('API call failed:', error.message);
    throw error;
  }
}

module.exports = callApi;
