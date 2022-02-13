import {
	Avatar,
	Box,
	Button,
	Card, CardHeader, Chip, FormControl,
	Grid, InputAdornment, InputLabel, Link, MenuItem, OutlinedInput,
	Paper, Rating, Select,
	Stack,
	Table,
	TableBody,
	TableContainer,
	TextField, Tooltip, tooltipClasses, TooltipProps,
	Typography
} from "@mui/material";
import React from "react";
import * as generalActions from "../../../../redux/general/actions";
import * as snackBarActions from "../../../../redux/snackbar/actions";
import {CategoryType, SnackBarType} from "../../../../utils/enumerates";
import {connect} from "react-redux";
import jobAPI from "../../../../api/jobAPI";
import ReactAudioPlayer from 'react-audio-player';
import {RouteComponentProps} from "react-router-dom";
import history from "../../../../history";
import LinearProgress, {linearProgressClasses} from '@mui/material/LinearProgress';
import {styled} from "@mui/material/styles";
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import {Task} from "../../../../type";
import Utils, {BorderLinearProgress} from "../../../../utils/utils";
import SearchIcon from '@mui/icons-material/Search';
import "./../index.scss";
import taskAPI from "../../../../api/taskAPI";

const modalStyle: any = {
	position: 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	bgcolor: 'background.paper',
	borderRadius: 2,
	boxShadow: 24,
	p: 2,
	textAlign: "center",
};

const mapDispatcherToProps =
	(dispatch: any): ITaskListPropsFromDispatch => {
		return {
			showSnackBar: (pMsg: string, pDuration: number, pType: SnackBarType) => dispatch(snackBarActions.showSnackBar(pMsg, pDuration, pType)),
			showTopLoading: () => dispatch(generalActions.showTopLoading()),
			hideTopLoading: () => dispatch(generalActions.hideTopLoading()),
		}
	}

interface ITaskListPropsFromDispatch {
	showTopLoading?: () => void;
	hideTopLoading?: () => void;
	showSnackBar?: (pMsg: string, pDuration: number, pType: SnackBarType) => void;
}

type ITaskListProps = ITaskListPropsFromDispatch;

interface ITaskListState {
	tasks: Task[];
	searchContent: string;
	categoryFilter: number;
	hasBonusFilter: number;
}

@(connect(null, mapDispatcherToProps) as any)
export default class TaskList extends React.Component<ITaskListProps, ITaskListState> {
	constructor(props: ITaskListProps) {
		super(props);
		this.state = {
			tasks: [],
			searchContent: "",
			categoryFilter: -1,
			hasBonusFilter: -1,
		}
	}

	componentDidMount() {
		this.props.showTopLoading!();
		taskAPI.getAllTasks().then(res => {
			// TODO: validate
			if (res.status && res.status === 200 && res.data && res.data.total && res.data.results) {
				this.setState({
					tasks: res.data.results,
				})
			}
		}).finally(() => this.props.hideTopLoading!())
	}

	render() {
		const {
			tasks,
			searchContent,
			hasBonusFilter,
			categoryFilter,
		} = this.state;

		return <Stack direction={"column"} spacing={"20px"}>
			<Typography
				variant={`h5`}
				sx={{color: "#5c9bcb", textAlign: "center"}}
			>
				QUẢN LÝ CÔNG VIỆC
			</Typography>
			<Typography variant="h5" sx={{fontWeight: 400}}>Danh sách yêu cầu</Typography>
			{this.renderPendingTasks()}
			<Typography variant="h5" sx={{fontWeight: 400}}>Công việc đang thực hiện</Typography>
			{this.renderInProgressTasks()}
			{/*<Typography variant="h5" sx={{fontWeight: 400}}>Công việc đã hoàn thành</Typography>*/}
			{/*{this.renderInProgressTasks()}*/}
			{/*<Typography variant="h5" sx={{fontWeight: 400}}>Công việc đã được phê duyệt</Typography>*/}
			{/*{this.renderInProgressTasks()}*/}
		</Stack>
	}

