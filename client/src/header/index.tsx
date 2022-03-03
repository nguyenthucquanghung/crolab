import { AppBar, Button, Box, Toolbar, Stack, Typography, IconButton, Avatar } from "@mui/material";
import React from "react";
import "./index.scss";
import AccountCircle from '@mui/icons-material/AccountCircle';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import history from "../history";
import NotificationsIcon from '@mui/icons-material/Notifications';
import MaleIcon from '@mui/icons-material/Male';

interface IHeaderState {
	anchorEl: any;
	anchorElNoti: any;
	menuIsOpen: boolean;
	notiIsOpen: boolean;
}

export default class Header extends React.Component<{ inLoginScreen: boolean, currentPath: string }, IHeaderState> {
	constructor(props: any) {
		super(props);
		this.state = {
			anchorEl: null,
			anchorElNoti: null,
			menuIsOpen: false,
			notiIsOpen: false,
		}
	}

	private handleMenuOpen = (event: any) => {
		this.setState({ anchorEl: event.currentTarget, menuIsOpen: true });
	};
	private handleMenuClose = () => {
		this.setState({ anchorEl: null, menuIsOpen: false });
	};

	private handleNotiOpen = (event: any) => {
		this.setState({ anchorElNoti: event.currentTarget, notiIsOpen: true });
	};
	private handleNotiClose = () => {
		this.setState({ anchorElNoti: null, notiIsOpen: false });
	};
	private handleLogout = () => {
		this.setState({ anchorEl: null, menuIsOpen: false });
		localStorage.setItem("loggedIn", "0");
		localStorage.setItem("userFullName", "");
		localStorage.setItem("accessToken", "")
		localStorage.setItem("refreshToken", "")
		localStorage.setItem("userId", "")
		localStorage.setItem("accessExpires", "")
		localStorage.setItem("refreshExpires", "")
		history.push("/login")
	};

	render() {
		const { inLoginScreen, currentPath } = this.props;
		return (
			<AppBar position="static">
				<Toolbar className={`header-container`} sx={{ p: { md: "auto 20vw" } }}>
					<div className={`div-logo-home`} onClick={() => history.push("/")}>
						<img className={`img-home`} src='/crolab_logo.png' alt='crolab_logo' />
					</div>
					<Typography variant="h6" component="div" sx={{ flexGrow: 1, display: { xs: 'none', sm: 'none', md: 'block' } }}>
						Crowdsourcing platform
					</Typography>
					<Typography component="div" sx={{ flexGrow: 1, display: { xs: 'block', sm: 'block', md: 'none' } }}>
					</Typography>
					{localStorage.getItem('loggedIn') === "1" && currentPath !== "/login" && currentPath !== "/register" && <Button color="inherit">
						BXH Thành viên
					</Button>}
					{localStorage.getItem('loggedIn') === "1" && currentPath !== "/login" && currentPath !== "/register" &&<IconButton onClick={this.handleNotiOpen} sx={{ color: "white", mr: 2, ml: 2 }}>

						<NotificationsIcon />
					</IconButton>}
					{localStorage.getItem('loggedIn') === "1" && <Button
						color="inherit"
						onClick={this.handleMenuOpen}
					>
						{localStorage.getItem('userFullName')}
						<AccountCircle sx={{ ml: 3 }} />
					</Button>}
					{localStorage.getItem('loggedIn') !== "1" && !inLoginScreen && <Button
						color="inherit"
						onClick={() => {
							history.push("/login")
						}}
					>
						{`Đăng nhập`}
					</Button>}
					{localStorage.getItem('loggedIn') !== "1" && inLoginScreen && <Button
						color="inherit"
						onClick={() => {
							history.push("/register")
						}}
					>
						{`Đăng ký`}
					</Button>}
				</Toolbar>
				<Menu
					anchorEl={this.state.anchorEl}
					anchorOrigin={{
						vertical: 'bottom',
						horizontal: 'right',
					}}
					id={`profile-menu`}
					keepMounted
					transformOrigin={{
						vertical: 'top',
						horizontal: 'right',
					}}
					open={this.state.menuIsOpen}
					onClose={this.handleMenuClose}
				>
					<MenuItem onClick={this.handleMenuClose}>Cập nhật thông tin cá nhân</MenuItem>
					<MenuItem onClick={this.handleMenuClose}>Đổi mật khẩu</MenuItem>
					<MenuItem onClick={this.handleLogout}>Đăng xuất</MenuItem>
				</Menu>

				<Menu
					anchorEl={this.state.anchorElNoti}
					anchorOrigin={{
						vertical: 'bottom',
						horizontal: 'right',
					}}
					id={`profile-menu`}
					keepMounted
					transformOrigin={{
						vertical: 'top',
						horizontal: 'right',
					}}
					open={this.state.notiIsOpen}
					onClose={this.handleNotiClose}
				>
					<MenuItem onClick={this.handleNotiClose}>
						<Stack direction={`row`} spacing={1}>
							<Avatar sx={{ bgcolor: "#2196F3" }}>
								<MaleIcon />
							</Avatar>
							<Typography variant="body1" sx={{ fontWeight: 600 }}>
								Requester Demo
							</Typography>
							<Typography variant="body1">
								đã chấp nhận yêu cầu công việc của bạn
							</Typography>
							<Typography sx={{ color: "#c4c4c4", ml: "20px" }}>
								<em>{`4 giờ trước`}</em>
							</Typography>
						</Stack>

					</MenuItem>
					<MenuItem sx={{mt:1}} onClick={this.handleNotiClose}>
					<Stack direction={`row`} spacing={1}>
							<Avatar sx={{ bgcolor: "#2196F3" }}>
								<MaleIcon />
							</Avatar>
							<Typography variant="body1" sx={{ fontWeight: 600, mt:1 }}>
								Requester Demo
							</Typography>
							<Typography variant="body1">
							đã tạo một việc làm mới
							</Typography>
							<Box sx={{flexGrow: 1}}/>
							<Typography sx={{ color: "#c4c4c4", ml: "20px" }}>
								<em>{`6 giờ trước`}</em>
							</Typography>
						</Stack>
					</MenuItem>
					<MenuItem sx={{mt:1}} onClick={this.handleNotiClose}>
					<Stack direction={`row`} spacing={1}>
							<Avatar sx={{ bgcolor: "#2196F3" }}>
								<MaleIcon />
							</Avatar>
							<Typography variant="body1" sx={{ fontWeight: 600 }}>
								Requester Demo
							</Typography>
							<Typography variant="body1">
								đã tạo một việc làm mới
							</Typography>
							<Box sx={{flexGrow: 1}}/>
							<Typography sx={{ color: "#c4c4c4", ml: "20px" }}>
								<em>{`6 giờ trước`}</em>
							</Typography>
						</Stack>
					</MenuItem>
				</Menu>
			</AppBar>
		)
	}
}