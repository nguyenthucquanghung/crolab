import { Box, Button, Typography,Stack, List, ListItem, ListItemButton, IconButton, ListItemAvatar, Avatar, ListItemText } from "@mui/material";
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
import history from "../../history";
import jobAPI from "../../api/jobAPI";
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

export default class RankingBoard extends React.Component<{}, IJobManagementState> {
	public constructor(props: any) {
		super(props);
		this.state = {
			jobList: []
		}
	}

	public render() {
    const ranking=[
      {
        id: 3,
        unit_qty: 62,
        accuracy: 89,
        income: 6820,
        date: "02/01/2022",
        task_qty: 3,
        rating: 5.0,
        name: "Nguyễn Thức Quang Hưng"
      },
      {
        id: 6,
        unit_qty: 77,
        task_qty: 4,
        date: "12/01/2022",
        income: 7700,
        accuracy: 72,
        rating: 4.5,
        name: "Trần Đức Giang"
      },
      {
        id: 4,
        unit_qty: 23,
        date: "06/01/2022",
        task_qty: 2,
        rating: 4.8,
        accuracy: 92,
        income: 2530,
        name: "Vũ Huy Bằng"
      },
      {
        id: 2,
        unit_qty: 13,
        date: "08/12/2021",
        income: 1430,
        task_qty: 1,
        rating: 5.0,
        accuracy: 100,
        name: "Trịnh Thị Hồng",
      },
      {
        id: 8,
        unit_qty: 10,
        date: "12/01/2022",
        income: 1100,
        accuracy: 100,
        task_qty: 1,
        rating: 5.0,
        name: "Phạm Khắc Bằng"
      },
    ]
		return (
			<Paper className={`job-management-container`}>
				<Typography
					variant="h6"
					component="div"
				>
					Bảng xếp hạng Annotator
				</Typography>
				{
					ranking.length === 0 &&
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

				{ranking.length > 0 &&
					<TableContainer sx={{ mt: 2 }} component={Paper}>
						<Table aria-label="customized table">
							<TableHead>
								<StyledTableRow>
									<StyledTableCell>ID</StyledTableCell>
									<StyledTableCell align="center">Họ và tên</StyledTableCell>
									<StyledTableCell align="center">Số lượng nhãn đã gán</StyledTableCell>
									<StyledTableCell align="center">Số lượng công việc đã hoàn thành</StyledTableCell>
									<StyledTableCell align="center">Ngày tham gia</StyledTableCell>
									<StyledTableCell align="center">Độ chính xác</StyledTableCell>
									<StyledTableCell align="center">Số tiền kiếm được</StyledTableCell>
									<StyledTableCell align="center">Đánh giá</StyledTableCell>
								</StyledTableRow>
							</TableHead>
							<TableBody>
								{ranking.slice(0).map((row) => (
									<StyledTableRow
										key={row.name}
										sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
									>
										<StyledTableCell >{row.id}</StyledTableCell>
										<StyledTableCell component="th" scope="row">
											<Link
												href={true?`/requester/job/${row.id}`:`/requester/job/${row.id}/annotatetruth/`}
												sx={{ cursor: "pointer" }}
											>
												{row.name}
											</Link>
										</StyledTableCell>
										<StyledTableCell align="center">{`${row.unit_qty}`}</StyledTableCell>
										<StyledTableCell align="center">{`${row.task_qty}`}</StyledTableCell>
										<StyledTableCell align="center">{`${row.date}`}</StyledTableCell>
										<StyledTableCell align="center">{`${row.accuracy}%`}</StyledTableCell>
										<StyledTableCell align="center">{`${row.income} VND`}</StyledTableCell>

										<StyledTableCell align="center">{`${row.rating}/5` }</StyledTableCell>
                  
                  </StyledTableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				}
				<Box sx={{ flexGrow: 1 }} />
        <Stack direction={`row`} spacing={2}>
        <Button
					sx={{ width: "max-content" }}
					variant="contained"
					className={`btn-create-new-prj`}
					onClick={() => history.push("/requester/createjob")}
				>
					BXH Requester
				</Button>
        <Button
          color={`success`}
					sx={{ width: "max-content", color: "white" }}
					variant="contained"
					className={`btn-create-new-prj`}
					onClick={() => history.push("/requester/createjob")}
				>
					Quay lại
				</Button>
        </Stack>
				
			</Paper >
		)
	}
}