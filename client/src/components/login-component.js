import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "../services/auth.service";

const LoginComponent = ({ currentUser, setCurrentUser }) => {
  let [email, setEmail] = useState("");
  let [password, setPassword] = useState("");
  let [errMessage, setErrMessage] = useState("");
  const navigete = useNavigate();

  const handleEmail = (e) => {
    setEmail(e.target.value);
  };

  const handlePassword = (e) => {
    setPassword(e.target.value);
  };

  const handleLogin = async () => {
    try {
      let response = await AuthService.loginin(email, password);
      localStorage.setItem("user", JSON.stringify(response.data));
      window.alert("登入成功,即將導向個人頁面");
      setCurrentUser(AuthService.getCurrentUser());
      navigete("/profile");
    } catch (e) {
      setErrMessage(e.response.data);
      console.log(e);
    }
  };
  return (
    <div style={{ padding: "3rem" }} className="col-md-12">
      <div>
        {errMessage && <div className="alert alert-danger"> {errMessage}</div>}
        <div className="form-group">
          <label htmlFor="username">電子信箱：</label>
          <input
            onChange={handleEmail}
            type="text"
            className="form-control"
            name="email"
          />
        </div>
        <br />
        <div className="form-group">
          <label htmlFor="password">密碼：</label>
          <input
            onChange={handlePassword}
            type="password"
            className="form-control"
            name="password"
          />
        </div>
        <br />
        <div className="form-group">
          <button onClick={handleLogin} className="btn btn-primary btn-block">
            <span>登入系統</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginComponent;