	private renderFinishedTasks = () => {
		const {tasks} = this.state;
		const finishedTasks = tasks.filter(task => !task.accepted);
		return tasks.length ? (finishedTasks.length ?
			<Grid spacing={2} sx={{overflowY: "auto", flexGrow: 1,}}>
				{finishedTasks.map((task: Task, taskIdx: number) => {
					return <Card
						key={taskIdx}
						sx={{p: 2, ml: 1, mr: 1, mb: 1, mt: 1, display: "inline-block", width: "300px"}}
					>
						<Typography variant={`body1`}>{task.job.name}</Typography>
						<Typography variant={`body1`} sx={{ mt: "20px", fontWeight: 300}}>
							Quản lý: {task.job.requester.full_name} <br/>
							Deadline: 10 ngày <br/>
							Số lượng đơn vị dữ liệu: {task.unit_qty} <br/>
							Thu nhập: {task.unit_qty * task.job.unit_wage} VND <br/>
							Trạng thái: Chưa được chấp nhận
						</Typography>
						<Box>
							<Button
								variant={`contained`}
								color={`error`}
								sx={{m: "20px auto 0", display: `block`}}
							>
								Hủy yêu cầu
							</Button>
						</Box>
					</Card>
				})}
			</Grid> : <Typography variant={`body1`} sx={{fontWeight: 300}}>
				Hiện tại không có yêu cầu nào đang chờ phê duyệt.
			</Typography>) : <Typography variant={`body1`} sx={{fontWeight: 300}}>
			Hiện tại không có yêu cầu nào. Vui lòng gửi yêu cầu để nhận việc
		</Typography>
	}

	private renderPendingTasks = () => {
		const {tasks} = this.state;
		const pendingTasks = tasks.filter(task => !task.accepted);
		return tasks.length ? (pendingTasks.length ?
			<Grid spacing={2} sx={{overflowY: "auto", flexGrow: 1,}}>
				{pendingTasks.map((task: Task, taskIdx: number) => {
					return <Card
						key={taskIdx}
						sx={{p: 2, ml: 1, mr: 1, mb: 1, mt: 1, display: "inline-block", width: "300px"}}
					>
						<Typography variant={`body1`}>{task.job.name}</Typography>
						<Typography variant={`body1`} sx={{ mt: "20px", fontWeight: 300}}>
							Quản lý: {task.job.requester.full_name} <br/>
							Deadline: 10 ngày <br/>
							Số lượng đơn vị dữ liệu: {task.unit_qty} <br/>
							Thu nhập: {task.unit_qty * task.job.unit_wage} VND <br/>
							Trạng thái: Chưa được chấp nhận
						</Typography>
						<Box>
							<Button
								variant={`contained`}
								color={`error`}
								sx={{m: "20px auto 0", display: `block`}}
							>
								Hủy yêu cầu
							</Button>
						</Box>
					</Card>
				})}
			</Grid> : <Typography variant={`body1`} sx={{fontWeight: 300}}>
				Hiện tại không có yêu cầu nào đang chờ phê duyệt.
			</Typography>) : <Typography variant={`body1`} sx={{fontWeight: 300}}>
			Hiện tại không có yêu cầu nào. Vui lòng gửi yêu cầu để nhận việc
		</Typography>
	}

	private renderInProgressTasks = () => {
		const {tasks} = this.state;
		const inProgressTasks = tasks.filter(task => task.accepted && !task.is_submitted);
		return tasks.length ? (inProgressTasks.length ?
			<Grid spacing={2} sx={{overflowY: "auto", flexGrow: 1,}}>
				{inProgressTasks.map((task: Task, taskIdx: number) => {
					return <Card
						key={taskIdx}
						sx={{p: 2, ml: 1, mr: 1, mb: 1, mt: 1, display: "inline-block", width: "300px"}}
					>
						<Typography variant={`body1`}>{task.job.name}</Typography>
						<Typography variant={`body1`} sx={{fontWeight: 300}}>
							Quản lý: {task.job.requester.full_name} <br/>
							Deadline: 10 ngày <br/>
							Tiến độ: {task.labeled_unit}/{task.unit_qty} đơn vị dữ liệu <br/>
							Trạng thái: {task.is_submitted ? `Hoàn thành` : `Chưa hoàn thành`}
						</Typography>
						<Box>
							<Button
								variant={`contained`}
								sx={{m: "20px auto 0", display: `block`}}
								onClick={()=> history.push(`/annotator/workplace/${task.id}/page/1`)}
							>
								Bắt đầu/Tiếp tục gán nhãn
							</Button>
						</Box>
					</Card>
				})}
			</Grid> : <Typography variant={`body1`} sx={{fontWeight: 300}}>
				Hiện tại bạn chưa được phân công việc làm nào.
			</Typography>) : <Typography variant={`body1`} sx={{fontWeight: 300}}>
			Hiện tại không có yêu cầu nào. Vui lòng gửi yêu cầu để nhận việc
		</Typography>
	}
}