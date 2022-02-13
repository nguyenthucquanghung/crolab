import {
	Avatar,
	Box,
	Button,
	Card,
	CardHeader,
	Grid,
	LinearProgress,
	Link,
	Modal,
	Paper,
	Rating,
	Stack,
	Table,
	TableBody,
	TableContainer,
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
import {StyledTableCell, StyledTableRow} from "../jobmanagement";
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import {BorderLinearProgress, CustomTooltip, modalStyle} from "../../../utils/utils";
import taskAPI from "../../../api/taskAPI";
import {Job, Task} from "../../../type";

const mapDispatcherToProps =
	(dispatch: any): IJobDetailPropsFromDispatch => {
		return {
			showSnackBar: (pMsg: string, pDuration: number, pType: SnackBarType) => dispatch(snackBarActions.showSnackBar(pMsg, pDuration, pType)),
			showTopLoading: () => dispatch(generalActions.showTopLoading()),
			hideTopLoading: () => dispatch(generalActions.hideTopLoading()),
		}
	}

interface IJobDetailPropsFromDispatch {
	showTopLoading?: () => void;
	hideTopLoading?: () => void;
	showSnackBar?: (pMsg: string, pDuration: number, pType: SnackBarType) => void;
}

interface IJobDetailUrlParams {
	jobid?: string;
}

type IJobDetailProps = RouteComponentProps<IJobDetailUrlParams> & IJobDetailPropsFromDispatch;

interface IJobDetailState {
	jobDetail: Job;
	showTaskDetailModal: boolean;
	modalTask?: Task;
}

@(connect(null, mapDispatcherToProps) as any)
export default class JobDetail extends React.Component<IJobDetailProps, IJobDetailState> {
	constructor(props: IJobDetailProps) {
		super(props);
		this.state = {
			showTaskDetailModal: false,
			jobDetail: {
				accepted_qty: 0,
				accepted_threshold: 0,
				bonus_threshold: 0,
				category: 0,
				created_at: "",
				deadline: "",
				description: "",
				id: 0,
				min_qty: 0,
				name: "",
				requester: {
					id: 0,
					full_name: "",
					email: "",
					created_at: "",
					updated_at: "",
					gender: 0,
					year_of_birth: 0,
					rating: 0,
					role: 0,
					task_c: 0,
					mean_truth_accuracy: 0,
					mean_shared_accuracy: 0,
					label_c: 0,
				},
				shared_qty: 0,
				tasks: [],
				truth_qty: 0,
				truth_qty_ready: false,
				truth_units: [],
				unit_bonus: 0,
				unit_qty: 0,
				unit_wage: 0,
				updated_at: "",
			}
		}
	}

	componentDidMount() {
		this.reloadData();
	}

	private reloadData = () => {
		this.props.showTopLoading!();
		jobAPI.getJobDetail(parseInt(this.props.match.params.jobid!)).then(res => {
			// TODO: validate
			this.setState({
				jobDetail: res.data
			})
		}).finally(() => this.props.hideTopLoading!());
	}

	render() {
		const {jobDetail,} = this.state;
		return (
			!!jobDetail ? <Box sx={{display: "block", width: "100%", height: "100%", p: "20px",}}>
				{this.renderJobDetail()}
				{this.renderTaskManagement()}
				{this.renderTaskDetailModal()}
			</Box> : <></>
		)
	}

	private renderTaskDetailModal = () => {
		const {modalTask} = this.state;
		return !!modalTask && <Modal
        open={this.state.showTaskDetailModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
    >
        <Box sx={modalStyle}>
            <Stack spacing={`10px`}>
							{this.renderUnitsTable()}
							{this.renderModalButtons()}
            </Stack>
        </Box>
    </Modal>
	}

	private renderUnitsTable = () => {
		return <></>
	}

	private renderModalButtons = () => {
		const {modalTask} = this.state;
		return !!modalTask && <Stack direction={`row-reverse`} spacing={`10px`}>
        <Button
            variant={`outlined`}
            color={`error`}
            onClick={() => {
							this.setState({showTaskDetailModal: false})
						}}>
            Đóng
        </Button>
        <Button disabled={!modalTask.is_submitted} variant={`contained`}>
            Phê duyệt
        </Button>
        <Button
            disabled={!modalTask.is_submitted}
            color={`error`} sx={{color: "white"}}
            variant={`contained`} onClick={() => this.rejectTask(modalTask)}
        >
            Từ chối
        </Button>
    </Stack>
	}

	private renderTaskManagement = () => {
		return <Paper sx={{
			display: "inline-block",
			width: "calc(50% - 70px)",
			ml: "20px",
			p: "20px",
			height: "calc(100vh - 64px - 80px)",
			overflowY: "auto",
		}}>
			<Stack direction={"column"} spacing={"20px"}>
				<Typography variant="h5" sx={{fontWeight: 500}}>Danh sách Ground Truth</Typography>
				{this.renderGroundTruths()}
				<Typography variant="h5" sx={{fontWeight: 500}}>Yêu cầu nhận việc</Typography>
				{this.renderComingTasks()}
				<Typography variant="h5" sx={{fontWeight: 500}}>Danh sách phân công</Typography>
				{this.renderInProgressTasks()}
			</Stack>
		</Paper>
	}

	private renderAnnotator = (task: Task, padding: string | number) => {
		return <CardHeader
			sx={{p: padding, cursor: "pointer",}}
			avatar={<Avatar sx={{bgcolor: task.annotator.gender == 1 ? "#2196F3" : "#8a25b1"}}>
				{task.annotator.gender == 1 ? <MaleIcon/> : <FemaleIcon/>}
			</Avatar>}
			title={task.annotator.full_name}
			subheader={<Typography variant={`body2`} sx={{fontWeight: 300}}>
				<Rating
					style={{fontSize: "1.3rem"}}
					readOnly
					defaultValue={task.annotator.rating}
					precision={0.1}
				/>
				<span style={{verticalAlign: "top"}}>
						{` (${task.annotator.task_c} lượt đánh giá)`}
					</span>
			</Typography>}
		/>
	}

	private renderAnnotatorToolTip = (task: Task) => {
		return <CustomTooltip
			placement="top-end"
			title={<Box>
				{this.renderAnnotator(task, "20px")}
				<Typography
					sx={{pl: "20px", pr: "20px", pb: "20px", fontWeight: 300}}
					variant={`body1`}
				>
					Email: {task.annotator.email} <br/>
					Số điện thoại: 0987654321 <br/>
					Tuổi: {2022 - task.annotator.year_of_birth} <br/>
					Tham gia từ tháng
					&nbsp;{task.annotator.created_at.split("-")[1]}&nbsp;
					năm {task.annotator.created_at.split("-")[0]}<br/>
					Kinh nghiệm làm việc:<br/>
					- Số lượng nhãn đã gán:&nbsp;
					{task.annotator.label_c}<br/>
					- Số lượng công việc hoàn thành:&nbsp;
					{task.annotator.task_c}<br/>
					- Mức độ chính xác trên Ground Truth:&nbsp;
					{task.annotator.mean_truth_accuracy}%<br/>
					- Mức độ chính xác trên dữ liệu chung:&nbsp;
					{task.annotator.mean_shared_accuracy}%<br/>
				</Typography>
			</Box>}>
			{this.renderAnnotator(task, 0)}
		</CustomTooltip>
	}

	private acceptTask = (task: Task) => {
		const {showTopLoading, hideTopLoading, showSnackBar,} = this.props;
		showTopLoading!();
		taskAPI.accept(task.id).then(res => {
			if (res.status !== 201) {
				showSnackBar!(
					"Có lỗi xảy ra khi chấp nhận yêu cầu!",
					10000,
					SnackBarType.Error
				)
			}
		}).catch(err => {
			showSnackBar!(
				"Có lỗi xảy ra khi chấp nhận yêu cầu! " + err.message,
				10000,
				SnackBarType.Error
			)
		}).finally(() => {
			hideTopLoading!();
			this.reloadData();
		});
	}

	private rejectTask = (task: Task) => {
		const {showTopLoading, hideTopLoading, showSnackBar,} = this.props;
		showTopLoading!();
		taskAPI.accept(task.id).then(res => {
			if (res.status !== 201) {
				showSnackBar!(
					"Có lỗi xảy ra khi từ chối yêu cầu nhận việc!",
					10000,
					SnackBarType.Error
				)
			}
		}).catch(err => {
			showSnackBar!(
				"Có lỗi xảy ra khi từ chối yêu cầu nhận việc! " + err.message,
				10000,
				SnackBarType.Error
			)
		}).finally(() => {
			hideTopLoading!();
			this.reloadData();
		});
	}

	private renderInProgressTasks = () => {
		const {jobDetail,} = this.state;
		if (!!jobDetail && !!jobDetail.tasks && !!jobDetail.tasks.length) {
			const inProgressTasks = jobDetail.tasks.filter((task: Task) => task.accepted)
			return inProgressTasks.length ?
				<Grid spacing={2} sx={{overflowY: "auto", flexGrow: 1,}}>
					{inProgressTasks.map((task: Task, taskIdx: number) => {
						return <Card
							key={taskIdx}
							sx={{p: 2, ml: 1, mr: 1, mb: 1, mt: 1, display: "inline-block", width: "300px", height: "285px"}}
						>
							<Stack direction={`column`} spacing={2}>
								{this.renderAnnotatorToolTip(task)}
								<Stack spacing={`7px`}>
									<Typography variant={`body2`} sx={{fontWeight: 300}}>
										Số lượng đơn vị dữ liệu: {task.unit_qty}
									</Typography>
									<Typography variant={`body2`} sx={{fontWeight: 300}}>
										Trạng thái: {task.is_submitted ? `Hoàn thành` : `Chưa hoàn thành`}.&nbsp;
										{task.is_submitted && <span><Link
                        onClick={() => this.setState({
													showTaskDetailModal: true,
													modalTask: task,
												})}
                    >Chi tiết</Link></span>}
									</Typography>
									<Typography variant={`body2`} sx={{fontWeight: 300}}>
										Tiến độ
									</Typography>
									<BorderLinearProgress
										variant={`determinate`}
										value={task.labeled_unit * 100 / task.unit_qty}
									/>
									<Typography variant={`body2`} sx={{fontWeight: 300}}>
										Đã gán nhãn {task.labeled_unit}/{task.unit_qty} đơn vị dữ liệu
									</Typography>
									{task.is_submitted && <Typography variant={`body2`} sx={{fontWeight: 300}}>
                      Độ chính xác Ground Truth: {task.truth_accuracy}%<br/>
                      Độ chính xác kiểm tra chéo: {task.shared_accuracy}%
                  </Typography>}
								</Stack>
								{!task.passed && <Stack direction={`row-reverse`} spacing={2}>
                    <Button
                        disabled={!task.is_submitted}
                        variant={`contained`}
                        onClick={() => {
													this.props.showTopLoading!();
													taskAPI.setTaskPassed(task.id).then(res => {
														this.props.showSnackBar!(
															"Phê duyệt thành công!",
															10000,
															SnackBarType.Success
														);
														this.reloadData();
													}).catch(err => {
														this.props.showSnackBar!(
															"Phê duyệt thất bại!",
															10000,
															SnackBarType.Error
														);
													}).finally(() => {
														this.props.hideTopLoading!();
													})
												}}
                    >
                        Phê duyệt
                    </Button>
                    <Button
                        disabled={!task.is_submitted}
                        color={`error`} sx={{color: "white"}}
                        variant={`contained`} onClick={() => this.rejectTask(task)}
                    >
                        Từ chối
                    </Button>
                </Stack>}
								{task.passed && <Typography variant={`body2`} sx={{
									fontWeight: 300, color: "#4CB050"
								}}>
                    Đã phê duyệt
                </Typography>}
							</Stack>
						</Card>
					})
					}
				</Grid> : <Typography variant={`body1`} sx={{fontWeight: 300}}>
					Hiện tại bạn chưa chấp thuận yêu cầu nhận việc nào, vui lòng chấp thuận để bắt đầu
					công việc!
				</Typography>
		} else {
			return <Typography variant={`body1`} sx={{fontWeight: 300}}>
				Hiện tại chưa có yêu cầu nhận việc nào, vui lòng quay lại sau!
			</Typography>
		}
	}

	private renderComingTasks = () => {
		const {jobDetail,} = this.state;
		if (!!jobDetail && !!jobDetail.tasks && !!jobDetail.tasks.length) {
			const comingTasks = jobDetail.tasks.filter((task: Task) => !task.accepted)
			return comingTasks.length ? <Grid spacing={2} sx={{overflowY: "auto", flexGrow: 1,}}>
				{comingTasks.map((task: Task, taskIdx: number) => {
					return <Card
						key={taskIdx}
						sx={{p: 2, ml: 1, mr: 1, mb: 1, mt: 1, display: "inline-block", width: "300px"}}
					>
						<Stack direction={`column`} spacing={2}>
							{this.renderAnnotatorToolTip(task)}
							<Typography variant={`body2`}>
								{task.annotator.task_c ?
									`Số công việc đã hoàn thành: ${task.annotator.task_c}` :
									`Chưa có kinh nghiệm`}<br/>
								Mong muốn nhận {task.unit_qty} đơn vị dữ liệu
							</Typography>
							<Stack direction={`row-reverse`} spacing={2}>
								<Button onClick={() => this.acceptTask(task)} variant={`contained`}>
									Chấp nhận
								</Button>
								<Button
									color={`error`} sx={{color: "white"}}
									variant={`contained`} onClick={() => this.rejectTask(task)}
								>
									Từ chối
								</Button>
							</Stack>
						</Stack>
					</Card>
				})
				}
			</Grid> : <Typography variant={`body1`} sx={{fontWeight: 300}}>
				Hiện tại chưa có yêu cầu đang chờ nào, vui lòng quay lại sau!
			</Typography>
		} else {
			return <Typography variant={`body1`} sx={{fontWeight: 300}}>
				Hiện tại chưa có yêu cầu nhận việc nào, vui lòng quay lại sau!
			</Typography>
		}
	}

	private renderGroundTruths = () => {
		const {jobDetail,} = this.state;
		return <Grid container spacing={2} sx={{overflowY: "auto", flexGrow: 1,}}>
			{(!!jobDetail && jobDetail.truth_units) &&
				jobDetail.truth_units.map((truthUnit: any, idx: number) => {
					const firstUnderlineIdx = truthUnit.data.indexOf("_");
					return <Card key={idx}
											 sx={{p: 2, ml: 1, mr: 1, mb: 2, display: "inline-block", minWidth: "280px"}}
					>
						<Stack direction={`column`} spacing={2}>
							<Typography variant={`body1`}>
								Tên file: {truthUnit.data.slice(firstUnderlineIdx + 1)}
							</Typography>
							<ReactAudioPlayer
								style={{width: "100%"}}
								src={`https://crolab.blob.core.windows.net/media/${truthUnit.data}`}
								controls
							/>
							<Typography variant={`body1`}>Nhãn: {truthUnit.label}</Typography>
						</Stack>
					</Card>
				})}
		</Grid>
	}

	private getDoneQty = (job: Job): number => {
		if (job.tasks.length > 0) {
			let returnVal = 0;
			job.tasks.forEach(task => {
				if (task.passed) returnVal += task.unit_qty;
			})
			return returnVal;
		} else return 0;
	}
	private renderJobDetail = () => {
		const {jobDetail,} = this.state;
		const doneQty = this.getDoneQty(jobDetail);
		return <Paper sx={{
			width: "calc(50% - 70px)",
			display: "inline-block",
			p: "20px",
			height: "calc(100vh - 64px - 80px)",
			overflowY: "auto",
		}}>
			<Stack direction={"column"} spacing={"20px"}>
				<Typography variant="h5" sx={{fontWeight: 500}}>{jobDetail.name}</Typography>
				<Typography variant="body1" sx={{fontWeight: 300}}>{jobDetail.description}</Typography>
				<Stack direction={"column"} spacing={"10px"}>
					<Typography variant="h6">Tiến độ</Typography>
					<LinearProgress
						variant="buffer"
						valueBuffer={jobDetail.accepted_qty * 100 / jobDetail.unit_qty}
						value={doneQty * 100 / jobDetail.unit_qty}
					/>
					<Typography variant="body1" sx={{fontWeight: 300}}>
						Đã gán nhãn thành công {doneQty}/{jobDetail.unit_qty} đơn vị dữ liệu <br/>
						Đã phân công {jobDetail.accepted_qty}/{jobDetail.unit_qty} đơn vị dữ liệu
					</Typography>
				</Stack>
				<Typography variant="h6">Thông tin chi tiết</Typography>
				{this.renderPropertyTable()}
			</Stack>
		</Paper>
	}

	private renderPropertyTable = () => {
		const {jobDetail,} = this.state;
		const detailTableProps = [];
		if (!!jobDetail) {
			// TODO: Remove hard codes
			detailTableProps.push(
				{property: "Requester", value: `${jobDetail.requester.full_name}`},
				{property: "Deadline", value: `${"10 ngày"}`},
				{property: "Số lượng đơn vị dữ liệu", value: `${jobDetail.unit_qty}`},
				{property: "Số lượng Ground Truth", value: `${jobDetail.truth_qty}`},
				{property: "Số lượng dữ liệu chung", value: `${jobDetail.shared_qty}`},
				{property: "Thể loại", value: `Chuyển đổi giọng nói thành văn bản`},
				{property: "Số lượng tối thiểu để nhận việc", value: `${jobDetail.accepted_threshold}`},
				{property: "Ngưỡng tự động chấp nhận", value: `${jobDetail.accepted_threshold}%`},
				{property: "Ngưỡng được thưởng", value: `${jobDetail.bonus_threshold}%`},
				{property: "Lương/đơn vị dữ liệu", value: `${jobDetail.unit_wage} VND`},
				{property: "Thưởng/đơn vị dữ liệu", value: `${jobDetail.unit_bonus} VND`},
				{property: "Ngày đăng", value: `${jobDetail.created_at}`},
			)
		}
		return <TableContainer component={Paper}>
			<Table aria-label="customized table">
				<TableBody>
					{detailTableProps.map((row: any, index: number) => {
						return <StyledTableRow
							key={index}
							sx={{'&:last-child td, &:last-child th': {border: 0}}}
						>
							<StyledTableCell
								sx={{fontWeight: 500}}
							>{row.property}</StyledTableCell>
							<StyledTableCell>{row.value}</StyledTableCell>
						</StyledTableRow>
					})}
				</TableBody>
			</Table>
		</TableContainer>
	}
}