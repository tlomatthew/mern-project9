import axios from "axios";
const API_URL = "http://localhost:8080/api/users";

class AuthService {
  loginin(email, password) {
    return axios.post(API_URL + "/login", { email, password });
  }
  logout() {
    localStorage.removeItem("user");
  }
  register(username, email, password, role) {
    return axios.post(API_URL + "/register", {
      username,
      email,
      password,
      role,
    });
    //註冊成功的話會return 一個fulfilled promise
    // axios.post()的第二參數為要post 的值
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem("user"));
  }
}

export default new AuthService();
// () 是執行constructor 意思
