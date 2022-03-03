import {
	Avatar,
	Box,
	Button,
	Card,
	CardHeader,
	Chip,
	FormControl, FormHelperText,
	Grid,
	InputAdornment,
	InputLabel,
	MenuItem,
	Modal,
	OutlinedInput,
	Rating,
	Select,
	Stack,
	Typography
} from "@mui/material";
import React from "react";
import * as generalActions from "../../../../redux/general/actions";
import * as snackBarActions from "../../../../redux/snackbar/actions";
import {SnackBarType} from "../../../../utils/enumerates";
import {connect} from "react-redux";
import jobAPI from "../../../../api/jobAPI";
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import {Job} from "../../../../type";
import Utils, {BorderLinearProgress} from "../../../../utils/utils";
import SearchIcon from '@mui/icons-material/Search';
import "./../index.scss";
import taskAPI from "../../../../api/taskAPI";
import {modalStyle} from "../../../../utils/utils";

const mapDispatcherToProps =
	(dispatch: any): IJobListPropsFromDispatch => {
		return {
			showSnackBar: (pMsg: string, pDuration: number, pType: SnackBarType) => dispatch(snackBarActions.showSnackBar(pMsg, pDuration, pType)),
			showTopLoading: () => dispatch(generalActions.showTopLoading()),
			hideTopLoading: () => dispatch(generalActions.hideTopLoading()),
		}
	}

interface IJobListPropsFromDispatch {
	showTopLoading?: () => void;
	hideTopLoading?: () => void;
	showSnackBar?: (pMsg: string, pDuration: number, pType: SnackBarType) => void;
}

type IJobListProps = IJobListPropsFromDispatch;

interface IJobListState {
	jobs: Job[];
	searchContent: string;
	categoryFilter: number;
	hasBonusFilter: number;
	noOfTaskUnits: number;
	showRequestModal: boolean;
	modalJob?: Job;
	qtySelectError: boolean;
}

@(connect(null, mapDispatcherToProps) as any)
export default class JobList extends React.Component<IJobListProps, IJobListState> {
	constructor(props: IJobListProps) {
		super(props);
		this.state = {
			jobs: [],
			searchContent: "",
			categoryFilter: -1,
			hasBonusFilter: -1,
			showRequestModal: false,
			noOfTaskUnits: 0,
			qtySelectError: false,
		}
	}

	componentDidMount() {
		this.reloadJobList();
	}

	private reloadJobList = () => {
		this.props.showTopLoading!();
		jobAPI.getAllJobs().then(res => {
			// TODO: validate
			if (res.status && res.status === 200 && res.data && res.data.total && res.data.results) {
				this.setState({
					jobs: res.data.results,
				})
			}
		}).finally(() => this.props.hideTopLoading!());
	}

	render() {
		return <Stack direction={"column"} spacing={"20px"}>
			<Typography
				variant={`h5`}
				sx={{color: "#5c9bcb", textAlign: "center"}}
			>
				TÌM KIẾM CÔNG VIỆC
			</Typography>
			{this.renderSearchBar()}
			{this.renderJobFilters()}
			{this.renderJobList()}
			{this.renderRequestModal()}
		</Stack>
	}

	private renderJobFilters = () => {
		return <Grid container spacing={0} sx={{pr: "20px", pl: "20px"}}>
			<Grid item sx={{mr: 2,}}>
				<FormControl sx={{minWidth: "100px"}}>
					<InputLabel id="select-category-label">Thể loại</InputLabel>
					<Select
						labelId="select-category"
						id="select-category"
						value={this.state.categoryFilter}
						label="Thể loại"
						onChange={event => this.setState({
							categoryFilter: event.target.value as number
						})}
					>
						<MenuItem value={-1}>
							Tất cả
						</MenuItem>
						<MenuItem value={0}>
							Chuyển đổi giọng nói thành văn bản
						</MenuItem>
						<MenuItem value={1}>
							Phân loại văn bản
						</MenuItem>
					</Select>
				</FormControl>
				<FormControl sx={{ml: "20px", minWidth: "100px"}}>
					<InputLabel id="select-bonus-label">Có thưởng</InputLabel>
					<Select
						labelId="select-bonus"
						id="select-bonus"
						value={this.state.hasBonusFilter}
						label="Có thưởng"
						onChange={event => this.setState({
							hasBonusFilter: event.target.value as number
						})}
					>
						<MenuItem value={-1}>
							Tất cả
						</MenuItem>
						<MenuItem value={0}>
							Có
						</MenuItem>
						<MenuItem value={1}>
							Không
						</MenuItem>
					</Select>
				</FormControl>
			</Grid>
		</Grid>
	}

