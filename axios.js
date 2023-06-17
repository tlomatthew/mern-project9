const axios = require("axios");

async function example() {
  try {
    let response = await fetch(URL);
    // return promise

    let data = await response.json();

    console.log(data);
  } catch (e) {
    console.log(e);
  }
}

async function example2() {
  try {
    let axiosResponseObject = await axios.get(URL);
    // return 一個特別的根promise很像的 不需要json()method去取得data
    //而是用

    //axios response object
    console.log(axiosResponseObject.data);
  } catch (e) {
    console.log(e);
  }
}

example();
example2();
