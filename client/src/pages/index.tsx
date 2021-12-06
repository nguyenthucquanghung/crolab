
import React from "react";
import history from "../history";
import "./index.scss";

export default class Main extends React.Component {
    componentDidMount() {
        const loggedIn = localStorage.getItem('loggedIn')
        if (loggedIn === "1") history.push("/dashboard"); else history.push("/login")
    }
    render() {
        return (
            <div className={`main-container`}>
            </div>
        )
    }
}