	private renderSearchBar = () => {
		return <Stack direction={`row`} sx={{pr: "20px", pl: "20px"}}>
			<FormControl sx={{flexGrow: 1}} variant="outlined">
				<OutlinedInput
					id="outlined-adornment-amount"
					value={this.state.searchContent}
					placeholder={`Nhập công việc mà bạn muốn tìm kiếm`}
					onChange={event => this.setState({searchContent: event.target.value})}
					startAdornment={<InputAdornment position="start"><SearchIcon/></InputAdornment>}
				/>
			</FormControl>
			<Button
				variant={`contained`}
				sx={{ml: "10px", pr: "40px", pl: "40px", backgroundColor: "#5c9bcb"}}
			>
				Tìm kiếm
			</Button>
		</Stack>
	}

	private renderJobButtons = (job: Job) => {
		return <Stack direction={`row`} spacing={`20px`}>
			<Chip
				color="primary"
				label={Utils.getJobCategoryString(job.category)}
				variant="outlined"
			/>
			{!!job.unit_bonus && <Chip
          label={`Bonus ${job.unit_bonus} VND`}
          color="error"
          variant="outlined"
      />}
			{job.unit_wage >= 100 && <Chip
          label={`Việc HOT lương cao!`}
          color="error"
      />}
			<Box sx={{flexGrow: 1}}/>
			<Button
				variant={`contained`}
				onClick={() => this.setState({
					modalJob: job,
					showRequestModal: true,
				})}
			>
				Nhận việc ngay
			</Button>
		</Stack>
	}

	private renderJobProgress = (job: Job) => {
		return <Stack spacing={`10px`}>
			<Typography
				variant={`body1`}
			>
				Tiến độ
			</Typography>
			<BorderLinearProgress
				variant={`determinate`}
				value={job.accepted_qty * 100 / job.unit_qty}
			/>
			<Typography
				variant={`body1`}
				sx={{fontWeight: 300}}
			>
				{job.accepted_qty}/{job.unit_qty} đơn vị dữ liệu
			</Typography>
		</Stack>
	}

	private getTimeAgo = (timeString: string): string => {
		const minuteAgo = Math.round(
			Math.abs(Date.now() - Date.parse(timeString)) / 1000 / 60);
		if (minuteAgo < 60) return `${minuteAgo} phút trước`;
		const hourAgo = Math.round(minuteAgo / 60);
		return hourAgo < 24 ?
			`${hourAgo} giờ trước` : `${Math.floor(hourAgo / 24)} ngày trước`;
	}

	private renderModalButtons = () => {
		const unitQtyOptions: number[] = [];
		const {modalJob, qtySelectError} = this.state;
		if (!!modalJob) {
			// const slot = modalJob.min_qty - modalJob.truth_qty - modalJob.shared_qty;
			const remainJobQty = modalJob.unit_qty - modalJob.accepted_qty;

			for (let i = 0; modalJob.min_qty + i * modalJob.min_qty <= remainJobQty; ++i) {
				if (modalJob.min_qty + (i + 1) * modalJob.min_qty > remainJobQty) {
					unitQtyOptions.push(remainJobQty);
				} else {
					unitQtyOptions.push(modalJob.min_qty + i * modalJob.min_qty);
				}
			}
		}

		return <Stack direction={`row-reverse`} spacing={`20px`}>
			<Button
				variant={`contained`}
				color={`error`}
				sx={{width: "200px"}}
				onClick={() => this.setState({
					showRequestModal: false,
					noOfTaskUnits: 0,
					qtySelectError: false,
				})}>
				Hủy bỏ
			</Button>
			<Button
				variant={`contained`}
				sx={{width: "200px"}}
				onClick={() => {
					if (this.state.noOfTaskUnits && modalJob) {
						this.props.showTopLoading!();
						taskAPI.create(modalJob.id, this.state.noOfTaskUnits).then(res => {
							if (res.status === 201) {
								this.props.showSnackBar!(
									"Gửi yêu cầu nhận việc thành công!",
									10000,
									SnackBarType.Success,
								);
								this.reloadJobList();
								this.setState({
									showRequestModal: false,
									noOfTaskUnits: 0,
									qtySelectError: false,
								});
							} else {
								this.props.showSnackBar!(
									"Gửi yêu cầu nhận việc thất bại!",
									10000,
									SnackBarType.Error,
								);
							}
						}).catch(err => {
							this.props.showSnackBar!(
								"Gửi yêu cầu nhận việc thất bại! " + err.message,
								10000,
								SnackBarType.Error,
							);
						}).finally(() => this.props.hideTopLoading!())
					} else {
						this.setState({qtySelectError: true});
					}
				}}
			>
				Yêu cầu
			</Button>
			<FormControl
				error={qtySelectError}
				sx={{minWidth: "200px"}}
			>
				<InputLabel id="select-category-label">Số lượng</InputLabel>
				<Select
					labelId="select-category"
					id="select-category"
					value={this.state.noOfTaskUnits}
					label="Số lượng"
					onChange={event => this.setState({
						noOfTaskUnits: event.target.value as number,
						qtySelectError: false,
					})}
				>
					{unitQtyOptions.map(opt => <MenuItem value={opt}>{opt}</MenuItem>)}
				</Select>
				{qtySelectError && <FormHelperText>Bắt buộc</FormHelperText>}
			</FormControl>
		</Stack>
	}

