import { Box, Button, Typography, List, ListItem, ListItemButton, IconButton, ListItemAvatar, Avatar, ListItemText } from "@mui/material";
import React from "react";
import "./index.scss";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Link from '@mui/material/Link';
import history from "../../../history";
import jobAPI from "../../../api/jobAPI";
import FolderIcon from '@mui/icons-material/Folder';
import DeleteIcon from '@mui/icons-material/Delete';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import ReportIcon from '@mui/icons-material/Report';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export const StyledTableCell = styled(TableCell)(({ theme }) => ({
	[`&.${tableCellClasses.head}`]: {
		backgroundColor: "#1976d2",
		color: theme.palette.common.white,
	},
	[`&.${tableCellClasses.body}`]: {
		fontSize: 14,
	},
}));

export const StyledTableRow = styled(TableRow)(({ theme }) => ({
	'&:nth-of-type(odd)': {
		backgroundColor: theme.palette.action.hover,
	},
	// hide last border
	'&:last-child td, &:last-child th': {
		border: 0,
	},
}));

interface IJobManagementState {
	jobList: any[];
}

export default class JobManagement extends React.Component<{}, IJobManagementState> {
	public constructor(props: any) {
		super(props);
		this.state = {
			jobList: []
		}
	}

	public componentDidMount() {
		jobAPI.getOwnedJobs().then(res => {
			console.log(res);
			if (
				!!res &&
				!!res.data &&
				!!res.status &&
				res.status === 200 &&
				res.data.results.length > 0
			) {
				this.setState({ jobList: res.data.results })
			}
		})
	}

	public render() {
		return (
			<Paper className={`job-management-container`}>
				<Typography
					variant="h6"
					component="div"
				>
					Quản lý công việc
				</Typography>
				{
					this.state.jobList.length === 0 &&
					<Typography
						variant="h6"
						component="div"
						sx={{
							mb: "20px",
							fontStyle: "bold",
							textAlign: "center",
							// width: "100vw",
						}}
					>
						Hiện tại chưa có việc làm nào được tạo. Tạo việc làm mới ngay!
					</Typography>
				}

				{this.state.jobList.length > 0 &&
					<TableContainer sx={{ mt: 2 }} component={Paper}>
						<Table aria-label="customized table">
							<TableHead>
								<StyledTableRow>
									<StyledTableCell>ID</StyledTableCell>
									<StyledTableCell align="center">Tóm tắt</StyledTableCell>
									<StyledTableCell align="center">Mô tả</StyledTableCell>
									<StyledTableCell align="center">Tiến độ</StyledTableCell>
									<StyledTableCell align="center">Ngày tạo</StyledTableCell>
									<StyledTableCell align="center">Ngưỡng chấp nhận</StyledTableCell>
									<StyledTableCell align="center">Lương/Đơn vị</StyledTableCell>
									<StyledTableCell align="center">Trạng thái</StyledTableCell>
								</StyledTableRow>
							</TableHead>
							<TableBody>
								{this.state.jobList.slice(0).reverse().map((row) => (
									<StyledTableRow
										key={row.name}
										sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
									>
										<StyledTableCell >{row.id}</StyledTableCell>
										<StyledTableCell component="th" scope="row">
											<Link
												href={row.truth_qty_ready?`/requester/job/${row.id}`:`/requester/job/${row.id}/annotatetruth/`}
												sx={{ cursor: "pointer" }}
											>
												{row.name}
											</Link>
										</StyledTableCell>
										<StyledTableCell >{row.description}</StyledTableCell>
										<StyledTableCell align="center">{`${row.accepted_qty}/${row.unit_qty}`}</StyledTableCell>
										<StyledTableCell align="center">{row.created_at.split('T')[0]}</StyledTableCell>
										<StyledTableCell align="center">{`${row.accepted_threshold}%`}</StyledTableCell>
										<StyledTableCell align="center">{`${row.unit_wage} VND`}</StyledTableCell>
										<StyledTableCell align="center">{row.truth_qty_ready ?
											<Box>
												<CheckCircleIcon sx={{ fontSize: "1.1rem" }} color="success" /> <span style={{ verticalAlign: "top" }}>Sẵn sàng</span>
											</Box> :
											<Box>
												<ReportIcon sx={{ fontSize: "1.1rem" }} color="warning" /> <span style={{ verticalAlign: "top" }} >Chưa sẵn sàng</span>
											</Box>
										}</StyledTableCell>
									</StyledTableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				}
				<Box sx={{ flexGrow: 1 }} />
				<Button
					sx={{ width: "max-content" }}
					variant="contained"
					className={`btn-create-new-prj`}
					onClick={() => history.push("/requester/createjob")}
				>
					Tạo việc làm mới
				</Button>
			</Paper >
		)
	}
}