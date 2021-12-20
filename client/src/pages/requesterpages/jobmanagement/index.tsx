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
const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: "#1976d2",
        color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
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
        jobAPI.getAllJobs().then(res => {
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
                <Button
                    variant="contained"
                    className={`btn-create-new-prj`}
                    onClick={() => history.push("/createjob")}
                >
                    Tạo việc mới
                </Button>
                {
                    <TableContainer sx={{mt:2}} component={Paper}>
                        <Table aria-label="customized table">
                            <TableHead>
                                <StyledTableRow>
                                    <StyledTableCell>Tên Job</StyledTableCell>
                                    {/* <StyledTableCell align="center">Quản lý Job</StyledTableCell> */}
                                    <StyledTableCell align="center">Mô tả</StyledTableCell>
                                    {/* <StyledTableCell align="center">Mệnh đề</StyledTableCell>
                                    <StyledTableCell align="center">Tiến trình</StyledTableCell> */}
                                    {/* <StyledTableCell align="center">Elasticsearch Index</StyledTableCell>  */}
                                </StyledTableRow>
                            </TableHead>
                            <TableBody>
                                {this.state.jobList.map((row) => (
                                    <StyledTableRow
                                        key={row.name}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <StyledTableCell component="th" scope="row">
                                            <Link
                                                href={`/job/${row.id}`}
                                                sx={{ cursor: "pointer" }}
                                            >
                                                {row.name}
                                            </Link>
                                        </StyledTableCell>
                                        {/* <StyledTableCell align="center">{row.owner?.full_name}</StyledTableCell> */}
                                        <StyledTableCell align="center">{row.description}</StyledTableCell>
                                        {/* <StyledTableCell align="center">{row.total}</StyledTableCell>
                                        <StyledTableCell align="center">{row.done}/{row.total}</StyledTableCell> */}
                                        {/* <StyledTableCell align="center">{row.es_id}</StyledTableCell>  */}
                                    </StyledTableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                }
                {
                    this.state.jobList.length === 0 &&
                    <Typography
                        variant="h3"
                        component="div"
                        sx={{
                            mt: "20px",
                            fontStyle: "bold",
                            textAlign: "center",
                            width: "100vw",
                        }}
                    >
                        Hiện tại bạn đang không tham gia bất kỳ Job nào, vui lòng tạo một Job mới!
                    </Typography>
                }
            </Paper >
        )
    }
}