	private renderJobHeader = (job: Job) => {
		return <Stack spacing={"10px"}>
			<CardHeader
				sx={{p: 0}}
				avatar={
					<Avatar
						sx={{
							bgcolor: job.requester.gender == 1 ? "#2196F3" : "#8a25b1"
						}}>
						{job.requester.gender == 1 ? <MaleIcon/> : <FemaleIcon/>}
					</Avatar>
				}
				title={<Stack direction={`row`}>
					<Typography>
						{job.requester.full_name}
					</Typography>
					<Box sx={{flexGrow: 1}}/>
					<Typography sx={{color: "#c4c4c4"}}>
						<em>{this.getTimeAgo(job.created_at)}</em>
					</Typography>
				</Stack>}
				subheader={
					<Typography
						variant={`body2`}
						sx={{fontWeight: 300}}
					>
						<Rating
							style={{fontSize: "1.3rem"}}
							readOnly
							defaultValue={job.requester.rating}
							precision={0.1}
						/>
						<span style={{verticalAlign: "top"}}>
							{/*{TODO change}*/}
			{/*{` (${job.requester.task_c} lượt đánh giá)`}*/}
			{` (1 lượt đánh giá)`}
				</span>
					</Typography>
				}
			/>
			<Typography
				variant={`body1`}
			>
				{job.name}
			</Typography>
		</Stack>
	}

	private renderJobDetail = (job: Job) => {
		return <Typography
			variant={`body1`}
			sx={{fontWeight: 300}}
		>
			Mô tả: {job.description} <br/>
			Chi tiết: <br/>
			<Box>
				<Typography
					variant={`body1`}
					sx={{
						ml: "20px",
						fontWeight: 300,
						width: "max-content",
						display: "inline-block"
					}}
				>
					- Deadline: 10 ngày <br/>
					- Ngưỡng chấp nhận: {job.accepted_threshold}% <br/>
					- Ngưỡng thưởng: {job.bonus_threshold}% <br/>
				</Typography>
				<Typography
					variant={`body1`}
					sx={{
						ml: "100px",
						fontWeight: 300,
						width: "max-content",
						display: "inline-block"
					}}
				>
					- Lương/Đơn vị dữ liệu: {job.unit_wage} VND<br/>
					- Thưởng/Đơn vị dữ liệu: {job.unit_bonus} VND<br/>
					- Nhận tối thiểu: {job.min_qty} đơn vị dữ liệu <br/>
				</Typography>
			</Box>
		</Typography>
	}

	private renderJob = (job: Job) => {
		return <Card
			sx={{p: "20px", mb: "20px"}}
		>
			<Stack spacing={`10px`}>
				{this.renderJobHeader(job)}
				{this.renderJobDetail(job)}
				{this.renderJobProgress(job)}
				{this.renderJobButtons(job)}
			</Stack>
		</Card>
	}

	private renderJobList = () => {
		return <Box
			className={`job-list-stack`}
			sx={{
				pt: "5px",
				pl: "20px",
				pr: "10px",
				height: "calc(100vh - 64px - 60px - 230px)",
				overflowY: "auto"
			}}
		>
			{this.state.jobs.map(job => this.renderJob(job))}
		</Box>
	}

	private renderRequestModal = () => {
		const job = this.state.modalJob;
		return !!job && <Modal
        open={this.state.showRequestModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
    >
        <Box sx={modalStyle}>
            <Stack spacing={`10px`}>
							{this.renderJobHeader(job)}
							{this.renderJobDetail(job)}
							{this.renderJobProgress(job)}
							{this.renderModalButtons()}
            </Stack>
        </Box>
    </Modal>
	}
}