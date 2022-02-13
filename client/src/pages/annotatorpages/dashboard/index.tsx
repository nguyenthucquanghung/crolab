import {
	Avatar,
	Box,
	Button,
	Card, CardHeader,
	Grid, Link,
	Paper, Rating,
	Stack,
	Table,
	TableBody,
	TableContainer,
	TextField, Tooltip, tooltipClasses, TooltipProps,
	Typography
} from "@mui/material";
import React from "react";
import * as generalActions from "../../../redux/general/actions";
import * as snackBarActions from "../../../redux/snackbar/actions";
import {SnackBarType} from "../../../utils/enumerates";
import {connect} from "react-redux";
import jobAPI from "../../../api/jobAPI";
import ReactAudioPlayer from 'react-audio-player';
import {RouteComponentProps} from "react-router-dom";
import history from "../../../history";
import LinearProgress, {linearProgressClasses} from '@mui/material/LinearProgress';
import {styled} from "@mui/material/styles";
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import JobList from "./components/JobList";
import TaskList from "./components/TaskList";

const mapDispatcherToProps =
	(dispatch: any): IAnnotatorDashboardPropsFromDispatch => {
		return {
			showSnackBar: (pMsg: string, pDuration: number, pType: SnackBarType) => dispatch(snackBarActions.showSnackBar(pMsg, pDuration, pType)),
			showTopLoading: () => dispatch(generalActions.showTopLoading()),
			hideTopLoading: () => dispatch(generalActions.hideTopLoading()),
		}
	}

interface IAnnotatorDashboardPropsFromDispatch {
	showTopLoading?: () => void;
	hideTopLoading?: () => void;
	showSnackBar?: (pMsg: string, pDuration: number, pType: SnackBarType) => void;
}

type IAnnotatorDashboardProps = IAnnotatorDashboardPropsFromDispatch;

interface IAnnotatorDashboardState {
}

@(connect(null, mapDispatcherToProps) as any)
export default class AnnotatorDashboard extends React.Component<IAnnotatorDashboardProps, IAnnotatorDashboardState> {
	constructor(props: IAnnotatorDashboardProps) {
		super(props);
		this.state = {}
	}

	componentDidMount() {
		this.props.showTopLoading!();
		jobAPI.getAllJobs().then(res => {
			// TODO: validate
			if (res.status && res.status === 200 && res.data && res.data.total && res.data.results) {

			}
		}).finally(() => this.props.hideTopLoading!())
	}

	render() {
		return (
			<Box
				sx={{
					display: "block",
					width: "100%",
					height: "100%",
					p: "20px",
				}}
			>
				<Paper sx={{
					width: "calc(50% - 70px)",
					display: "inline-block",
					pt: "20px",
					height: "calc(100vh - 64px - 60px)",
					verticalAlign: "top",
				}}>
					<JobList/>
				</Paper>
				<Paper sx={{
					display: "inline-block",
					width: "calc(50% - 70px)",
					ml: "20px",
					p: "20px",
					height: "calc(100vh - 64px - 80px)",
					overflowY: "auto",
				}}>
					<TaskList />
				</Paper>
			</Box>
		)
	}
}