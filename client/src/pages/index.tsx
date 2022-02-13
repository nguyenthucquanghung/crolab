import React from "react";
import history from "../history";
import {UserRoleType} from "../utils/enumerates";
import "./index.scss";

export default class Main extends React.Component {
	componentDidMount() {
		const loggedIn = localStorage.getItem('loggedIn');
		const userRole = localStorage.getItem('userRole');
		if (loggedIn === "1" && userRole) {
			switch (parseInt(userRole)) {
				case UserRoleType.Requester:
					history.push("/requester/jobmanagement");
					return;
				case UserRoleType.Annotator:
					history.push("/annotator/dashboard");
					return;
				case UserRoleType.Admin:
					history.push("/admin/jobmanagement");
					return;
			}
		} else history.push("/login")
	}

	render() {
		return (
			<div className={`main-container`}>
			</div>
		)
	}
}